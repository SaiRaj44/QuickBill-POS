import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { getDatabase } from '../src/services/database/index';

export default function RootLayout() {
  // Initialize database on app start
  useEffect(() => {
    const initDB = async () => {
      try {
        await getDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    initDB();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1a1a2e' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="billing" />
      </Stack>
    </>
  );
}
