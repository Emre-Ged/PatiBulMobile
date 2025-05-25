// app/(tabs)/bookings.tsx
import axios from 'axios';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert, FlatList, SafeAreaView, StyleSheet
} from 'react-native';
import { Button, Card, IconButton, Paragraph, Title } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';

const API = 'http://192.168.0.100:3000';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState<number[]>([]);
  const router = useRouter();
  const { user } = useContext(AuthContext);

  async function load() {
    if (!user?.user_id) return;
    try {
      const select = [
        '*',
        'request:care_event!request_event_id(date_time,location,user_id)',
        'offer:care_event!offer_event_id(date_time,location,user_id)'
      ].join(',');
      const { data } = await axios.get(`${API}/bookings`, {
        params: { select }
      });
      // filter only bookings where current user is owner or caregiver
      const filtered = data.filter((b: any) =>
        b.request.user_id === user!.user_id ||
        b.offer.user_id   === user!.user_id
      );
      setBookings(filtered);
      // build unique user IDs from both request and offer
      const ids = Array.from(new Set(data.flatMap((b: any) => [
        b.request.user_id,
        b.offer.user_id
      ])));
      if (ids.length) {
        axios.get(`${API}/user_main`, {
          params: {
            select: 'user_id,name',
            user_id: `in.(${ids.join(',')})`
          }
        })
        .then(r => {
          const map: Record<number, string> = {};
          r.data.forEach((u: any) => {
            map[u.user_id] = u.name;
          });
          setUserMap(map);
          // fetch which bookings this user already reviewed
          axios.get(`${API}/reviews`, {
            params: {
              reviewer_id: `eq.${user.user_id}`,
              select: 'booking_id'
            }
          })
          .then(r => {
            setReviewedBookings(r.data.map((rv: any) => rv.booking_id));
          })
          .catch(() => {});
        })
        .catch(() => {});
      }
    } catch(e:any) {
      Alert.alert('Error', e.message);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    // strong haptic feedback on pull-to-refresh
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await load();
    setRefreshing(false);
  }

  useEffect(() => { load(); }, [user]);

  async function handleCompleteBooking(bookingId: number, reviewedId: number) {
    setLoading(true);
    try {
      await axios.patch(`${API}/bookings?booking_id=eq.${bookingId}`, {
        status: 'completed'
      });
      Alert.alert('Completed', `Booking ${bookingId} marked completed.`);
      await load();
      router.push({ pathname: 'create/reviewForm', params: { event_id: bookingId, reviewed_id: reviewedId } });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveBooking(id: number) {
    setBookings(bs => bs.filter(b => b.booking_id !== id));
  }

  return (
    <SafeAreaView style={{flex:1}}>
      <Title style={styles.header}>Bookings</Title>
      <FlatList
        data={bookings}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyExtractor={i=>String(i.booking_id)}
        renderItem={({item})=>{
          const isOwner = user?.user_id === item.request.user_id;
          const reviewedUserId = isOwner
            ? item.offer.user_id
            : item.request.user_id;
          return (
          <Card style={styles.card}>
            {item.status === 'completed' && reviewedBookings.includes(item.booking_id) && (
              <IconButton
                icon="close"
                style={styles.removeIcon}
                onPress={() => handleRemoveBooking(item.booking_id)}
              />
            )}
            <Card.Content>
              <Paragraph>Status: {item.status}</Paragraph>
              <Paragraph>Booked at: {new Date(item.booked_at).toLocaleString()}</Paragraph>
              <Title>Request ➡️</Title>
              <Paragraph>{new Date(item.request.date_time).toLocaleString()} @ {item.request.location}</Paragraph>
              <Paragraph>Owner: {userMap[item.request.user_id] ?? item.request.user_id}</Paragraph>
              <Title>Offer ➡️</Title>
              <Paragraph>{new Date(item.offer.date_time).toLocaleString()} @ {item.offer.location}</Paragraph>
              <Paragraph>Caregiver: {userMap[item.offer.user_id] ?? item.offer.user_id}</Paragraph>
            </Card.Content>
            <Card.Actions>
              {isOwner && (
                <Button
                  mode="contained"
                  loading={loading}
                  disabled={item.status === 'completed'}
                  onPress={() => handleCompleteBooking(item.booking_id, item.offer.user_id)}
                >
                  Complete Booking
                </Button>
              )}
              <Button
                mode="contained"
                disabled={item.status !== 'completed' || reviewedBookings.includes(item.booking_id)}
                onPress={() => router.push({ pathname: 'create/reviewForm', params: { booking_id: item.booking_id, reviewed_id: reviewedUserId } })}
              >
                Leave Review
              </Button>
            </Card.Actions>
          </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { margin:16, fontSize:18, fontWeight:'bold' },
  card:   { marginHorizontal:16, marginBottom:12, position: 'relative' },
  removeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  }
});