import { create } from 'zustand';
import { audioService } from '../services/audioService';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
async function requestMicPermission() {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

type RecordingState = {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioPath: string | null;

  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
};

export const useRecordingStore = create<RecordingState>(set => ({
  isRecording: false,
  isPaused: false,
  recordingTime: 0,
  audioPath: null,

  startRecording: async () => {
    const allowed = await requestMicPermission();

    if (!allowed) {
      console.log('Microphone permission denied');
      return;
    }

    const path = `${RNFS.DocumentDirectoryPath}/avaz_${Date.now()}.m4a`;
    await audioService.startRecording(path, e => {
      set({ recordingTime: e.currentPosition });

      if (e.currentPosition >= 180000) {
        audioService.stopRecording();
        set({ isRecording: false });
      }
    });

    set({
      isRecording: true,
      isPaused: false,
      audioPath: path,
      recordingTime: 0,
    });
  },

  stopRecording: async () => {
    const result = await audioService.stopRecording();

    set({
      isRecording: false,
      isPaused: false,
      audioPath: result,
    });
  },

  pauseRecording: async () => {
    await audioService.pauseRecording();
    set({ isPaused: true });
  },

  resumeRecording: async () => {
    await audioService.resumeRecording();
    set({ isPaused: false });
  },
}));
