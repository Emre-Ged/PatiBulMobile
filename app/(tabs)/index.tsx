// app/(tabs)/index.tsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Paragraph,
  TextInput,
  Title,
} from 'react-native-paper';

const API = 'http://192.168.0.105:3000';

export default function HomeScreen() {
  const [location, setLocation] = useState('Girne Park');
  const [services, setServices] = useState<any[]>([]);

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/care_event`, {
        params: {
          role_type: 'eq.Caregiver',
          status:    'eq.available',
          location:  `eq.${location}`,
        },
      });
      setServices(data);
    } catch (e: any) {
      Alert.alert('Fetch error', e.message);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.flex}>
      <Appbar.Header>
        <Appbar.Content title="Available Caregivers" />
      </Appbar.Header>

      <View style={styles.searchRow}>
        <TextInput
          mode="outlined"
          label="Location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
        <Button mode="contained" onPress={load} style={styles.button}>
          Go
        </Button>
      </View>

      <FlatList
        data={services}
        keyExtractor={i => String(i.event_id)}
        ListEmptyComponent={() => <Paragraph style={styles.empty}>No services found.</Paragraph>}
        contentContainerStyle={services.length===0 && styles.emptyContainer}
        renderItem={({ item }) => (
          <Card style={styles.card} elevation={2}>
            <Card.Content>
              <Title>Event #{item.event_id}</Title>
              <Paragraph>When: {new Date(item.date_time).toLocaleString()}</Paragraph>
              <Paragraph>Where: {item.location}</Paragraph>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex:           { flex: 1 },
  searchRow:      { flexDirection: 'row', padding: 16 },
  input:          { flex: 1, marginRight: 8 },
  button:         { alignSelf: 'center' },
  card:           { marginHorizontal: 16, marginBottom: 12 },
  empty:          { textAlign: 'center', marginTop: 32, color: 'gray' },
  emptyContainer: { flex:1, justifyContent:'center' },
});