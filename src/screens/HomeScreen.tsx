import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

import { useEntryStore } from '../store/entryStore';
import { usePlayerStore } from '../store/playerStore';
import { Entry } from '../models/Entry';
import { formatDuration } from '../utils/time';
import { signOut } from 'aws-amplify/auth';
import { useAuthStore } from '../store/authStore';
import { getS3Url } from '../services/s3Service';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen({ navigation }: any) {
  const { entries, loadEntries, deleteEntry } = useEntryStore();
  const { startPlayback } = usePlayerStore();
  const { logout } = useAuthStore();

  useEffect(() => {
    loadEntries();
  }, []);

const playEntry = async (entry: Entry) => {
  if (entry.synced) {
    if (entry.audioUrl) {
      const url = await getS3Url(entry.audioUrl);
      await startPlayback(url);
    }
  } else {
    await startPlayback(entry.audioPath);
  }
};
  // FAB animation
  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handlePressIn = () => {
    fabScale.value = withSpring(0.9);
  };
  const handlePressOut = () => {
    fabScale.value = withSpring(1);
  };
  const handleLogout = async () => {
    try {
      await signOut();
      logout();
    } catch (err) {
      console.log('Logout error:', err);
    }
  };
  const renderItem = ({ item, index }: { item: Entry; index: number }) => {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={styles.card}
      >
        <LinearGradient
          colors={['#1e1e2f', '#2a2a40']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardTitle}>🎙 Voice Entry</Text>
              <Text style={styles.cardDetail}>
                {formatDuration(item.duration)}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => playEntry(item)}
                style={styles.playButton}
              >
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => deleteEntry(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f0c1f', '#1b1a2e', '#23233a']}
      style={styles.container}
    >
      {/* Animated Header */}
      <Animated.View entering={FadeInRight.delay(200)} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Your Diary</Text>
            <Text style={styles.headerSubtitle}>{entries.length} entries</Text>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* List */}
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Animated FAB */}
      <AnimatedTouchable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate('Record')}
        style={[styles.fab, fabAnimatedStyle]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#7f5af0', '#6c4fd1']}
          style={styles.fabGradient}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </AnimatedTouchable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cardGradient: {
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#7f5af0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 40,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});
