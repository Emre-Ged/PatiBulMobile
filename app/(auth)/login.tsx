// app/(auth)/login.tsx
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet
} from 'react-native';
import {
  Appbar,
  Button,
  TextInput
} from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const router = useRouter();

  const onSubmit = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch {}
    setLoading(false);
  };

  return (
    <>
      <Appbar.Header><Appbar.Content title="Log In" /></Appbar.Header>
      <SafeAreaView style={styles.container}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Button
          mode="contained"
          loading={loading}
          onPress={onSubmit}
        >
          Log In
        </Button>
        <Button
          onPress={() => router.push('register')}
          style={styles.link}
        >
          Don’t have an account? Register
        </Button>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16 },
  input:    { marginBottom:12 },
  link:     { marginTop:16, alignSelf:'center' },
});