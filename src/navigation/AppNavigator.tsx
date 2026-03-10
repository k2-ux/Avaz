import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import RecordScreen from '../screens/RecordScreen';
import PreviewScreen from '../screens/PreviewScreen';

import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuthStore();

  // Define screen configurations
  const authScreens = {
    Login: LoginScreen,
    Signup: SignupScreen,
  };

  const appScreens = {
    Home: HomeScreen,
    Record: RecordScreen,
    Preview: PreviewScreen,
  };

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {Object.entries(authScreens).map(([name, component]) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {Object.entries(appScreens).map(([name, component]) => (
        <Stack.Screen key={name} name={name} component={component} />
      ))}
    </Stack.Navigator>
  );
}
