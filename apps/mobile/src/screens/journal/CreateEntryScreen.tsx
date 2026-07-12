import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePersistedEntry } from '../../hooks/usePersistedEntry';
import { useUpsertSync } from '../../hooks/useEntries';
import { BlockToolbar } from '../../components/blocks/BlockToolbar';
import { VoiceCard } from '../../components/blocks/VoiceCard';
import { ImageCard } from '../../components/blocks/ImageCard';
import { GoalCard } from '../../components/blocks/GoalCard';
import { TasklistCard } from '../../components/blocks/TasklistCard';
import { DoodleCard } from '../../components/blocks/DoodleCard';
import LZString from 'lz-string';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useImagePicker } from '../../hooks/useImagePicker';

export function CreateEntryScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const { textContent, setTextContent, blocks, setBlocks, saveStatus, clearDraft } = usePersistedEntry('draft');
  const upsertSync = useUpsertSync();
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { start: startVoice, stop: stopVoice, recording } = useVoiceRecorder();
  const { pickImage } = useImagePicker();

  const performSync = async (finalize = false) => {
    if (!textContent.trim() && !title.trim() && blocks.length === 0) return;
    setIsSyncing(true);
    try {
      const contentObj = { title, textContent, blocks };
      const contentStr = JSON.stringify(contentObj);
      const compressed = LZString.compressToBase64(contentStr);
      
      await upsertSync.mutateAsync({
        content: compressed,
        type: 'entry',
        finalize
      });
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 2s debounce for background sync
  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      performSync(false);
    }, 2000);
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [textContent, title, blocks]);

  // AppState listener for immediate sync on background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        performSync(false);
      }
    });
    return () => subscription.remove();
  }, [textContent, title, blocks]);

  const handleSave = async () => {
    await performSync(true); // Finalize the entry
    await clearDraft();
    navigation.goBack();
  };

  const addBlock = (block: any) => {
    setBlocks([...blocks, block]);
  };

  const handleVoiceToggle = async () => {
    if (recording) {
      const uri = await stopVoice();
      if (uri) addBlock({ type: 'voice', duration: 5 }); // mocked duration
    } else {
      await startVoice();
    }
  };

  const handleImagePick = async () => {
    const img = await pickImage();
    if (img) addBlock({ type: 'image', url: img.uri, name: img.name });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Entry</Text>
          <Button title="Cancel" onPress={() => navigation.goBack()} style={styles.cancelButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Input
            label="Title"
            value={title}
            placeholder="What's on your mind?"
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Journal Entry</Text>
          <View style={styles.textAreaContainer}>
            <Input
              label=""
              value={textContent}
              placeholder="Write your thoughts here..."
              onChangeText={setTextContent}
              multiline
              numberOfLines={6}
            />
          </View>

          <View style={styles.blocksContainer}>
            {blocks.map((block: any, idx: number) => {
              if (block.type === 'voice') return <VoiceCard key={idx} duration={block.duration} />;
              if (block.type === 'image') return <ImageCard key={idx} uri={block.url || block.dataUrl} />;
              if (block.type === 'goal') return <GoalCard key={idx} goal={block.goal} label={block.label} />;
              if (block.type === 'tasklist') return <TasklistCard key={idx} title={block.title} tasks={block.tasks} />;
              if (block.type === 'doodle') return <DoodleCard key={idx} />;
              return null;
            })}
          </View>
        </ScrollView>
        
        <BlockToolbar 
          onAddVoice={handleVoiceToggle}
          onAddImage={handleImagePick}
          onAddGoal={() => addBlock({ type: 'goal', goal: 'New Goal', label: 'My Goal' })}
          onAddTasklist={() => addBlock({ type: 'tasklist', title: 'Todos', tasks: [{text: 'Task 1', done: false}] })}
          onAddDoodle={() => addBlock({ type: 'doodle' })}
        />

        <View style={styles.footer}>
          <Text style={{color: '#8E8E93', fontSize: 12, marginBottom: 8}}>
            {recording ? 'Recording voice...' : isSyncing ? 'Syncing to cloud...' : saveStatus === 'saved' ? 'Saved locally' : ''}
          </Text>
          <Button
            title="Save & Close"
            onPress={handleSave}
            isLoading={isSyncing}
            disabled={(!title && !textContent && blocks.length === 0) || isSyncing}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 16,
  },
  textAreaContainer: {
    minHeight: 120,
  },
  blocksContainer: {
    marginTop: 16,
    paddingBottom: 24,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFF',
  },
});
