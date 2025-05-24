// app/(tabs)/newPet.tsx
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Appbar,
  Button,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import { AuthContext } from '../../../context/AuthContext';

const API = 'http://192.168.0.105:3000';

export default function NewPetScreen() {
  const { user } = useContext(AuthContext);
  const ownerId = user?.user_id;
  const router = useRouter();

  const [name, setName]               = useState('');
  const [type, setType]               = useState('');
  const [breed, setBreed]             = useState('');
  const [age, setAge]                 = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [loading, setLoading]         = useState(false);
  const [visible, setVisible]         = useState(false);

  const handleSubmit = async () => {
    if (!ownerId) return Alert.alert('Not authenticated');
    if (!name.trim() || !type.trim()) return Alert.alert('Name and Type are required');
    setLoading(true);
    try {
      await axios.post(`${API}/pets`, {
        owner_id:      ownerId,
        name:          name.trim(),
        type:          type.trim(),
        breed:         breed.trim()   || null,
        age:           age ? parseInt(age, 10) : null,
        special_needs: specialNeeds.trim() || null,
      });
      setVisible(true);
      setName(''); setType(''); setBreed(''); setAge(''); setSpecialNeeds('');
      setTimeout(() => router.back(), 1000);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add New Pet" />
      </Appbar.Header>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={80}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={Keyboard.dismiss}
              style={styles.input}
            />
            <TextInput
              label="Type"
              value={type}
              onChangeText={setType}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={Keyboard.dismiss}
              style={styles.input}
            />
            <TextInput
              label="Breed"
              value={breed}
              onChangeText={setBreed}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={Keyboard.dismiss}
              style={styles.input}
            />
            <TextInput
              label="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={Keyboard.dismiss}
              style={styles.input}
            />
            <TextInput
              label="Special Needs"
              value={specialNeeds}
              onChangeText={setSpecialNeeds}
              multiline
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={Keyboard.dismiss}
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            >
              Add Pet
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
      >
        Pet added successfully!
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input:     { marginBottom: 12 },
  button:    { marginTop: 16 },
});