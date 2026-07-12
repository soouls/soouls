import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Target } from 'lucide-react-native';
import { Card } from '../ui/Card';

export function GoalCard({ goal, label }: { goal?: string; label?: string }) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconContainer}>
        <Target color="#FFF" size={20} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label || 'Goal'}</Text>
        <Text style={styles.goal}>{goal}</Text>
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, backgroundColor: '#FFF5E6' },
  iconContainer: { backgroundColor: '#FF9500', padding: 12, borderRadius: 24, marginRight: 12 },
  info: { flex: 1 },
  label: { fontSize: 12, color: '#FF9500', fontWeight: 'bold', marginBottom: 2 },
  goal: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
});
