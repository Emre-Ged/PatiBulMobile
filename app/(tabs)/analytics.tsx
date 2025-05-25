import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { Appbar, Card, Paragraph, Title } from 'react-native-paper';

const API = 'http://192.168.0.100:3000';

type UserCount = { user_id: number; cnt: number };
type UserWithName = { user_id: number; name: string };

export default function AnalyticsScreen() {
  const [topRated,    setTopRated]    = useState<any[]>([]);
  const [mostBooked,  setMostBooked]  = useState<UserCount & { name?: string }[]>([]);
  const [topOwners,   setTopOwners]   = useState<UserCount & { name?: string }[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // 1) Fetch the raw analytics lists in parallel
        const [trRes, mbRes, toRes] = await Promise.all([
          axios.get(`${API}/user_main`,             { params: { order: 'rating.desc', limit: 5 } }),
          axios.get(`${API}/most_booked_caregivers`,{ params: { limit: 5 } }),
          axios.get(`${API}/most_active_owners`,    { params: { limit: 5 } }),
        ]);

        const topRatedData   = trRes.data;   // already has { user_id, name, rating }
        const mostBookedData = mbRes.data;   // { user_id, cnt }
        const topOwnersData  = toRes.data;   // { user_id, cnt }

        // 2) Gather all unique user_ids we need names for
        const ids = Array.from(new Set([
          ...mostBookedData.map(r => r.user_id),
          ...topOwnersData .map(r => r.user_id),
        ]));

        // 3) Fetch their names in one go
        const usersRes = await axios.get<UserWithName[]>(
          `${API}/user_main`,
          {
            params: {
              select:  'user_id,name',
              user_id: `in.(${ids.join(',')})`,
            },
          }
        );
        const nameMap = Object.fromEntries(usersRes.data.map(u => [u.user_id, u.name]));

        // 4) Merge names into your analytics lists
        const mostBookedWithNames = mostBookedData.map(r => ({
          ...r,
          name: nameMap[r.user_id] ?? `#${r.user_id}`,
        }));
        const topOwnersWithNames = topOwnersData.map(r => ({
          ...r,
          name: nameMap[r.user_id] ?? `#${r.user_id}`,
        }));

        // 5) Update state
        setTopRated(topRatedData);
        setMostBooked(mostBookedWithNames);
        setTopOwners(topOwnersWithNames);
      } catch (error: any) {
        console.error('Analytics fetch failed:', error.response?.data || error);
        const msg = error.response?.data?.message || error.message;
        Alert.alert('Analytics error', msg);
      }
    }

    fetchAnalytics();
  }, []);

  return (
    <SafeAreaView style={styles.flex}>
      <Appbar.Header>
        <Appbar.Content title="Analytics" />
      </Appbar.Header>

      <FlatList
        ListHeaderComponent={() => (
          <>
            <Title style={styles.section}>📊 Top Rated Caregivers</Title>
            {topRated.map(u => (
              <Card key={u.user_id} style={styles.card}>
                <Card.Content>
                  <Paragraph>{u.name} — {u.rating}★</Paragraph>
                </Card.Content>
              </Card>
            ))}

            <Title style={styles.section}>🏆 Most Completed Bookings</Title>
            {mostBooked.map(r => (
              <Card key={r.user_id} style={styles.card}>
                <Card.Content>
                  <Paragraph>{r.name} — {r.cnt} bookings</Paragraph>
                </Card.Content>
              </Card>
            ))}

            <Title style={styles.section}>⭐ Power Users (Owners)</Title>
            {topOwners.map(r => (
              <Card key={r.user_id} style={styles.card}>
                <Card.Content>
                  <Paragraph>{r.name} — {r.cnt} requests</Paragraph>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
        data={[]} renderItem={null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex:    { flex: 1 },
  section:{ margin: 16, fontSize: 18, fontWeight: 'bold' },
  card:    { marginHorizontal: 16, marginBottom: 12 },
});