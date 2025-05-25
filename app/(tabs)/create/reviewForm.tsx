import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Button, Snackbar, TextInput, Title } from 'react-native-paper';
import { AuthContext } from '../../../context/AuthContext';

const API = 'http://192.168.0.100:3000';

export default function ReviewForm() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { booking_id, reviewed_id, event_id } = useLocalSearchParams<{ booking_id: string; reviewed_id: string; event_id: string }>();
  const bid = booking_id ?? event_id;
  const bId = bid ? parseInt(bid, 10) : null;

  const [otherUserId, setOtherUserId] = useState<number | null>(null);
  const [rating, setRating]           = useState<string>('');
  const [comment, setComment]         = useState<string>('');
  const [loading, setLoading]         = useState(false);
  const [visible, setVisible]         = useState(false);

  useEffect(() => {
    if (reviewed_id) {
      setOtherUserId(parseInt(reviewed_id, 10));
    }
  }, [reviewed_id]);

  const submitReview = async () => {
    if (!otherUserId || !rating) {
      return Alert.alert('Please pick a rating');
    }
    setLoading(true);
    try {
      await axios.post(`${API}/reviews`, {
        booking_id:   bId!,
        reviewer_id:  user!.user_id,
        reviewed_id:  otherUserId,
        rating:       parseFloat(rating),
        review_comment: comment || null,
      });
      setVisible(true);
      setRating('');
      setComment('');
      // after a moment go back
      setTimeout(() => router.back(), 1000);
    } catch (e: any) {
      Alert.alert('Error submitting review', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Leave a Review" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.title}>Review Booking #{bId}</Title>
        <Title style={styles.title}>Rating</Title>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity key={i} onPress={() => setRating(String(i))}>
              <MaterialIcons
                name={i <= Number(rating) ? "star" : "star-border"}
                size={32}
                color="#FFD700"
              />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          label="Comment (optional)"
          value={comment}
          onChangeText={setComment}
          multiline
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={submitReview}
          loading={loading}
          style={styles.button}
        >
          Submit Review
        </Button>
        <Button
          mode="text"
          onPress={() => router.replace('/bookings')}
          style={styles.button}
        >
          Back to Bookings
        </Button>
      </ScrollView>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={2000}
      >
        Review submitted!
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title:     { textAlign: 'center', marginVertical: 12 },
  input:     { marginBottom: 16 },
  button:    { marginTop: 8 },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
});