import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { Card } from '../ui/Card';

export function TasklistCard({ title, tasks }: { title?: string; tasks?: Array<{ text?: string; done?: boolean }> }) {
  return (
    <Card style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {tasks?.map((task, idx) => (
        <View key={idx} style={styles.taskRow}>
          <TouchableOpacity>
            {task.done ? <CheckSquare color="#34C759" size={20} /> : <Square color="#8E8E93" size={20} />}
          </TouchableOpacity>
          <Text style={[styles.taskText, task.done && styles.taskTextDone]}>{task.text}</Text>
        </View>
      ))}
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { padding: 16, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  taskText: { fontSize: 16, marginLeft: 12, color: '#1C1C1E' },
  taskTextDone: { textDecorationLine: 'line-through', color: '#8E8E93' },
});
