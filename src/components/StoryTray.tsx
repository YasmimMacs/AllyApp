import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { Story } from '../storage/stories';

type Props = {
  stories: Story[];
  onOpen: (s: Story) => void;
};

export default function StoryTray({ stories, onOpen }: Props) {
  if (!stories.length) return null;
  return (
    <View style={{ paddingVertical: 12 }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={stories}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpen(item)} style={{ alignItems: 'center', marginRight: 12 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', backgroundColor: '#eee' }}>
              <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} />
            </View>
            <Text numberOfLines={1} style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
