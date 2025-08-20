import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

export type Story = {
  id: string;             // uuid
  uri: string;            // FileSystem uri
  createdAt: number;      // ms epoch
  expiresAt: number;      // ms epoch = createdAt + 24h
};

const DIR = FileSystem.documentDirectory + 'stories/';
const KEY = 'stories:items';

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

export async function saveStory(localUri: string): Promise<Story> {
  await ensureDir();
  const id = uuid();
  const ext = (localUri.split('.').pop() || 'jpg').split('?')[0];
  const dest = `${DIR}${id}.${ext}`;
  await FileSystem.copyAsync({ from: localUri, to: dest });
  const now = Date.now();
  const story: Story = { id, uri: dest, createdAt: now, expiresAt: now + 24*60*60*1000 };
  const list = await getAllStories();
  list.push(story);
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  return story;
}

export async function getAllStories(): Promise<Story[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) as Story[] : [];
}

export async function getActiveStories(): Promise<Story[]> {
  const now = Date.now();
  const all = await getAllStories();
  return all.filter(s => s.expiresAt > now);
}

export async function pruneExpiredStories(): Promise<void> {
  const now = Date.now();
  const all = await getAllStories();
  const active: Story[] = [];
  const toDelete = [];
  for (const s of all) {
    if (s.expiresAt > now) active.push(s);
    else toDelete.push(s.uri);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(active));
  // best-effort file cleanup
  await Promise.all(toDelete.map(u => FileSystem.deleteAsync(u, { idempotent: true })));
}

export async function clearAllStories(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
  try { await FileSystem.deleteAsync(DIR, { idempotent: true }); } catch {}
}
