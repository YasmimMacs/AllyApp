import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { saveStory, getActiveStories, pruneExpiredStories, Story } from '../storage/stories';

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    await pruneExpiredStories();
    setStories(await getActiveStories());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createFromCamera = useCallback(async () => {
    try {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) { Alert.alert('Permission required','Please allow camera access.'); return; }
      setLoading(true);
      const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [9,16], quality: 0.9 });
      if (res.canceled) return;
      await saveStory(res.assets[0].uri);
      await refresh();
    } catch (e) {
      console.error(e); Alert.alert('Camera failed','Could not take/save the story.');
    } finally { setLoading(false); }
  }, [refresh]);

  const createFromLibrary = useCallback(async () => {
    try {
      const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!p.granted) { Alert.alert('Permission required','Please allow photo library access.'); return; }
      setLoading(true);
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [9,16], quality: 0.9
      });
      if (res.canceled) return;
      await saveStory(res.assets[0].uri);
      await refresh();
    } catch (e) {
      console.error(e); Alert.alert('Upload failed','Could not pick/save the story.');
    } finally { setLoading(false); }
  }, [refresh]);

  return { stories, loading, refresh, createFromCamera, createFromLibrary };
}
