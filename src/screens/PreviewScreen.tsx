import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { audioService } from '../services/audioService';
import { useRecordingStore } from '../store/recordingStore';
import { useEntryStore } from '../store/entryStore';

export default function PreviewScreen({ navigation }: any) {
  const { audioPath, recordingTime } = useRecordingStore();
  const { addEntry } = useEntryStore();

  const saveEntry = () => {
    if (!audioPath) return;

    const entry = {
      id: `entry_${Date.now()}`,
      audioPath: audioPath,
      duration: recordingTime,
      createdAt: Date.now(),
      synced: false,
    };

    addEntry(entry);

    Alert.alert('Saved', 'Your entry has been saved.', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('Home'),
      },
    ]);
  };

  const play = async () => {
    if (audioPath) {
      await audioService.startPlayback(audioPath);
    }
  };

  const stop = async () => {
    await audioService.stopPlayback();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Preview your recording</Text>

      <Button title="Play" onPress={play} />
      <Button title="Stop" onPress={stop} />

      <Button title="Save Entry" onPress={saveEntry} />
      <Button title="Discard" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}
