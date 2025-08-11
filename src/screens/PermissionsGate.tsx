// src/screens/PermissionsGate.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function PermissionsGate({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Localização
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
          Alert.alert('Permissão de localização negada');
        }

        // Câmera
        const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
        if (camStatus !== 'granted') {
          Alert.alert('Permissão da câmera negada');
        }

        // Biblioteca de mídia (opcional)
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        if (mediaStatus !== 'granted') {
          Alert.alert('Permissão da galeria negada');
        }

        setDone(true);
      } catch (e: any) {
        Alert.alert('Erro ao solicitar permissões', e?.message ?? 'desconhecido');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
    <ActivityIndicator />
    <Text>Preparando…</Text>
  </View>;

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:12 }}>
      <Text style={{ fontSize:18, fontWeight:'600' }}>
        {done ? 'Permissões atualizadas ✅' : 'Permissões pendentes'}
      </Text>
      <Button title="Continuar" onPress={() => navigation.replace('Main')} />
    </View>
  );
}
