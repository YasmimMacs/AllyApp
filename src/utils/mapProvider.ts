import { Platform } from "react-native";
import { PROVIDER_GOOGLE } from "react-native-maps";

export const getMapProvider = () => {
  // Force Google Maps on both platforms if API key is configured
  return PROVIDER_GOOGLE;
};

export const isGoogleMapsAvailable = () => {
  return true; // Always return true since we're forcing Google Maps
};

export const getMapProviderName = () => {
  const provider = getMapProvider();
  if (provider === PROVIDER_GOOGLE) {
    return "Google Maps";
  }
  return "Default Maps";
};
