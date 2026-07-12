import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PenTool } from 'lucide-react-native';
import { Card } from '../ui/Card';

export function DoodleCard() {
  return (
    <Card style={styles.card}>
      <View style={styles.placeholder}>
        <PenTool color="#8E8E93" size={32} />
        <Text style={styles.text}>Doodle Area (Not implemented)</Text>
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { padding: 0, marginBottom: 8, overflow: 'hidden' },
  placeholder: { height: 200, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 8, color: '#8E8E93', fontWeight: '500' },
});
