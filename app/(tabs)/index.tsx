// app/(tabs)/index.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
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

const API = 'http://192.168.0.100:3000';

export default function HomeScreen() {
  const [location, setLocation] = useState('');
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo]     = useState<Date | null>(null);
  const [showDT, setShowDT] = useState<'from' | 'to' | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Build query params with optional filters
      const params: any = {
        role_type: 'eq.Caregiver',
        status:    'eq.available',
      };

      if (location.trim()) {
        params.location = `eq.${location.trim()}`;
      }

      // Only add date filters if user has selected both
      if (from && to) {
        // Use separate filters for gte and lte to avoid parsing errors
        params.date_time = [
          `gte.${from.toISOString()}`,
          `lte.${to.toISOString()}`,
        ];
      }

      const { data } = await axios.get(`${API}/care_event`, { params });
      setServices(data);
    } catch (e: any) {
      console.error('Search fetch error:', e.response?.data || e);
      const msg = e.response?.data?.message || e.message;
      Alert.alert('Fetch error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.flex}>
      <Appbar.Header>
        <Appbar.Content title="Available Caregivers" />
      </Appbar.Header>

      <View style={styles.filters}>
        <TextInput
          mode="outlined"
          label="Location"
          placeholder="e.g., Girne Park"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={() => Keyboard.dismiss()}
        />

        <View style={styles.dtRow}>
          <Button onPress={() => { Keyboard.dismiss(); setShowDT('from'); }}>
            From: {from ? from.toLocaleDateString() : 'Any'}
          </Button>
          <Button onPress={() => { Keyboard.dismiss(); setShowDT('to'); }}>
            To:   {to ? to.toLocaleDateString() : 'Any'}
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={() => { Keyboard.dismiss(); load(); }}
          loading={loading}
          style={styles.button}
        >
          Search
        </Button>
      </View>

      {showDT && (
        <DateTimePicker
          value={showDT === 'from' ? (from || new Date()) : (to || new Date())}
          mode="date"
          display="default"
          onChange={(_, val) => {
            if (val) {
              if (showDT === 'from') setFrom(val);
              if (showDT === 'to')   setTo(val);
            }
            setShowDT(null);
          }}
        />
      )}

      <FlatList
        data={services}
        keyExtractor={i => String(i.event_id)}
        ListEmptyComponent={() => (
          <Paragraph style={styles.empty}>No services found.</Paragraph>
        )}
        contentContainerStyle={services.length === 0 && styles.emptyContainer}
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
  filters:        { padding: 16 },
  input:          { marginBottom: 12 },
  dtRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  button:         { marginTop: 8 },
  card:           { marginHorizontal: 16, marginBottom: 12 },
  empty:          { textAlign: 'center', marginTop: 32, color: 'gray' },
  emptyContainer: { flex: 1, justifyContent: 'center' },
});