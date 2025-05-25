// app/(tabs)/explore.tsx
import axios from 'axios';
import React, { useState } from 'react';
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
} from 'react-native-paper';

const API = 'http://192.168.0.100:3000';

export default function ExploreScreen() {
  const [results, setResults]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);

  const runSearch = async () => {
    setLoading(true);
    try {
      // fetch pending Owner requests
      const params: any = {};
      params.select      = 'event_id,date_time,location,user_main(name),pets(name,pet_id,type,breed)';
      params.role_type   = 'eq.Owner';
      params.status      = 'eq.pending';

      const { data } = await axios.get(`${API}/care_event`, { params });

      setResults(data);
    } catch(e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex:1}}>
      <Appbar.Header><Appbar.Content title="Available Requests" /></Appbar.Header>
      <View style={styles.filters}>
        <Button mode="contained" onPress={runSearch} loading={loading}>
          Search
        </Button>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) =>
          item.event_id
            ? String(item.event_id)
            : `${item.user_main?.name}-${item.pets?.name}-${index}`
        }
        ListEmptyComponent={()=> <Paragraph style={styles.empty}>No results.</Paragraph>}
        renderItem={({item}) => (
          <Card style={styles.card}>
            <Card.Content>
              <Paragraph>Request ID: {item.event_id}</Paragraph>
              <Paragraph>Pet: {item.pets?.name} (ID: {item.pets?.pet_id})</Paragraph>
              <Paragraph>Type: {item.pets?.type}</Paragraph>
              <Paragraph>Breed: {item.pets?.breed}</Paragraph>
              <Paragraph>Owner: {item.user_main?.name}</Paragraph>
              <Paragraph>Date: {new Date(item.date_time).toLocaleString()}</Paragraph>
              <Paragraph>Location: {item.location}</Paragraph>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filters: { padding:16 },
  card:    { margin:16, marginBottom:12 },
  empty:   { textAlign:'center', marginTop:32, color:'gray' },
});