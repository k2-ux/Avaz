import { MMKV } from 'react-native-mmkv';
import { Entry } from '../models/Entry';

const storage = new MMKV();

const ENTRY_KEY = 'entries';

export const storageService = {
  getEntries(): Entry[] {
    const data = storage.getString(ENTRY_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveEntries(entries: Entry[]) {
    storage.set(ENTRY_KEY, JSON.stringify(entries));
  },

  addEntry(entry: Entry) {
    const entries = this.getEntries();
    entries.unshift(entry);
    this.saveEntries(entries);
  },
};
