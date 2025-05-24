// app/(tabs)/newOffer.tsx
import axios from 'axios';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import {
  Appbar,
  Button, Snackbar,
  TextInput,
} from 'react-native-paper';

const API = 'http://192.168.0.100:3000';

export default function NewOfferScreen() {
  const [petId, setPetId]       = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [visible, setVisible]   = useState(false);

  const handleSubmit = async () => {
    if (!petId || !dateTime || !location) {
      return Alert.alert('Please fill in Pet ID, Date/Time and Location.');
    }
    setLoading(true);
    try {
      await axios.post(`${API}/care_event`, {
        user_id:          2,                  // replace with caregiver user
        pet_id:           parseInt(petId, 10),
        date_time:        dateTime,
        location,
        role_type:        'Caregiver',
        status:           'available',
        additional_notes: notes || null,
      });
      setVisible(true);
      setPetId(''); setDateTime(''); setLocation(''); setNotes('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {}}/>
        <Appbar.Content title="New Care Offer" />
      </Appbar.Header>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={80}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <TextInput
              label="Pet ID"
              value={petId}
              onChangeText={setPetId}
              keyboardType="numeric"
              style={styles.input}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
            />
            <TextInput
              label="Date & Time"
              value={dateTime}
              placeholder="YYYY-MM-DD HH:MM"
              onChangeText={setDateTime}
              style={styles.input}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
            />
            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
            />
            <TextInput
              label="Additional Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              style={styles.input}
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={Keyboard.dismiss}
            />
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            >
              Submit Offer
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
      >
        Care offer created!
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input:     { marginBottom: 12 },
  button:    { marginTop: 16 },
});