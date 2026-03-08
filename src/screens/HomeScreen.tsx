import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

import { useEntryStore } from '../store/entryStore';
import { usePlayerStore } from '../store/playerStore';
import { Entry } from '../models/Entry';
import { formatDuration } from '../utils/time';

export default function HomeScreen({ navigation }: any) {
  const { entries, loadEntries, deleteEntry } = useEntryStore();
  const { startPlayback } = usePlayerStore();

  useEffect(() => {
    loadEntries();
  }, []);

  const playEntry = async (entry: Entry) => {
    const path = entry.audioUrl ?? entry.audioPath;
    await startPlayback(path);
  };

  const renderItem = ({ item }: { item: Entry }) => {
    return (
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: '#eee',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text>🎙 Voice Entry</Text>
          <Text>{formatDuration(item.duration)}</Text>
          <Text>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => playEntry(item)}>
            <Text style={{ color: '#4f46e5' }}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deleteEntry(item.id)}>
            <Text style={{ color: 'red' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('Record')}
        style={{
          position: 'absolute',
          bottom: 40,
          right: 20,
          backgroundColor: '#4f46e5',
          padding: 20,
          borderRadius: 50,
        }}
      >
        <Text style={{ color: 'white' }}>Record</Text>
      </TouchableOpacity>
    </View>
  );
}
