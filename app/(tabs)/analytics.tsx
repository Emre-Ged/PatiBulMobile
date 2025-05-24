import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { Appbar, Card, Paragraph, Title } from 'react-native-paper';

const API = 'http://192.168.0.100:3000';

export default function AnalyticsScreen() {
  const [topRated, setTopRated]   = useState<any[]>([]);
  const [mostBooked, setMostBooked] = useState<any[]>([]);
  const [topOwners, setTopOwners] = useState<any[]>([]);

  useEffect(() => {
    // b & m: top‐rated caregivers
    axios.get(`${API}/user_main`, { params:{ order:'rating.desc', limit:5 }})
      .then(r => setTopRated(r.data))
      .catch(e => Alert.alert('Error', e.message));

    // f: caregivers by completed bookings
    axios.get(`${API}/care_event`, {
      params:{
        select:   'user_id, count(event_id) as cnt',
        role_type:'eq.Caregiver',
        status:   'eq.completed',
        group:    'user_id',
        order:    'cnt.desc',
        limit:    5
      }
    }).then(r => setMostBooked(r.data))
      .catch(e => Alert.alert('Error', e.message));

    // p: owners with most requests
    axios.get(`${API}/care_event`, {
      params:{
        select:   'user_id, count(event_id) as cnt',
        role_type:'eq.Owner',
        group:    'user_id',
        order:    'cnt.desc',
        limit:    5
      }
    }).then(r => setTopOwners(r.data))
      .catch(e => Alert.alert('Error', e.message));
  }, []);

  return (
    <SafeAreaView style={styles.flex}>
      <Appbar.Header><Appbar.Content title="Analytics" /></Appbar.Header>
      <FlatList
        ListHeaderComponent={() => <>
          <Title style={styles.section}>📊 Top Rated Caregivers</Title>
          {topRated.map(u =>
            <Card key={u.user_id} style={styles.card}>
              <Card.Content>
                <Paragraph>{u.name} — {u.rating}★</Paragraph>
              </Card.Content>
            </Card>
          )}

          <Title style={styles.section}>🏆 Most Completed Bookings</Title>
          {mostBooked.map(r =>
            <Card key={r.user_id} style={styles.card}>
              <Card.Content>
                <Paragraph>{r.user_id} — {r.cnt} bookings</Paragraph>
              </Card.Content>
            </Card>
          )}

          <Title style={styles.section}>⭐ Power Users (owners)</Title>
          {topOwners.map(r =>
            <Card key={r.user_id} style={styles.card}>
              <Card.Content>
                <Paragraph>{r.user_id} — {r.cnt} requests</Paragraph>
              </Card.Content>
            </Card>
          )}
        </>}
        data={[]}
        renderItem={null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex:1 },
  section:   { margin:16, fontSize:18, fontWeight:'bold' },
  card:      { marginHorizontal:16, marginBottom:12 },
});