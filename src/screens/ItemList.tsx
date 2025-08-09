import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { listItems } from '../api';

export default function Dashboard() {
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    listItems().then((data) => setMsg(JSON.stringify(data))).catch(console.error);
  }, []);

  return <Text>{msg}</Text>;
}
