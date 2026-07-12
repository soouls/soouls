import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Mic, Image as ImageIcon, CheckSquare, Target, PenTool } from 'lucide-react-native';

interface BlockToolbarProps {
  onAddVoice: () => void;
  onAddImage: () => void;
  onAddGoal: () => void;
  onAddTasklist: () => void;
  onAddDoodle: () => void;
}

export function BlockToolbar({
  onAddVoice,
  onAddImage,
  onAddGoal,
  onAddTasklist,
  onAddDoodle,
}: BlockToolbarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onAddVoice}>
        <Mic color="#1C1C1E" size={24} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onAddImage}>
        <ImageIcon color="#1C1C1E" size={24} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onAddGoal}>
        <Target color="#1C1C1E" size={24} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onAddTasklist}>
        <CheckSquare color="#1C1C1E" size={24} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onAddDoodle}>
        <PenTool color="#1C1C1E" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  button: {
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});
