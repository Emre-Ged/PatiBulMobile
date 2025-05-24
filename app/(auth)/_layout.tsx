// app/(auth)/_layout.tsx
import { Redirect, Slot } from 'expo-router';
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useContext(AuthContext);

  // while we’re checking async storage, show nothing
  if (loading) return null;

  // if already logged in, redirect into the tabs group
  if (user) {
    return <Redirect href="/" />;
  }

  // otherwise, render the auth screens (login/register)
  return <Slot />;
}