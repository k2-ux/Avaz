import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

import { useRecordingStore } from '../store/recordingStore';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const BAR_COUNT = 30;
const BAR_WIDTH = 6;
const BAR_SPACING = 4;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function RecordScreen() {
  const navigation = useNavigation();

  const {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useRecordingStore();

  // Animation values
  const pulseScale = useSharedValue(1);
  const waveAnimation = useSharedValue(0);
  const barsOpacity = useSharedValue(0.3);

  // Start pulse and wave animations when recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      // Pulsing animation for the mic circle
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );

      // Waveform animation
      waveAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );

      barsOpacity.value = withTiming(1, { duration: 300 });
    } else {
      // Stop animations
      pulseScale.value = withTiming(1, { duration: 300 });
      waveAnimation.value = withTiming(0, { duration: 300 });
      barsOpacity.value = withTiming(0.3, { duration: 300 });
    }
  }, [isRecording, isPaused]);

  // Random bar heights
  const barHeights = Array.from(
    { length: BAR_COUNT },
    () => 20 + Math.random() * 40,
  );

  const handleStop = async () => {
    await stopRecording();
    navigation.navigate('Preview' as never);
  };

  // Format time as mm:ss
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <LinearGradient
      colors={['#0f0c1f', '#1b1a2e', '#23233a']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Record Voice</Text>
        <Text style={styles.headerSubtitle}>
          {isRecording
            ? isPaused
              ? 'Recording paused'
              : 'Recording in progress...'
            : 'Ready to record'}
        </Text>
      </View>

      {/* Timer Display */}
      <Animated.View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
      </Animated.View>

      {/* Waveform Visualization */}
      <View style={styles.waveformContainer}>
        {barHeights.map((height, index) => {
          // Animated style for each bar
          const barStyle = useAnimatedStyle(() => {
            const scale =
              isRecording && !isPaused
                ? interpolate(
                    waveAnimation.value,
                    [0, 1],
                    [0.8 + (index % 3) * 0.1, 1.3 + (index % 2) * 0.2],
                  )
                : 1;
            return {
              transform: [{ scaleY: scale }],
              opacity: barsOpacity.value,
              backgroundColor: isRecording && !isPaused ? '#7f5af0' : '#4f46e5',
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

      {/* Microphone Icon with Pulse */}
      <Animated.View style={[styles.micContainer, pulseStyle]}>
        <LinearGradient
          colors={
            isRecording && !isPaused
              ? ['#7f5af0', '#6c4fd1']
              : ['#4a4a5a', '#3a3a4a']
          }
          style={styles.micGradient}
        >
          <Text style={styles.micIcon}>🎙️</Text>
        </LinearGradient>
      </Animated.View>

      {/* Control Buttons */}
      <View style={styles.buttonContainer}>
        {!isRecording && (
          <AnimatedTouchable
            onPress={startRecording}
            activeOpacity={0.8}
            style={styles.primaryButton}
          >
            <LinearGradient
              colors={['#7f5af0', '#6c4fd1']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start Recording</Text>
            </LinearGradient>
          </AnimatedTouchable>
        )}

        {isRecording && !isPaused && (
          <AnimatedTouchable
            onPress={pauseRecording}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <LinearGradient
              colors={['#ffaa33', '#ff8800']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Pause</Text>
            </LinearGradient>
          </AnimatedTouchable>
        )}

        {isRecording && isPaused && (
          <AnimatedTouchable
            onPress={resumeRecording}
            activeOpacity={0.8}
            style={styles.primaryButton}
          >
            <LinearGradient
              colors={['#7f5af0', '#6c4fd1']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Resume</Text>
            </LinearGradient>
          </AnimatedTouchable>
        )}

        {isRecording && (
          <AnimatedTouchable
            onPress={handleStop}
            activeOpacity={0.8}
            style={styles.stopButton}
          >
            <LinearGradient
              colors={['#ff4d4d', '#cc3b3b']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Stop Recording</Text>
            </LinearGradient>
          </AnimatedTouchable>
        )}
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
    marginBottom: 20,
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
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '300',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    marginBottom: 30,
  },
  waveBar: {
    width: BAR_WIDTH,
    marginHorizontal: BAR_SPACING / 2,
    borderRadius: BAR_WIDTH / 2,
    backgroundColor: '#4f46e5',
  },
  micContainer: {
    alignSelf: 'center',
    marginBottom: 40,
  },
  micGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7f5af0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  micIcon: {
    fontSize: 50,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#7f5af0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  secondaryButton: {
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#ffaa33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  stopButton: {
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
