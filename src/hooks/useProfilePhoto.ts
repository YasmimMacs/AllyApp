import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveProfilePhoto, loadProfilePhoto, clearProfilePhoto } from '../storage/profile';

export function useProfilePhoto() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const uri = await loadProfilePhoto();
      setPhotoUri(uri);
    } catch (error) {
      console.error('Error loading profile photo:', error);
    }
  }, []);

  useEffect(() => { 
    refresh(); 
  }, [refresh]);

  const ensureMediaPerms = useCallback(async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) { 
      Alert.alert('Permission required', 'Please allow photo library access.'); 
      return false; 
    }
    return true;
  }, []);

  const ensureCameraPerms = useCallback(async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) { 
      Alert.alert('Permission required', 'Please allow camera access.'); 
      return false; 
    }
    return true;
  }, []);

  const pickFromLibrary = useCallback(async () => {
    try {
      if (!(await ensureMediaPerms())) return;
      setLoading(true);
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, 
        aspect: [1,1], 
        quality: 0.9, 
        exif: false,
      });
      if (res.canceled) return;
      await saveProfilePhoto(res.assets[0].uri);
      setPhotoUri(res.assets[0].uri);
    } catch (e) {
      console.error(e); 
      Alert.alert('Upload failed', 'Could not pick/save the image.');
    } finally { 
      setLoading(false); 
    }
  }, [ensureMediaPerms]);

  const takePhoto = useCallback(async () => {
    try {
      if (!(await ensureCameraPerms())) return;
      setLoading(true);
      const res = await ImagePicker.launchCameraAsync({ 
        allowsEditing: true, 
        aspect: [1,1], 
        quality: 0.9 
      });
      if (res.canceled) return;
      await saveProfilePhoto(res.assets[0].uri);
      setPhotoUri(res.assets[0].uri);
    } catch (e) {
      console.error(e); 
      Alert.alert('Camera failed', 'Could not take/save the image.');
    } finally { 
      setLoading(false); 
    }
  }, [ensureCameraPerms]);

  const remove = useCallback(async () => {
    try {
      await clearProfilePhoto(); 
      await refresh();
    } catch (error) {
      console.error('Error removing profile photo:', error);
      Alert.alert('Error', 'Could not remove the profile photo.');
    }
  }, [refresh]);

  return { photoUri, loading, pickFromLibrary, takePhoto, refresh, remove };
}
