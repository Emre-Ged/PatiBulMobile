// app/(tabs)/MatchScreen.tsx
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    SectionList,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';

const API = 'http://192.168.0.100:3000';

export default function MatchScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [offers, setOffers]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);

  // Pull–to–refresh
  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  // Load only *your* pending requests + all available offers
  async function loadData() {
    if (!user?.user_id) return;
    try {
      const [rReq, rOff] = await Promise.all([
        axios.get(`${API}/care_event`, {
          params: {
            role_type: 'eq.Owner',
            status:    'eq.pending',
            user_id:   `eq.${user.user_id}`
          }
        }),
        axios.get(`${API}/care_event`, {
          params: {
            role_type: 'eq.Caregiver',
            status:    'eq.available'
          }
        })
      ]);
      setRequests(rReq.data);
      setOffers(rOff.data);
    } catch (e: any) {
      Alert.alert('Error loading', e.message);
    }
  }

  useEffect(() => { loadData(); }, [user]);

  // Book a request against an offer
  const handleBook = async (reqId: number, offId: number) => {
    setLoading(true);
    try {
      await axios.post(`${API}/bookings`, {
        request_event_id: reqId,
        offer_event_id:   offId,
        status:           'pending'
      });
      await Promise.all([
        axios.patch(`${API}/care_event?event_id=eq.${reqId}`, { status:'matched' }),
        axios.patch(`${API}/care_event?event_id=eq.${offId}`, { status:'matched' }),
      ]);
      Alert.alert('Booked!', `Request #${reqId} matched with offer #${offId}.`);
      await loadData();
    } catch (e: any) {
      Alert.alert('Booking failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex:1 }}>
      <SectionList
        sections={[
          { title: 'My Owner Requests',      data: requests },
          { title: 'Available Caregiver Offers', data: offers }
        ]}
        keyExtractor={item => String(item.event_id)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderSectionHeader={({ section }) => (
          <Title style={styles.header}>{section.title}</Title>
        )}
        renderItem={({ item, section }) => {
          if (section.title === 'My Owner Requests') {
            return (
              <TouchableOpacity onPress={() => setSelectedRequest(item.event_id)}>
                <Card style={[styles.card, selectedRequest === item.event_id && styles.selectedCard]}>
                  <Card.Content>
                    <Paragraph>
                      #{item.event_id} @ {new Date(item.date_time).toLocaleString()}
                    </Paragraph>
                    <Paragraph>{item.location}</Paragraph>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          } else {
            // Caregiver Offers
            return (
              <Card style={styles.card}>
                <Card.Content>
                  <Paragraph>
                    #{item.event_id} @ {new Date(item.date_time).toLocaleString()}
                  </Paragraph>
                  <Paragraph>{item.location}</Paragraph>
                </Card.Content>
                <Card.Actions>
                  <Button
                    mode="contained"
                    loading={loading}
                    disabled={!selectedRequest}
                    onPress={() => handleBook(selectedRequest!, item.event_id)}
                  >
                    Book This
                  </Button>
                </Card.Actions>
              </Card>
            );
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:       { margin:16, fontSize:18, fontWeight:'bold' },
  card:         { marginHorizontal:16, marginBottom:12 },
  selectedCard: { borderWidth:2, borderColor:'#0066CC' },
});