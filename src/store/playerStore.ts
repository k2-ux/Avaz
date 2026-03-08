import { create } from 'zustand';
import { audioService } from '../services/audioService';

type PlayerState = {
  isPlaying: boolean;
  currentPosition: number;
  duration: number;

  startPlayback: (path: string) => Promise<void>;
  pausePlayback: () => Promise<void>;
  stopPlayback: () => Promise<void>;
};

export const usePlayerStore = create<PlayerState>(set => ({
  isPlaying: false,
  currentPosition: 0,
  duration: 0,

  startPlayback: async (path: string) => {
    await audioService.startPlayback(path, e => {
      set({
        currentPosition: e.currentPosition,
        duration: e.duration,
      });
    });

    set({ isPlaying: true });
  },

  pausePlayback: async () => {
    await audioService.pausePlayback();
    set({ isPlaying: false });
  },

  stopPlayback: async () => {
    await audioService.stopPlayback();
    set({
      isPlaying: false,
      currentPosition: 0,
    });
  },
}));
