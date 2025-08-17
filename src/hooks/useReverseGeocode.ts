import { useRef, useState, useCallback } from 'react';
import { reverseGeocodeThrottled } from '../utils/reverseGeocode';

// Utility functions for distance calculation
const toRad = (d: number) => d * Math.PI / 180;

const distM = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const A = s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2;
  return 2 * R * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
};

export function useReverseGeocode(minMoveMeters = 50) {
  const last = useRef<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('Location detected');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchFor = useCallback(async (lat: number, lng: number) => {
    try {
      // Check if movement is significant enough
      if (last.current && distM(last.current, { lat, lng }) < minMoveMeters) {
        console.log('Movement too small, skipping geocoding');
        return;
      }

      setLoading(true);
      setError(undefined);
      
      console.log('Fetching address for coordinates:', { lat, lng });
      const { formatted } = await reverseGeocodeThrottled(lat, lng);
      
      setAddress(formatted);
      last.current = { lat, lng };
      
      console.log('Address updated successfully:', formatted);
    } catch (e: any) {
      const errorMessage = String(e?.message || e);
      console.error('Geocoding error:', errorMessage);
      setError(errorMessage);
      
      // Don't update address on error, keep the last known good address
      // Only set fallback if we don't have any address yet
      if (!address || address === 'Location detected') {
        setAddress('Location detected');
      }
    } finally {
      setLoading(false);
    }
  }, [minMoveMeters, address]);

  // Reset function for manual retry
  const reset = useCallback(() => {
    last.current = null;
    setError(undefined);
    setAddress('Location detected');
  }, []);

  return { 
    address, 
    loading, 
    error, 
    fetchFor,
    reset,
    lastCoords: last.current
  };
}
