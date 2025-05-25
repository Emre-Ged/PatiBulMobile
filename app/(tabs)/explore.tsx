// app/(tabs)/explore.tsx
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
  TextInput,
} from 'react-native-paper';

const API = 'http://192.168.0.100:3000';

export default function ExploreScreen() {
  const [results, setResults]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [fromDate, setFromDate] = useState<string>(''); 
  const [toDate, setToDate]     = useState<string>('');
  const [showPicker, setShowPicker] = useState<'from'|'to'|null>(null);

  const runSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('select', 'event_id,date_time,location,user_main(name),pets(name,pet_id,type,breed)');
      params.append('role_type', 'eq.Owner');
      params.append('status', 'eq.pending');

      if (fromDate) {
        params.append('date_time', `gte.${fromDate}`);
      }
      if (toDate) {
        params.append('date_time', `lte.${toDate}`);
      }

      const url = `${API}/care_event?${params.toString()}`;
      const { data } = await axios.get(url);

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
        <TextInput
          label="From Date"
          value={
            fromDate
              ? new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Any'
          }
          editable={false}
          style={styles.input}
          left={
            <TextInput.Icon
              icon="calendar"
              forceTextInputFocus={false}
              onPress={() => {
                setShowPicker('from');
              }}
            />
          }
          right={
            <TextInput.Icon
              icon="close-circle"
              onPress={() => setFromDate('')}
            />
          }
        />
        <TextInput
          label="To Date"
          value={
            toDate
              ? new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Any'
          }
          editable={false}
          style={styles.input}
          left={
            <TextInput.Icon
              icon="calendar"
              forceTextInputFocus={false}
              onPress={() => {
                setShowPicker('to');
              }}
            />
          }
          right={
            <TextInput.Icon
              icon="close-circle"
              onPress={() => setToDate('')}
            />
          }
        />
        <Button mode="contained" onPress={runSearch} loading={loading}>
          Search
        </Button>
      </View>
      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, selected) => {
            if (selected) {
              const yyyy = selected.getFullYear();
              const mm = String(selected.getMonth() + 1).padStart(2, '0');
              const dd = String(selected.getDate()).padStart(2, '0');
              const dateStr = `${yyyy}-${mm}-${dd}`;
              if (showPicker === 'from') {
                setFromDate(dateStr);
              } else {
                setToDate(dateStr);
              }
            }
            setShowPicker(null);
          }}
        />
      )}
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
  input:   { marginBottom: 12 },
});