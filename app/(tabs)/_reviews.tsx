// app/(tabs)/reviews.tsx
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { Appbar, Card, Paragraph, Title } from 'react-native-paper';

const API = 'http://192.168.0.100:3000';

export default function ReviewsScreen() {
  const { reviewed_id } = useLocalSearchParams<{ reviewed_id: string }>();
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${API}/reviews?reviewed_id=eq.${reviewed_id}`)
      .then(r => setReviews(r.data))
      .catch(e => Alert.alert('Error', e.message));
  }, []);

  return (
    <SafeAreaView style={{flex:1}}>
      <Appbar.Header>
        <Appbar.Content title="Reviews" />
      </Appbar.Header>
      <FlatList
        data={reviews}
        keyExtractor={i=>String(i.review_id)}
        ListEmptyComponent={()=><Paragraph style={styles.empty}>No reviews yet.</Paragraph>}
        renderItem={({item})=>(
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.rating} ★</Title>
              {item.review_comment && <Paragraph>"{item.review_comment}"</Paragraph>}
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card:  { margin:16, marginBottom:12 },
  empty: { textAlign:'center', marginTop:32, color:'gray' },
});