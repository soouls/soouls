import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EntryBlock } from '../utils/entries';
import LZString from 'lz-string';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface PersistedEntryData {
  textContent: string;
  blocks: EntryBlock[];
}

export function usePersistedEntry(entryId: string | 'draft') {
  const [textContent, setTextContent] = useState('');
  const [blocks, setBlocks] = useState<EntryBlock[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `entry_${entryId}`;

  // Load initial data
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const data = await AsyncStorage.getItem(storageKey);
        if (data && mounted) {
          const decompressed = data.startsWith('lz:') 
            ? LZString.decompressFromBase64(data.slice(3)) 
            : data;
            
          if (decompressed) {
            const parsed = JSON.parse(decompressed) as PersistedEntryData;
            setTextContent(parsed.textContent || '');
            setBlocks(parsed.blocks || []);
          }
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [storageKey]);

  // Persist to AsyncStorage whenever content changes
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveData = async () => {
      try {
        setSaveStatus('saving');
        const payload: PersistedEntryData = { textContent, blocks };
        const serialized = JSON.stringify(payload);
        const compressed = `lz:${LZString.compressToBase64(serialized)}`;
        await AsyncStorage.setItem(storageKey, compressed);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to save draft:', err);
        setSaveStatus('error');
      }
    };

    const timeout = setTimeout(saveData, 500); // Debounce local storage save
    return () => clearTimeout(timeout);
  }, [textContent, blocks, isLoaded, storageKey]);

  const migrateKey = useCallback(async (newId: string) => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data) {
        await AsyncStorage.setItem(`entry_${newId}`, data);
        await AsyncStorage.removeItem(storageKey);
      }
    } catch (err) {
      console.error('Failed to migrate key:', err);
    }
  }, [storageKey]);

  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      setTextContent('');
      setBlocks([]);
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
  }, [storageKey]);

  return {
    textContent,
    blocks,
    setTextContent,
    setBlocks,
    saveStatus,
    isLoaded,
    migrateKey,
    clearDraft
  };
}
