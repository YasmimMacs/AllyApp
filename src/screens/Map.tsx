import React, { useEffect, useRef, useState, useCallback } from "react";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Callout,
  Region,
} from "react-native-maps";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootNavigator";
import {
  getCurrentPositionAsync,
  watchPositionAsync,
  LocationAccuracy,
  LocationObject,
  LocationObjectCoords,
} from "expo-location";
import { useLocationPermission } from "../hooks/useLocationPermission";
import { LocationPermissionBanner } from "../components/LocationPermissionBanner";
import { useReverseGeocode } from "../hooks/useReverseGeocode";
import { Toast } from "../components/Toast";
import * as Location from "expo-location";
import { getMapProvider, getMapProviderName } from "../utils/mapProvider";

type MapScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  keyof RootStackParamList
>;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth >= 768;

// Responsive scaling functions
const scale = (size: number): number => {
  const baseWidth = 375;
  const scaleFactor = screenWidth / baseWidth;
  return Math.round(size * scaleFactor);
};

const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

interface SafetyZone {
  id: string;
  name: string;
  type: "safe" | "caution" | "unsafe";
  safetyScore: number;
  lighting: string;
  crowdLevel: string;
  position: { left: number; top: number };
  coordinates: { latitude: number; longitude: number };
  recentReports: Array<{
    text: string;
    user: string;
    time: string;
    type: "positive" | "warning" | "negative";
  }>;
  tips: string[];
}

