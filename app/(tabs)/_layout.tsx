// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let name: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'index':
              name = 'home-outline';
              break;
            case 'explore':
              name = 'list-outline';
              break;
            case 'analytics':
              name = 'stats-chart-outline';
              break;
            case 'profile':
              name = 'person-outline';
              break;
            case 'create':
              name = 'add-circle-outline';
              break;
            default:
              name = 'ellipse-outline';
          }
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 6 },
      })}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home'     }} />
      <Tabs.Screen name="explore"  options={{ title: 'Requests' }} />
      <Tabs.Screen name="analytics"options={{ title: 'Stats'    }} />
      
      <Tabs.Screen name="create"   options={{ title: 'Create'   }} />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="MatchScreen"
        options={{
          title: 'Match',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/images/chained.png')}
              style={{
                width: size,
                height: size,
                resizeMode: 'contain',
                tintColor: color,
                backgroundColor: 'transparent',
              }}
            />
          ),
        }}
      />
      <Tabs.Screen name="profile"  options={{ title: 'Profile'  }} />
    </Tabs>
  );
}