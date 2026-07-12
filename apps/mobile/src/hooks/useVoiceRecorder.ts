import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export function useVoiceRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const start = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stop = async (): Promise<string | null> => {
    if (!recording) return null;
    
    setRecording(null);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return null;

      // Convert to base64 data URL
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:audio/m4a;base64,${base64}`;
    } catch (err) {
      console.error('Failed to stop recording', err);
      return null;
    }
  };

  return { recording, elapsed, start, stop };
}
