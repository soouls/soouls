import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Play } from 'lucide-react-native';
import { Card } from '../ui/Card';

export function VoiceCard({ duration }: { duration?: number }) {
  return (
    <Card style={styles.card}>
      <TouchableOpacity style={styles.playButton}>
        <Play color="#FFF" size={20} />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.title}>Voice Note</Text>
        <Text style={styles.duration}>{duration ? `${duration}s` : '0:00'}</Text>
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 },
  playButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 24, marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  duration: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
});
