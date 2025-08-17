
import * as Location from 'expo-location';
import { post } from 'aws-amplify/api';

let watcher: Location.LocationSubscription | undefined;

export async function startLocationSharing() {
 
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
        await post({
          apiName: 'allyapi',
          path: '/v1/location',
          options: {
            body: payload
          }
        });
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
