import { create } from 'zustand';
import { Entry } from '../models/Entry';
import { storageService } from '../services/storageService';

type EntryState = {
  entries: Entry[];
  loadEntries: () => void;
  addEntry: (entry: Entry) => void;
  deleteEntry: (id: string) => void;
};

export const useEntryStore = create<EntryState>(set => ({
  entries: [],

  loadEntries: () => {
    const entries = storageService.getEntries();
    set({ entries });
  },

  addEntry: entry => {
    storageService.addEntry(entry);

    set(state => ({
      entries: [entry, ...state.entries],
    }));
  },

  deleteEntry: id => {
    set(state => {
      const updated = state.entries.filter(e => e.id !== id);
      storageService.saveEntries(updated);
      return { entries: updated };
    });
  },
}));
