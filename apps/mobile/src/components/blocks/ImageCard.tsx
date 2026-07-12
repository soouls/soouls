import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { Card } from '../ui/Card';

export function ImageCard({ uri }: { uri?: string }) {
  if (!uri) return null;
  return (
    <Card style={styles.card}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { padding: 0, marginBottom: 8, overflow: 'hidden', borderRadius: 12, borderWidth: 0 },
  image: { width: '100%', height: 200 },
});
