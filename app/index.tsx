import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import PinPad from '../src/components/auth/PinPad';
import { verifyPin, setLoggedIn } from '../src/services/auth/authService';
import { APP_NAME } from '../src/config/constants';

export default function LoginScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handlePinComplete = useCallback(async (pin: string) => {
    setError(null);
    
    const isValid = await verifyPin(pin);
    
    if (isValid) {
      await setLoggedIn(true);
      router.replace('/billing');
    } else {
      setError('Invalid PIN. Try again.');
    }
  }, [router]);

  const handleClear = useCallback(() => {
    setError(null);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>🧾</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>Food Billing System</Text>
      </View>

      <View style={styles.pinContainer}>
        <PinPad
          onComplete={handlePinComplete}
          onClear={handleClear}
          title="Enter PIN to continue"
          error={error}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF8C42',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8a8a9a',
  },
  pinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

