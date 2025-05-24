// app/(tabs)/profile.tsx
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Paragraph,
  Title,
} from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';

const API = 'http://192.168.0.10:3000';

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const userId = user?.user_id;
  const { logout, deleteAccount } = useContext(AuthContext);
  const router = useRouter();

  if (!user) return (
    <SafeAreaView style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Title>Please log in to view your profile</Title>
      <Button mode="contained" onPress={() => router.replace('/login')}>
        Log In
      </Button>
    </SafeAreaView>
  );

  const [pets,    setPets]    = useState<any[]>([]);
  const [reviews,setReviews]  = useState<any[]>([]);
  const [userData,    setUser]    = useState<any>(null);

  // helper to reload pets list
  async function loadPets() {
    try {
      const resp = await axios.get(`${API}/pets?owner_id=eq.${userId}`);
      setPets(resp.data);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  useEffect(() => {
    if (!userId) return;
    // Load user info
    axios.get(`${API}/user_main?user_id=eq.${userId}`)
      .then(r => setUser(r.data[0]))
      .catch(e => Alert.alert('Error', e.message));

    // Load pets
    loadPets();

    // Load reviews received
    axios.get(`${API}/reviews?reviewed_id=eq.${userId}`)
      .then(r => setReviews(r.data))
      .catch(e => Alert.alert('Error', e.message));
  }, [userId]);

  return (
    <SafeAreaView style={{ flex:1 }}>
      <Appbar.Header>
        <Appbar.Content title="Profile" />
      </Appbar.Header>

      {userData && (
        <Card style={styles.card}>
          <Card.Title
            title={userData.name}
            subtitle={`${userData.rating} ★`}
            left={props =>
              <Avatar.Text
                {...props}
                label={userData.name.slice(0,2).toUpperCase()}
              />
            }
          />
          <Card.Actions>
            <Button onPress={async () => {
              await logout();
              router.replace('/login');
            }}>Log Out</Button>
            <Button onPress={() => {
              Alert.alert(
                'Delete Account?',
                'This cannot be undone.',
                [
                  { text:'Cancel', style:'cancel' },
                  { text:'Delete', style:'destructive', onPress: async () => {
                    await deleteAccount();
                    router.replace('/login');
                  } }
                ]
              );
            }}>
              Delete Account
            </Button>
          </Card.Actions>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => router.push('create/newPet')}
            style={{ marginHorizontal: 16, marginBottom: 12 }}
          >
            Add Pet
          </Button>
        </Card>
      )}

      {/* Pets Section */}
      <Title style={styles.section}>My Pets</Title>
      <FlatList
        data={pets}
        keyExtractor={i => String(i.pet_id)}
        ListEmptyComponent={() =>
          <Paragraph style={styles.empty}>
            No pets registered.
          </Paragraph>
        }
        renderItem={({item}) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.name} ({item.type})</Title>
              <Paragraph>Breed: {item.breed}</Paragraph>
              <Paragraph>Age: {item.age}</Paragraph>
              {item.special_needs && (
                <Paragraph>Needs: {item.special_needs}</Paragraph>
              )}
            </Card.Content>
            <Card.Actions>
              <Button
                mode="text"
                onPress={() => {
                  Alert.alert(
                    'Delete Pet?',
                    'This will remove the pet permanently.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await axios.delete(`${API}/pets?pet_id=eq.${item.pet_id}`);
                            loadPets();
                          } catch (e) {
                            Alert.alert('Error', e.message);
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                Delete
              </Button>
            </Card.Actions>
          </Card>
        )}
      />

      {/* Reviews Section */}
      <Title style={styles.section}>My Reviews</Title>
      <FlatList
        data={reviews}
        keyExtractor={i => String(i.review_id)}
        ListEmptyComponent={() =>
          <Paragraph style={styles.empty}>
            No reviews yet.
          </Paragraph>
        }
        renderItem={({item}) => (
          <Card style={styles.card}>
            <Card.Content>
              <Paragraph style={styles.reviewRating}>
                {item.rating} ★
              </Paragraph>
              {item.review_comment && (
                <Paragraph>"{item.review_comment}"</Paragraph>
              )}
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section:      { margin:16, fontSize:18, fontWeight:'bold' },
  card:         { marginHorizontal:16, marginBottom:12 },
  empty:        { textAlign:'center', marginTop:32, color:'gray' },
  reviewRating: { fontSize:16, fontWeight:'600', marginBottom:4 },
});