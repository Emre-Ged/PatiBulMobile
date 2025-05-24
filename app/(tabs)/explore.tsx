// app/(tabs)/explore.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
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
  Switch,
  TextInput
} from 'react-native-paper';

const API = 'http://192.168.0.105:3000';

export default function ExploreScreen() {
  const [petType, setPetType]       = useState('');
  const [from, setFrom]             = useState<Date>(new Date());
  const [to, setTo]                 = useState<Date>(new Date());
  const [showDT, setShowDT]         = useState<'from'|'to'|null>(null);
  const [unmatched, setUnmatched]   = useState(true);
  const [results, setResults]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);

  const runSearch = async () => {
    setLoading(true);
    try {
      // build shared params object
      const params: any = {};
      let data;

      if (petType) {
        // j) caregivers who service a particular pet type
        params.select      = 'user_main(name),pets(type)';
        params['role_type']= 'eq.Caregiver';
        params['pets.type']= `eq.${petType}`;
        ({ data } = await axios.get(`${API}/care_event`, { params }));
        // data elements will have { user_main: { name }, pets: { type } }
      } else {
        // i) care events in a given date range
        params.select        = '*,user_main(name),pets(type)';
        params['date_time']  = `gte.${from.toISOString()}`;
        params['date_time'] += `,lte.${to.toISOString()}`;
        ({ data } = await axios.get(`${API}/care_event`, { params }));
        // data elements will include user_main.name and pets.type
      }

      setResults(data);
    } catch(e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex:1}}>
      <Appbar.Header><Appbar.Content title="Explore Requests" /></Appbar.Header>
      <View style={styles.filters}>
        <TextInput
          label="Pet Type"
          value={petType}
          onChangeText={setPetType}
          style={styles.input}
        />
        <View style={styles.dtRow}>
          <Button onPress={()=>setShowDT('from')}>From: {from.toLocaleDateString()}</Button>
          <Button onPress={()=>setShowDT('to')}>To:   {to.toLocaleDateString()}</Button>
        </View>
        <View style={styles.switchRow}>
          <Paragraph>Unmatched only</Paragraph>
          <Switch value={unmatched} onValueChange={setUnmatched} />
        </View>
        <Button mode="contained" onPress={runSearch} loading={loading}>
          Search
        </Button>
      </View>

      {showDT && (
        <DateTimePicker
          value={ showDT==='from' ? from : to }
          mode="date"
          display="default"
          onChange={(_, val)=>{
            if (showDT==='from' && val) setFrom(val);
            if (showDT==='to'   && val) setTo(val);
            setShowDT(null);
          }}
        />
      )}

      <FlatList
        data={results}
        keyExtractor={(item, index) =>
          item.event_id
            ? String(item.event_id)
            : `${item.user_main?.name}-${item.pets?.type}-${index}`
        }
        ListEmptyComponent={()=> <Paragraph style={styles.empty}>No results.</Paragraph>}
        renderItem={({item}) => (
          <Card style={styles.card}>
            <Card.Content>
              {item.user_main && (
                <Paragraph>Name: {item.user_main.name}</Paragraph>
              )}
              {item.pets && (
                <Paragraph>Pet Type: {item.pets.type}</Paragraph>
              )}
              <Paragraph>
                Date: {new Date(item.date_time).toLocaleString()}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filters: { padding:16 },
  input:   { marginBottom:12 },
  dtRow:   { flexDirection:'row', justifyContent:'space-between', marginBottom:12 },
  switchRow:{ flexDirection:'row', alignItems:'center', marginBottom:12 },
  card:    { margin:16, marginBottom:12 },
  empty:   { textAlign:'center', marginTop:32, color:'gray' },
});