import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = { onPress: () => void; };
export default function FAB({ onPress }: Props) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}>
        <Ionicons name="add" size={28} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position:'absolute', right:16, bottom:24 },
  btn: { 
    width:56, 
    height:56, 
    borderRadius:28, 
    backgroundColor:'#6426A9', 
    alignItems:'center', 
    justifyContent:'center', 
    elevation:6, 
    shadowColor:'#000', 
    shadowOpacity:0.2, 
    shadowRadius:6, 
    shadowOffset:{ width:0, height:3 } 
  },
});
