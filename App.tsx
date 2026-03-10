import 'react-native-get-random-values';
import 'web-streams-polyfill/dist/polyfill';

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { syncEntries } from './src/services/syncService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './src/services/amplify';
import { Buffer } from 'buffer';

(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

export default function App() {
  const { checkUser } = useAuthStore();

  useEffect(() => {
    async function init() {
      await checkUser();

      const { user } = useAuthStore.getState();

      if (user) {
        await syncEntries();
      }
    }

    init();
  }, []);

  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}