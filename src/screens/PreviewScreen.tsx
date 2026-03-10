import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

import { useRecordingStore } from '../store/recordingStore';
import { usePlayerStore } from '../store/playerStore';
import { useEntryStore } from '../store/entryStore';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');
const BAR_COUNT = 24;
const BAR_WIDTH = 6;
const BAR_SPACING = 4;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function PreviewScreen({ navigation }: any) {
  const { audioPath, recordingTime } = useRecordingStore();
  const { addEntry } = useEntryStore();
  const { user } = useAuthStore();
  const { startPlayback, stopPlayback, currentPosition, duration, isPlaying } =
    usePlayerStore();

  const progress = useSharedValue(0);
  const waveAnimation = useSharedValue(0);

  // Generate random bar heights once
  const barHeights = useRef(
    Array.from({ length: BAR_COUNT }, () => 20 + Math.random() * 40),
  ).current;

  useEffect(() => {
    if (duration > 0) {
      progress.value = withTiming(currentPosition / duration, {
        duration: 100,
      });
    }
  }, [currentPosition, duration]);

  // Waveform animation loop when playing
  useEffect(() => {
    if (isPlaying) {
      waveAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else {
      waveAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [isPlaying]);

  const play = async () => {
    if (audioPath) {
      await startPlayback(audioPath);
    }
  };

  const stop = async () => {
    await stopPlayback();
  };

  const saveEntry = () => {
    if (!audioPath || !user) return;

    const entry = {
      id: `entry_${Date.now()}`,
      userId: user.userId,
      audioPath,
      duration: recordingTime,
      createdAt: Date.now(),
      synced: false,
    };

    addEntry(entry);
    navigation.navigate('Home');
  };

  // Format time for display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient
      colors={['#0f0c1f', '#1b1a2e', '#23233a']}
      style={styles.container}
    >
      {/* Header */}
      <Animated.View style={styles.header}>
        <Text style={styles.headerTitle}>Preview Recording</Text>
        <Text style={styles.headerSubtitle}>Review before saving</Text>
      </Animated.View>

      {/* Waveform Card */}
      <LinearGradient
        colors={['#1e1e2f', '#2a2a40']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.waveformCard}
      >
        {/* Waveform Bars */}
        <View style={styles.waveformContainer}>
          {barHeights.map((height, index) => {
            const barStyle = useAnimatedStyle(() => {
              const scale = isPlaying
                ? interpolate(
                    waveAnimation.value,
                    [0, 1],
                    [0.8 + (index % 3) * 0.1, 1.2 + (index % 2) * 0.2],
                  )
                : 1;
              return {
                transform: [{ scaleY: scale }],
                backgroundColor: isPlaying ? '#7f5af0' : '#4f46e5',
              };
            });

            return (
              <Animated.View
                key={index}
                style={[styles.waveBar, { height }, barStyle]}
              />
            );
          })}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: withTiming(`${progress.value * 100}%`, {
                  duration: 100,
                }),
              },
            ]}
          >
            <LinearGradient
              colors={['#7f5af0', '#6c4fd1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        {/* Time Display */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Play/Stop Button */}
        <View style={styles.controls}>
          {!isPlaying ? (
            <AnimatedTouchable
              onPress={play}
              activeOpacity={0.8}
              style={styles.controlButton}
            >
              <LinearGradient
                colors={['#7f5af0', '#6c4fd1']}
                style={styles.controlButtonGradient}
              >
                <Text style={styles.controlButtonText}>▶ Play</Text>
              </LinearGradient>
            </AnimatedTouchable>
          ) : (
            <AnimatedTouchable
              onPress={stop}
              activeOpacity={0.8}
              style={styles.controlButton}
            >
              <LinearGradient
                colors={['#ff4d4d', '#cc3b3b']}
                style={styles.controlButtonGradient}
              >
                <Text style={styles.controlButtonText}>■ Stop</Text>
              </LinearGradient>
            </AnimatedTouchable>
          )}
        </View>
      </LinearGradient>

      {/* Action Buttons - Fixed at bottom for better visibility */}
      <View style={styles.actionButtons}>
        <AnimatedTouchable
          onPress={saveEntry}
          activeOpacity={0.8}
          style={styles.saveButton}
        >
          <LinearGradient
            colors={['#9f7aea', '#7f5af0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonText}>💾 Save Entry</Text>
          </LinearGradient>
        </AnimatedTouchable>

        <AnimatedTouchable
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          style={styles.discardButton}
        >
          <LinearGradient
            colors={['#ff6b6b', '#ee5253']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonText}>🗑 Discard</Text>
          </LinearGradient>
        </AnimatedTouchable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 4,
  },
  waveformCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    flex: 1,
    justifyContent: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    marginBottom: 20,
  },
  waveBar: {
    width: BAR_WIDTH,
    marginHorizontal: BAR_SPACING / 2,
    borderRadius: BAR_WIDTH / 2,
    backgroundColor: '#4f46e5',
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeText: {
    color: '#bbb',
    fontSize: 14,
  },
  controls: {
    alignItems: 'center',
  },
  controlButton: {
    width: 150,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#7f5af0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  controlButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#9f7aea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  discardButton: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
