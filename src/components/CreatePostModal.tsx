import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type PostType = 'review' | 'tip' | 'incident';
export type NewPost = { 
  id: string; 
  type: PostType; 
  title?: string; 
  text: string; 
  rating?: number; 
  photoUri?: string; 
  createdAt: number; 
};

type Props = { 
  visible: boolean; 
  type: PostType; 
  onClose: () => void; 
  onSubmit: (p: NewPost) => void; 
};

export default function CreatePostModal({ visible, type, onClose, onSubmit }: Props) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  const pickPhoto = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) { Alert.alert('Permission required','Please allow photo library access.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing:true, quality:0.9 });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  };

  const submit = () => {
    if (!text.trim()) { Alert.alert('Add details', 'Please write something.'); return; }
    onSubmit({ id: String(Date.now()), type, title: title.trim() || undefined, text: text.trim(), rating, photoUri, createdAt: Date.now() });
    setText(''); setTitle(''); setRating(undefined); setPhotoUri(undefined);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.header}>
            {type === 'review' ? 'Write a Review' : type === 'tip' ? 'Share a Tip' : 'Report an Incident'}
          </Text>
          <TextInput 
            placeholder="Title (optional)" 
            value={title} 
            onChangeText={setTitle} 
            style={styles.input} 
          />
          {type === 'review' && (
            <TextInput 
              placeholder="Rating 1–5 (optional)" 
              keyboardType="number-pad" 
              value={rating?.toString() || ''} 
              onChangeText={v => setRating(Number(v) || undefined)} 
              style={styles.input} 
            />
          )}
          <TextInput
            placeholder={type === 'tip' ? 'Your tip…' : 'Tell us what happened…'}
            value={text} 
            onChangeText={setText} 
            style={[styles.input, { height: 100 }]} 
            multiline
          />
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 12 }} />
          ) : null}
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <Pressable onPress={pickPhoto} style={styles.secondary}>
              <Text style={styles.secondaryTxt}>Add Photo</Text>
            </Pressable>
            <View style={{ flexDirection:'row', gap:12 }}>
              <Pressable onPress={onClose} style={styles.ghost}>
                <Text style={styles.ghostTxt}>Cancel</Text>
              </Pressable>
              <Pressable onPress={submit} style={styles.primary}>
                <Text style={styles.primaryTxt}>Post</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', justifyContent:'flex-end' },
  sheet:{ backgroundColor:'white', padding:16, borderTopLeftRadius:16, borderTopRightRadius:16 },
  header:{ fontSize:18, fontWeight:'700', marginBottom:12 },
  input:{ borderWidth:1, borderColor:'#E5E7EB', borderRadius:12, paddingHorizontal:12, paddingVertical:10, marginBottom:12 },
  primary:{ backgroundColor:'#6426A9', paddingHorizontal:18, paddingVertical:12, borderRadius:12 },
  primaryTxt:{ color:'#fff', fontWeight:'600' },
  ghost:{ paddingHorizontal:18, paddingVertical:12, borderRadius:12, borderWidth:1, borderColor:'#E5E7EB' },
  ghostTxt:{ color:'#374151', fontWeight:'600' },
  secondary:{ paddingHorizontal:14, paddingVertical:12, borderRadius:12, borderWidth:1, borderColor:'#E5E7EB' },
  secondaryTxt:{ color:'#6426A9', fontWeight:'600' },
});
