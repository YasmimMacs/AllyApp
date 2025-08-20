import React from 'react';
import { Modal, Image, Pressable, View } from 'react-native';
import { Story } from '../storage/stories';

type Props = {
  visible: boolean;
  story?: Story | null;
  onClose: () => void;
};

export default function StoryViewerModal({ visible, story, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent>
      <Pressable onPress={onClose} style={{ flex:1, backgroundColor:'rgba(0,0,0,0.95)', justifyContent:'center' }}>
        {story?.uri ? (
          <Image source={{ uri: story.uri }} resizeMode="contain" style={{ width: '100%', height: '80%' }} />
        ) : <View />}
      </Pressable>
    </Modal>
  );
}
