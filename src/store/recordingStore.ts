import { create } from 'zustand';
import { audioService } from '../services/audioService';

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
    const path = `avaz_${Date.now()}.m4a`;

    await audioService.startRecording(path, e => {
      set({ recordingTime: e.currentPosition });

      // enforce 3 minute limit
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
