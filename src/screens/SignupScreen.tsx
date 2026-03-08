import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { authService } from '../services/authService';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signup = async () => {
    try {
      await authService.signup(email, password);
      navigation.replace('Login');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 20 }}
      />

      <Button title="Create Account" onPress={signup} />
    </View>
  );
}
