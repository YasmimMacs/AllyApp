import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_PHOTO_KEY = 'profile.photoUri';

/**
 * Save profile photo URI to AsyncStorage
 * @param uri - The URI of the selected/taken photo
 */
export const saveProfilePhoto = async (uri: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_PHOTO_KEY, uri);
  } catch (error) {
    console.error('Error saving profile photo:', error);
    throw new Error('Failed to save profile photo');
  }
};

/**
 * Load profile photo URI from AsyncStorage
 * @returns The stored photo URI or null if none exists
 */
export const loadProfilePhoto = async (): Promise<string | null> => {
  try {
    const photoUri = await AsyncStorage.getItem(PROFILE_PHOTO_KEY);
    return photoUri;
  } catch (error) {
    console.error('Error loading profile photo:', error);
    return null;
  }
};

/**
 * Clear stored profile photo
 */
export const clearProfilePhoto = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_PHOTO_KEY);
  } catch (error) {
    console.error('Error clearing profile photo:', error);
    throw new Error('Failed to clear profile photo');
  }
};
