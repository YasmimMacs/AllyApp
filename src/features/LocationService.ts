
import * as Location from 'expo-location';
import API from '@aws-amplify/api';

let watcher: Location.LocationSubscription | undefined;

export async function startLocationSharing() {
  // alta precisão = maior custo de bateria; ajuste conforme necessário
  watcher = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 25 },
    async (pos) => {
      const payload = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      };

      try {
        await API.post({ apiName: 'allyapi', path: '/v1/location', body: payload });
      } catch (e) {
        console.log('Location sharing failed', e);
      }
    }
  );
}

export function stopLocationSharing() {
  watcher?.remove();
  watcher = undefined;
}
