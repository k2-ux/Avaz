import Sound, { RecordBackType, PlayBackType } from 'react-native-nitro-sound';

class AudioService {
  private recordListener?: (e: RecordBackType) => void;
  private playbackListener?: (e: PlayBackType) => void;

  async startRecording(
    path?: string,
    onProgress?: (e: RecordBackType) => void,
  ) {
    this.recordListener = onProgress;

    Sound.addRecordBackListener((e: RecordBackType) => {
      if (this.recordListener) {
        this.recordListener(e);
      }
    });

    const result = await Sound.startRecorder(path);
    return result;
  }

  async stopRecording() {
    const result = await Sound.stopRecorder();
    Sound.removeRecordBackListener();
    this.recordListener = undefined;
    return result;
  }

  async pauseRecording() {
    await Sound.pauseRecorder();
  }

  async resumeRecording() {
    await Sound.resumeRecorder();
  }

  async startPlayback(path: string, onProgress?: (e: PlayBackType) => void) {
    this.playbackListener = onProgress;

    Sound.addPlayBackListener((e: PlayBackType) => {
      if (this.playbackListener) {
        this.playbackListener(e);
      }
    });

    const result = await Sound.startPlayer(path);
    return result;
  }

  async pausePlayback() {
    await Sound.pausePlayer();
  }

  async stopPlayback() {
    await Sound.stopPlayer();
    Sound.removePlayBackListener();
    this.playbackListener = undefined;
  }

  async seekTo(ms: number) {
    await Sound.seekToPlayer(ms);
  }

  async setVolume(volume: number) {
    await Sound.setVolume(volume);
  }

  async setSpeed(speed: number) {
    await Sound.setPlaybackSpeed(speed);
  }
}

export const audioService = new AudioService();
