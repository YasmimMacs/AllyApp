import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, Text, View } from 'react-native';
import { listItems } from '../api';            // helper que faz API.get

type Item = { id: number; name: string };

export default function ItemsScreen() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = (await listItems()) as Item[];
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderBottomWidth: 0.5 }}>
          <Text>{item.name}</Text>
        </View>
      )}
    />
  );
}
