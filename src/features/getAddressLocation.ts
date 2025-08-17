import { reverseGeocodeAsync, LocationObjectCoords } from "expo-location";

export async function getAddressLocation(
    {latitude, longitude}: LocationObjectCoords) {
    try {
        const addressResponse = await reverseGeocodeAsync({ latitude, longitude });
        
        if (addressResponse && addressResponse.length > 0) {
            const address = addressResponse[0];
            // Return a formatted address string
            const parts = [
                address.street,
                address.city,
                address.region,
                address.country
            ].filter(Boolean);
            
            return parts.join(', ') || 'Location detected';
        }
        
        return 'Location detected';
    } catch (error) {
        console.error('Error getting address:', error);
        return 'Location detected';
    }
}