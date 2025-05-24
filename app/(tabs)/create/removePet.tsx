// app/(tabs)/removePet.tsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Paragraph,
  Title,
} from 'react-native-paper';
import { AuthContext } from '../../../context/AuthContext';

const API = 'http://192.168.0.105:3000';

export default function RemovePetScreen() {
  const { user } = useContext(AuthContext);
  const ownerId = user?.user_id;
  const [pets, setPets] = useState<any[]>([]);

  const loadPets = async () => {
    if (!ownerId) return;
    try {
      const resp = await axios.get(`${API}/pets?owner_id=eq.${ownerId}`);
      setPets(resp.data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  useEffect(() => {
    loadPets();
  }, [ownerId]);

  const confirmDelete = (pet_id: number) => {
    Alert.alert(
      'Delete Pet?',
      'This will permanently remove this pet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API}/pets?pet_id=eq.${pet_id}`);
              loadPets();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => { /* optional back */ }} />
        <Appbar.Content title="Remove a Pet" />
      </Appbar.Header>

      <Title style={styles.section}>My Pets</Title>
      <FlatList
        data={pets}
        keyExtractor={i => String(i.pet_id)}
        ListEmptyComponent={() => (
          <Paragraph style={styles.empty}>No pets to remove.</Paragraph>
        )}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.name} ({item.type})</Title>
              <Paragraph>Breed: {item.breed}</Paragraph>
              <Paragraph>Age: {item.age}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="text"
                onPress={() => confirmDelete(item.pet_id)}
              >
                Delete
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: { margin:16, fontSize:18, fontWeight:'bold' },
  card:    { marginHorizontal:16, marginBottom:12 },
  empty:   { textAlign:'center', marginTop:32, color:'gray' },
});