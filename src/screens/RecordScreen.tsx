import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRecordingStore } from '../store/recordingStore';

export default function RecordScreen() {
  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useRecordingStore();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Recording time: {Math.floor(recordingTime / 1000)} sec</Text>

      {!isRecording && (
        <Button title="Start Recording" onPress={startRecording} />
      )}

      {isRecording && !isPaused && (
        <Button title="Pause" onPress={pauseRecording} />
      )}

      {isRecording && isPaused && (
        <Button title="Resume" onPress={resumeRecording} />
      )}

      {isRecording && <Button title="Stop Recording" onPress={stopRecording} />}
    </View>
  );
}