export default function MapScreen() {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);

  const {
    status: permissionStatus,
    requestPermission,
    openSettings,
    isLoading: isPermissionLoading,
  } = useLocationPermission();

  // New optimized reverse geocoding hook
  const {
    address: currentAddress,
    loading: isAddressLoading,
    error: addressError,
    fetchFor: fetchAddress,
  } = useReverseGeocode(50);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);
  const [showZoneDetails, setShowZoneDetails] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [currentCoords, setCurrentCoords] =
    useState<LocationObjectCoords | null>(null);
  const [locationSubscription, setLocationSubscription] = useState<any>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: -33.828, // Default to Sydney coordinates
    longitude: 151.2153,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Search functionality state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      address: string;
      coordinates: { latitude: number; longitude: number };
    }>
  >([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Toast state for showing geocoding errors
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "error" | "warning" | "success" | "info"
  >("error");

  const filters = ["All", "Lighting", "Crowd Level", "Reports", "Safe Places"];

  const safetyZones: SafetyZone[] = [
    {
      id: "1",
      name: "Sydney CBD",
      type: "safe",
      safetyScore: 9,
      lighting: "Excellent",
      crowdLevel: "High",
      position: { left: 120, top: 100 },
      coordinates: { latitude: -33.8688, longitude: 151.2093 },
      recentReports: [
        {
          text: "Well-lit area with good visibility",
          user: "Sarah M.",
          time: "2h ago",
          type: "positive",
        },
        {
          text: "Security cameras present",
          user: "Community",
          time: "1d ago",
          type: "positive",
        },
      ],
      tips: [
        "Stay in well-lit areas",
        "Be aware of your surroundings",
        "Trust your instincts",
      ],
    },
    {
      id: "2",
      name: "Bondi Beach",
      type: "caution",
      safetyScore: 6,
      lighting: "Fair",
      crowdLevel: "Moderate",
      position: { left: 250, top: 150 },
      coordinates: { latitude: -33.8915, longitude: 151.2767 },
      recentReports: [
        {
          text: "Poor lighting after sunset",
          user: "Anonymous",
          time: "3h ago",
          type: "warning",
        },
        {
          text: "Limited foot traffic at night",
          user: "Community",
          time: "2d ago",
          type: "warning",
        },
      ],
      tips: [
        "Avoid walking alone at night",
        "Use main streets when possible",
        "Carry a flashlight",
      ],
    },
    {
      id: "3",
      name: "Redfern Area",
      type: "unsafe",
      safetyScore: 3,
      lighting: "Poor",
      crowdLevel: "Low",
      position: { left: 80, top: 250 },
      coordinates: { latitude: -33.8936, longitude: 151.2041 },
      recentReports: [
        {
          text: "Multiple safety incidents reported",
          user: "Community",
          time: "1d ago",
          type: "negative",
        },
        {
          text: "No street lighting",
          user: "Anonymous",
          time: "2d ago",
          type: "negative",
        },
      ],
      tips: [
        "Avoid this area completely",
        "Use alternative routes",
        "Report any suspicious activity",
      ],
    },
  ];

  // Get current position when permission is granted
  useEffect(() => {
    console.log("Permission status:", permissionStatus);
    console.log("Current coords:", currentCoords);

    if (permissionStatus === "granted" && !currentCoords) {
      console.log("Getting current position...");
      getCurrentPosition();
    }
  }, [permissionStatus, currentCoords]);

  // Start location tracking when permission is granted and we have initial position
  useEffect(() => {
    if (permissionStatus === "granted" && currentCoords) {
      startLocationTracking();
    }
  }, [permissionStatus, currentCoords]);

  // Show toast when there's a geocoding error
  useEffect(() => {
    if (addressError) {
      setToastMessage(`Geocoding error: ${addressError}`);
      setToastType("error");
      setShowToast(true);
    }
  }, [addressError]);

  const getCurrentPosition = async () => {
    try {
      setIsLoadingLocation(true);
      console.log("Getting current position...");

      const location = await getCurrentPositionAsync({
        accuracy: LocationAccuracy.High,
      });

      console.log("Current position obtained:", location.coords);
      const newCoords = location.coords;
      setCurrentCoords(newCoords);

      // Use new hook to get address
      await fetchAddress(newCoords.latitude, newCoords.longitude);

      // Update map region to center on user's location
      const newRegion = {
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);

      // Animate map to user's location
      if (mapRef.current) {
        console.log("Animating map to user location...");
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      setIsLoadingLocation(false);
    } catch (error) {
      console.error("Error getting current position:", error);
      setIsLoadingLocation(false);
      Alert.alert(
        "Location Error",
        "Failed to get your current location. Please try again."
      );
    }
  };

  const startLocationTracking = () => {
    console.log("Starting location tracking...");

    try {
      const subscription = watchPositionAsync(
        {
          accuracy: LocationAccuracy.High,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 50, // 50 meters - matches our hook threshold
        },
        (location: LocationObject) => {
          console.log("Location update received:", location.coords);
          const newCoords = location.coords;
          setCurrentCoords(newCoords);

          // Use new hook to get address only when position changes significantly
          fetchAddress(newCoords.latitude, newCoords.longitude);

          // Update map region to center on user's location
          const newRegion = {
            latitude: newCoords.latitude,
            longitude: newCoords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setMapRegion(newRegion);
        }
      )
        .then((sub) => {
          console.log("Location subscription created successfully");
          setLocationSubscription(sub);
        })
        .catch((error) => {
          console.error("Location tracking error:", error);
          Alert.alert(
            "Location Error",
            "Failed to start location tracking. Please check your location settings."
          );
        });
    } catch (error) {
      console.error("Error in startLocationTracking:", error);
    }
  };

  // Handle map region change completion (when user stops panning/zooming)
  const handleRegionChangeComplete = (region: Region) => {
    console.log("Map region change complete:", region);
    // Only fetch address when user finishes moving the map
    fetchAddress(region.latitude, region.longitude);
  };

  const getZoneColor = (type: string) => {
    switch (type) {
      case "safe":
        return "#10B981";
      case "caution":
        return "#F59E0B";
      case "unsafe":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case "safe":
        return "checkmark-circle";
      case "caution":
        return "warning";
      case "unsafe":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const handleZonePress = (zone: SafetyZone) => {
    setSelectedZone(zone);
    setShowZoneDetails(true);

    // Update map region to center on the selected zone
    const newRegion = {
      latitude: zone.coordinates.latitude,
      longitude: zone.coordinates.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setMapRegion(newRegion);

    // Animate map to the selected zone
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      "Report Issue",
      "Report functionality will be implemented here"
    );
  };

  const handleGetDirections = () => {
    Alert.alert(
      "Get Directions",
      "Navigation functionality will be implemented here"
    );
  };

  const getCurrentSafetyStatus = () => {
    // If a zone is selected, show its detailed status
    if (selectedZone) {
      return {
        status: `${
          selectedZone.name
        }: ${selectedZone.type.toUpperCase()} Area (Score: ${
          selectedZone.safetyScore
        }/10)`,
        color: getZoneColor(selectedZone.type),
        icon: getZoneIcon(selectedZone.type),
        zone: selectedZone,
      };
    }

    // Otherwise, show status based on current location
    if (!currentCoords)
      return { status: "Unknown", color: "#6B7280", icon: "help-circle" };

    // Find the closest safety zone
    let closestZone = safetyZones[0];
    let minDistance = Number.MAX_VALUE;

    safetyZones.forEach((zone) => {
      const distance = Math.sqrt(
        Math.pow(zone.coordinates.latitude - currentCoords.latitude, 2) +
          Math.pow(zone.coordinates.longitude - currentCoords.longitude, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestZone = zone;
      }
    });

    return {
      status: `You are in a ${closestZone.type} area (${closestZone.name})`,
      color: getZoneColor(closestZone.type),
      icon: getZoneIcon(closestZone.type),
      zone: closestZone,
    };
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleSearch(query);
        }, 500); // 500ms delay
      };
    })(),
    []
  );

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Use reverse geocoding to search for locations
      const results = await Location.geocodeAsync(query);

      if (results.length > 0) {
        // Get address details for each result
        const detailedResults = await Promise.all(
          results.slice(0, 5).map(async (result, index) => {
            try {
              const addresses = await Location.reverseGeocodeAsync({
                latitude: result.latitude,
                longitude: result.longitude,
              });

              const address = addresses[0];
              const addressString = [
                address?.street,
                address?.city,
                address?.region,
                address?.country,
              ]
                .filter(Boolean)
                .join(", ");

              return {
                id: `search-${index}`,
                name: query,
                address: addressString || "Unknown address",
                coordinates: {
                  latitude: result.latitude,
                  longitude: result.longitude,
                },
              };
            } catch (error) {
              return {
                id: `search-${index}`,
                name: query,
                address: "Unknown address",
                coordinates: {
                  latitude: result.latitude,
                  longitude: result.longitude,
                },
              };
            }
          })
        );

        return detailedResults;
      }

      return [];
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  const handleSearchResultSelect = (result: any) => {
    // Move map to selected location
    const newRegion: Region = {
      latitude: result.coordinates.latitude,
      longitude: result.coordinates.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);

    // Clear search
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);

    // Show success toast
    setToastMessage(`Navigated to ${result.name}`);
    setToastType("success");
    setShowToast(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const clearZoneSelection = () => {
    setSelectedZone(null);
    setShowZoneDetails(false);

    // Return map to user's current location if available
    if (currentCoords && mapRef.current) {
      const newRegion = {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const safetyStatus = getCurrentSafetyStatus();

  const filteredSafetyZones = safetyZones.filter((zone) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Lighting") return zone.lighting === "Excellent";
    if (selectedFilter === "Crowd Level")
      return zone.lighting === "Moderate" || zone.lighting === "High";
    if (selectedFilter === "Reports") return zone.recentReports.length > 0;
    if (selectedFilter === "Safe Places") return zone.type === "safe";
    return true;
  });

  // Cleanup location subscription
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        console.log("Cleaning up location subscription...");
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Toast for showing geocoding errors */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={showToast}
        onClose={() => setShowToast(false)}
        duration={5000}
      />

      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Safety Map</Text>
      </View>

      {/* Location Permission Banner */}
      <LocationPermissionBanner
        status={permissionStatus}
        onRequestPermission={requestPermission}
        onOpenSettings={openSettings}
        isLoading={isPermissionLoading}
      />

      {/* Current Location Status - Only show when we have coordinates */}
      {currentCoords && (
        <View style={styles.locationStatusContainer}>
          <View style={styles.locationStatusContent}>
            <Ionicons name="location" size={20} color="#6426A9" />
            <View style={styles.addressContainer}>
              <Text style={styles.locationStatusText}>
                {isAddressLoading ? "Getting address..." : currentAddress}
              </Text>
              {addressError && (
                <Text style={styles.addressErrorText}>{addressError}</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Search and Filters - Fixed above map */}
      <View style={styles.controlsContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location or address..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim()) {
                  debouncedSearch(text);
                } else {
                  clearSearch();
                }
              }}
              onSubmitEditing={() => handleSearch(searchQuery)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSearchResultSelect(item)}
                  >
                    <Ionicons name="location" size={16} color="#6426A9" />
                    <View style={styles.searchResultContent}>
                      <Text style={styles.searchResultName}>{item.name}</Text>
                      <Text style={styles.searchResultAddress}>
                        {item.address}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}
                style={styles.searchResultsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {/* Loading indicator for search */}
          {isSearching && (
            <View style={styles.searchLoadingContainer}>
              <ActivityIndicator size="small" color="#6426A9" />
              <Text style={styles.searchLoadingText}>Searching...</Text>
            </View>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterBadge,
                  selectedFilter === filter && styles.filterBadgeActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Map Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
            <Text style={styles.legendText}>Caution</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
            <Text style={styles.legendText}>Unsafe</Text>
          </View>
        </View>
      </View>

      {/* Map Container - Dedicated container with flex:1 */}
      <View style={styles.mapContainer}>
        {isLoadingLocation || permissionStatus !== "granted" ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6426A9" />
            <Text style={styles.loadingText}>
              {permissionStatus !== "granted"
                ? "Location permission required"
                : "Getting your location..."}
            </Text>
          </View>
        ) : (
          <>
            {/* Map Provider Status */}
            <View style={styles.mapProviderStatus}>
              <Text style={styles.mapProviderText}>Using: Google Maps</Text>
            </View>

            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={mapRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
              showsTraffic={false}
              showsBuildings={true}
              showsIndoors={true}
              onRegionChange={setMapRegion}
              onRegionChangeComplete={handleRegionChangeComplete}
              onMapReady={() => {
                console.log("Map is ready!");
                console.log("Map dimensions:", { flex: 1 });
                console.log("Initial region:", mapRegion);
                console.log("Platform:", Platform.OS);
                console.log("Provider:", getMapProviderName());

                // Center map on user location when ready
                if (currentCoords && mapRef.current) {
                  const newRegion = {
                    latitude: currentCoords.latitude,
                    longitude: currentCoords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  };
                  mapRef.current.animateToRegion(newRegion, 1000);
                }
              }}
              onLayout={() => console.log("Map layout completed")}
            >
              {/* Safety Zone Markers */}
              {filteredSafetyZones.map((zone) => (
                <Marker
                  key={zone.id}
                  coordinate={zone.coordinates}
                  title={zone.name}
                  description={`Safety Score: ${zone.safetyScore}/10`}
                  onPress={() => handleZonePress(zone)}
                  pinColor={getZoneColor(zone.type)}
                  opacity={
                    selectedZone && selectedZone.id === zone.id ? 1 : 0.8
                  }
                >
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{zone.name}</Text>
                      <Text style={styles.calloutSubtitle}>
                        Safety Score: {zone.safetyScore}/10
                      </Text>
                      <Text style={styles.calloutType}>
                        {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}{" "}
                        Area
                      </Text>

                      {/* Show selection indicator */}
                      {selectedZone && selectedZone.id === zone.id && (
                        <View style={styles.selectedZoneIndicator}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#10B981"
                          />
                          <Text style={styles.selectedZoneText}>Selected</Text>
                        </View>
                      )}
                    </View>
                  </Callout>
                </Marker>
              ))}

              {/* Incident Markers */}
              {/* Incident Markers are not part of the static safetyZones, so they are not displayed here */}

              {/* Community Report Markers */}
              {/* Community Report Markers are not part of the static safetyZones, so they are not displayed here */}

              {/* Current Location Marker */}
              {currentCoords && (
                <Marker
                  coordinate={currentCoords}
                  title="Your Location"
                  description={currentAddress || "Current Location"}
                  pinColor="#6426A9"
                />
              )}
            </MapView>

            {/* Loading overlay when fetching data */}
            {isLoadingLocation && (
              <View style={styles.mapLoadingOverlay}>
                <View style={styles.mapLoadingContent}>
                  <ActivityIndicator size="large" color="#6426A9" />
                  <Text style={styles.mapLoadingText}>
                    Getting your location...
                  </Text>
                </View>
              </View>
            )}

            {/* Error overlay when API calls fail */}
            {addressError && (
              <View style={styles.mapErrorOverlay}>
                <View style={styles.mapErrorContent}>
                  <Ionicons name="warning" size={32} color="#EF4444" />
                  <Text style={styles.mapErrorText}>{addressError}</Text>
                  <TouchableOpacity
                    style={styles.mapErrorButton}
                    onPress={() =>
                      currentCoords &&
                      fetchAddress(
                        currentCoords.latitude,
                        currentCoords.longitude
                      )
                    }
                  >
                    <Text style={styles.mapErrorButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* Report Button - Floating over map */}
        <TouchableOpacity style={styles.reportButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Status Bar - Fixed below map */}
      <View
        style={[
          styles.statusBar,
          {
            backgroundColor: safetyStatus.color + "20",
            borderColor: safetyStatus.color,
          },
        ]}
      >
        <Ionicons
          name={safetyStatus.icon as any}
          size={20}
          color={safetyStatus.color}
        />
        <Text style={[styles.statusText, { color: safetyStatus.color }]}>
          {safetyStatus.status}
        </Text>

        {/* Show selected zone indicator */}
        {selectedZone && (
          <TouchableOpacity
            style={styles.clearSelectionButton}
            onPress={clearZoneSelection}
          >
            <Ionicons
              name="close-circle"
              size={16}
              color={safetyStatus.color}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Zone Details Modal */}
      <Modal
        visible={showZoneDetails && selectedZone !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowZoneDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedZone && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedZone.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowZoneDetails(false)}
                  >
                    <Ionicons name="close" size={24} color="#6426A9" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Safety Score */}
                  <View style={styles.safetyScoreContainer}>
                    <Text style={styles.safetyScoreLabel}>Safety Score</Text>
                    <Text
                      style={[
                        styles.safetyScoreValue,
                        {
                          color:
                            selectedZone.safetyScore >= 7.5
                              ? "#10B981"
                              : selectedZone.safetyScore >= 4.0
                              ? "#F59E0B"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {selectedZone.safetyScore}/10
                    </Text>
                  </View>

                  {/* Quick Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Coverage</Text>
                      <Text style={styles.statValue}>
                        {selectedZone.lighting}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Confidence</Text>
                      <Text style={styles.statValue}>
                        {selectedZone.crowdLevel}
                      </Text>
                    </View>
                  </View>

                  {/* Community Info */}
                  {selectedZone.recentReports &&
                    selectedZone.recentReports.length > 0 && (
                      <View style={styles.reportsContainer}>
                        <Text style={styles.reportsTitle}>
                          Community Assessment
                        </Text>
                        {selectedZone.recentReports.map((report, index) => (
                          <View key={index} style={styles.reportItem}>
                            <Text style={styles.reportText}>{report.text}</Text>
                            <Text style={styles.reportMeta}>
                              {report.user} • {report.time}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                  {/* Incidents */}
                  {/* Incidents are not part of the static safetyZones, so they are not displayed here */}

                  {/* Sources */}
                  {selectedZone.tips && selectedZone.tips.length > 0 && (
                    <View style={styles.tipsContainer}>
                      <Text style={styles.tipsTitle}>Tips</Text>
                      {selectedZone.tips.map((tip, index) => (
                        <View key={index} style={styles.tipItem}>
                          <Text style={styles.tipBullet}>•</Text>
                          <Text style={styles.tipText}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Last Updated */}
                  {/* Last Updated is not part of the static safetyZones, so it's not displayed here */}
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.actionButtonOutline}
                    onPress={handleReportIssue}
                  >
                    <Text style={styles.actionButtonOutlineText}>
                      Report Issue
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleGetDirections}
                  >
                    <Text style={styles.actionButtonText}>Get Directions</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingBottom: Platform.OS === "android" ? 44 : 85,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFC",
  },
  headerTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: "700",
    color: "#6426A9",
    flex: 1,
    textAlign: "center",
  },
  locationStatusContainer: {
    backgroundColor: "#E0E7FF",
    borderLeftWidth: 4,
    borderLeftColor: "#6426A9",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  locationStatusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressContainer: {
    flex: 1,
    marginLeft: 8,
  },
  locationStatusText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#374151",
  },
  addressErrorText: {
    fontSize: moderateScale(12),
    color: "#EF4444",
    marginTop: 4,
    fontStyle: "italic",
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    fontSize: moderateScale(14),
    color: "#374151",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
  },
  searchResultsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 300,
  },
  searchResultsList: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchResultContent: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 14,
    color: "#6B7280",
  },
  searchLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  searchLoadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterBadgeActive: {
    backgroundColor: "#6426A9",
    borderColor: "#6426A9",
  },
  filterText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: moderateScale(12),
    color: "#6426A9",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: moderateScale(14),
    color: "#6426A9",
    marginTop: 12,
  },
  reportButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6426A9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statusText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#6426A9",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  safetyScoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  safetyScoreLabel: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6426A9",
  },
  safetyScoreValue: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  statValue: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#374151",
    marginTop: 4,
  },
  reportsContainer: {
    marginBottom: 16,
  },
  reportsTitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6426A9",
    marginBottom: 8,
  },
  reportItem: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportText: {
    fontSize: moderateScale(14),
    color: "#374151",
  },
  reportMeta: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginTop: 4,
  },
  tipsContainer: {
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6426A9",
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: moderateScale(14),
    color: "#6426A9",
    marginRight: 8,
  },
  tipText: {
    fontSize: moderateScale(14),
    color: "#374151",
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButtonOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#6426A9",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
  },
  actionButtonOutlineText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#6426A9",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#6426A9",
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#FFFFFF",
  },
  calloutContainer: {
    width: 200,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  calloutTitle: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    marginBottom: 4,
  },
  calloutType: {
    fontSize: moderateScale(12),
    color: "#6426A9",
    fontWeight: "500",
  },
  refreshButton: {
    padding: 4,
    marginLeft: 8,
  },
  noDataMessage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -10 }],
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    zIndex: 1,
  },
  noDataText: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    textAlign: "center",
  },
  mapLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  mapLoadingContent: {
    alignItems: "center",
  },
  mapLoadingText: {
    marginTop: 10,
    fontSize: moderateScale(16),
    color: "#6426A9",
  },
  mapErrorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  mapErrorContent: {
    alignItems: "center",
  },
  mapErrorText: {
    marginTop: 10,
    fontSize: moderateScale(16),
    color: "#EF4444",
    textAlign: "center",
  },
  mapErrorButton: {
    marginTop: 20,
    backgroundColor: "#6426A9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  mapErrorButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
  clearSelectionButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 10,
  },
  selectedZoneIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#E0F2F7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  selectedZoneText: {
    fontSize: moderateScale(12),
    color: "#10B981",
    marginLeft: 4,
  },
  mapProviderStatus: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 5,
  },
  mapProviderText: {
    fontSize: moderateScale(10),
    color: "#6426A9",
    fontWeight: "500",
  },
});
