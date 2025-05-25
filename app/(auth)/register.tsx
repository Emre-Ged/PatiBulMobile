// app/(auth)/register.tsx
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet
} from 'react-native';
import {
  Appbar,
  Button,
  Snackbar,
  TextInput
} from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';

export default function RegisterScreen() {
  const { register } = useContext(AuthContext);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    setLoading(true);
    try {
      await register(name, email, password);
      setSuccessVisible(true);
      router.replace('(tabs)');
    } catch {}
    setLoading(false);
  };

  return (
    <>
      <Appbar.Header><Appbar.Content title="Register" /></Appbar.Header>
      <SafeAreaView style={styles.container}>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          label="Email"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
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
          Register
        </Button>
        <Snackbar
          visible={successVisible}
          onDismiss={() => setSuccessVisible(false)}
          duration={2000}
        >
          Registration successful!
        </Snackbar>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16 },
  input:    { marginBottom:12 },
});