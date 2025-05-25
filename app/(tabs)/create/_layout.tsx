// app/(tabs)/create/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function CreateStackLayout() {
  return (
    <Stack>
      {/* main “Create” screen */}
      <Stack.Screen name="index"      options={{ headerShown: false      }} />
      {/* nested screens, all hidden from the bottom bar */}
      <Stack.Screen name="newOffer"   options={{ title: 'New Offer'     }} />
      <Stack.Screen name="newRequest" options={{ title: 'New Request'   }} />
      <Stack.Screen name="newPet"     options={{ title: 'Add Pet'        }} />
      <Stack.Screen name="removePet"  options={{ title: 'Remove Pet'     }} />
      <Stack.Screen name="editPet"  options={{ title: 'Edit Pet'     }} />
      <Stack.Screen name="reviewForm" options={{ title: 'Write Review'   }} />
      <Stack.Screen name="_reviews" options={{ title: 'Reviews'   }} />
    </Stack>
  );
}