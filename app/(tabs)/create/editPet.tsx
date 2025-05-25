// app/(tabs)/create/editPet.tsx
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Appbar, Button, TextInput, Title } from 'react-native-paper';

const API = 'http://192.168.0.100:3000';

export default function EditPetScreen() {
  const { pet_id } = useLocalSearchParams<{ pet_id: string }>();
  const router = useRouter();

  const [name, setName]       = useState('');
  const [type, setType]       = useState('');
  const [breed, setBreed]     = useState('');
  const [age, setAge]         = useState('');
  const [needs, setNeeds]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pet_id) return;
    axios
      .get(`${API}/pets?pet_id=eq.${pet_id}`)
      .then(r => {
        const pet = r.data[0];
        setName(pet.name);
        setType(pet.type);
        setBreed(pet.breed || '');
        setAge(pet.age?.toString() || '');
        setNeeds(pet.special_needs || '');
      })
      .catch(e => Alert.alert('Error loading pet', e.message));
  }, [pet_id]);

  const save = async () => {
    if (!name || !type) {
      return Alert.alert('Please fill in at least name and type');
    }
    setLoading(true);
    try {
      await axios.patch(`${API}/pets?pet_id=eq.${pet_id}`, {
        name,
        type,
        breed: breed || null,
        age: age ? parseInt(age, 10) : null,
        special_needs: needs || null,
      });
      Alert.alert('Saved!', 'Your changes have been saved.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error saving', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Pet" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>Pet ID: {pet_id}</Title>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          label="Type"
          value={type}
          onChangeText={setType}
          style={styles.input}
        />
        <TextInput
          label="Breed"
          value={breed}
          onChangeText={setBreed}
          style={styles.input}
        />
        <TextInput
          label="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          label="Special Needs"
          value={needs}
          onChangeText={setNeeds}
          multiline
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={save}
          loading={loading}
          style={styles.button}
        >
          Save Changes
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding:16 },
  title:     { textAlign:'center', marginBottom:12 },
  input:     { marginBottom:16 },
  button:    { marginTop:8 },
});