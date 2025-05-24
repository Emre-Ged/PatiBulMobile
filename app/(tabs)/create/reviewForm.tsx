import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {
  Appbar,
  Button,
  Snackbar,
  TextInput,
  Title,
} from 'react-native-paper';

const API = 'http://192.168.0.105:3000';

export default function ReviewForm() {
  const { event_id, reviewed_id } = useLocalSearchParams<{ event_id: string; reviewed_id: string }>();
  const reviewer_id = 1; // TODO: from auth
  const router = useRouter();

  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [visible, setVisible] = useState(false);

  const submit = async () => {
    if (!rating) return Alert.alert('Please enter a rating.');
    try {
      await axios.post(`${API}/reviews`, {
        reviewer_id:    reviewer_id,
        reviewed_id:    parseInt(reviewed_id, 10),
        event_id:       parseInt(event_id, 10),
        rating:         parseFloat(rating),
        review_comment: comment || null,
      });
      setVisible(true);
      // After a moment, go back
      setTimeout(() => router.back(), 1000);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Leave Review" />
      </Appbar.Header>

      <SafeAreaView style={styles.container}>
        <Title>Event #{event_id}</Title>
        <TextInput
          label="Rating (0.0–5.0)"
          value={rating}
          onChangeText={setRating}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <TextInput
          label="Comment (optional)"
          value={comment}
          onChangeText={setComment}
          multiline
          style={[styles.input, { height: 100 }]}
        />
        <Button mode="contained" onPress={submit}>Submit</Button>
      </SafeAreaView>

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
  container: { flex:1, padding:16 },
  input:     { marginBottom:12 },
});