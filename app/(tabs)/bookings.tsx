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
  Button,
  Card,
  Paragraph,
  Title,
} from 'react-native-paper';

import { AuthContext } from '../../context/AuthContext';
const API = 'http://192.168.0.105:3000';

export default function BookingsScreen() {
  const { user } = useContext(AuthContext);
  const userId = user?.user_id;
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();

  // Load this user’s events (both requests & offers)
  const loadEvents = async () => {
    try {
      const resp = await axios.get(`${API}/care_event`, {
        params: {
          user_id: `eq.${userId}`,
          order:   'date_time.asc',
        },
      });
      setEvents(resp.data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  // Mark an event completed
  const markCompleted = async (id: number) => {
    try {
      await axios.patch(`${API}/care_event`, 
        { status: 'completed' },
        { params: { event_id: `eq.${id}` } }
      );
      loadEvents();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="My Events" />
      </Appbar.Header>

      <FlatList
        data={events}
        keyExtractor={i => String(i.event_id)}
        ListEmptyComponent={() => <Paragraph style={styles.empty}>No events.</Paragraph>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>
                #{item.event_id} ({item.role_type})
              </Title>
              <Paragraph>
                {new Date(item.date_time).toLocaleString()}
              </Paragraph>
              <Paragraph>
                Location: {item.location}
              </Paragraph>
              <Paragraph>Status: {item.status}</Paragraph>
            </Card.Content>
            <Card.Actions>
              {/* Only show “Complete” on pending events */}
              {item.status === 'pending' && (
                <Button
                  onPress={() => markCompleted(item.event_id)}
                >
                  Mark Completed
                </Button>
              )}
              {/* Always allow “Review” once completed */}
              {item.status === 'completed' && (
                <Button
                  onPress={() => router.push({
                    pathname: '/reviewForm',
                    params: {
                      event_id: String(item.event_id),
                      // Who to review? If I’m the Owner, review the caregiver:
                      reviewed_id: String(
                        item.role_type === 'Owner'
                          ? /* find caregiver’s user_id via your matching logic */
                            /* for demo, just review yourself */ userId
                          : /* otherwise review the owner */ userId
                      )
                    }
                  })}
                >
                  Leave Review
                </Button>
              )}
            </Card.Actions>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  card:      { margin:16, marginBottom:12 },
  empty:     { textAlign:'center', marginTop:32, color:'gray' },
});