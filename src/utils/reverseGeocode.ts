import * as Location from 'expo-location';

type RevGeoResult = { formatted: string; components?: any };

type CacheEntry = { 
  value: RevGeoResult; 
  ts: number; 
  promise?: Promise<RevGeoResult>;
};

const cache = new Map<string, CacheEntry>();
const TTL = 15 * 60 * 1000; // 15 min
let lastCallTs = 0;
const THROTTLE_MS = 2500;

const keyOf = (lat: number, lng: number) => {
  const r = (n: number) => Number(n.toFixed(4)); // ~11m precision
  return `${r(lat)},${r(lng)}`;
};

export async function reverseGeocodeThrottled(lat: number, lng: number): Promise<RevGeoResult> {
  const key = keyOf(lat, lng);
  const now = Date.now();
  const hit = cache.get(key);
  
  // Return cached value if still valid
  if (hit && (now - hit.ts) < TTL && hit.value) {
    console.log('Reverse geocode cache hit for:', key);
    return hit.value;
  }
  
  // Return existing promise if request is in flight
  if (hit?.promise) {
    console.log('Reverse geocode dedupe for:', key);
    return hit.promise;
  }

  // Calculate throttle delay
  const wait = Math.max(0, THROTTLE_MS - (now - lastCallTs));
  
  const doCall = async (): Promise<RevGeoResult> => {
    try {
      console.log('Making reverse geocode API call for:', key);
      const res = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const item = res?.[0];
      
      const formatted = item
        ? [item.name || item.street, item.subregion || item.city, item.region]
            .filter(Boolean)
            .join(', ')
        : 'Location detected';
      
      const value: RevGeoResult = { formatted, components: item };
      cache.set(key, { value, ts: Date.now() });
      
      console.log('Reverse geocode success for:', key, '->', formatted);
      return value;
    } catch (error) {
      console.error('Reverse geocode API error for:', key, error);
      throw error;
    } finally {
      // Clear the promise from cache
      const current = cache.get(key);
      if (current) {
        cache.set(key, { ...current, promise: undefined });
      }
    }
  };

  const promise = (async (): Promise<RevGeoResult> => {
    if (wait > 0) {
      console.log(`Throttling reverse geocode for ${wait}ms`);
      await new Promise(resolve => setTimeout(resolve, wait));
    }
    
    lastCallTs = Date.now();
    return doCall();
  })();

  // Store the promise in cache for dedupe
  cache.set(key, { 
    value: hit?.value || { formatted: 'Location detected', components: undefined }, 
    promise, 
    ts: now 
  });
  
  return promise;
}

// Utility function to clear expired cache entries
export function clearExpiredCache() {
  const now = Date.now();
  let cleared = 0;
  
  for (const [key, entry] of cache.entries()) {
    if ((now - entry.ts) >= TTL) {
      cache.delete(key);
      cleared++;
    }
  }
  
  if (cleared > 0) {
    console.log(`Cleared ${cleared} expired cache entries`);
  }
}

// Utility function to get cache stats
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    lastCallTs,
  };
}
