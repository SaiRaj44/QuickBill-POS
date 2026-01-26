import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import PinPad from './PinPad';
import { verifyPin } from '../../services/auth/authService';
import { APP_NAME } from '../../config/constants';

interface LockScreenProps {
  visible: boolean;
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ visible, onUnlock }) => {
  const [error, setError] = useState<string | null>(null);

  const handlePinComplete = useCallback(async (pin: string) => {
    setError(null);
    
    const isValid = await verifyPin(pin);
    
    if (isValid) {
      onUnlock();
    } else {
      setError('Invalid PIN');
    }
  }, [onUnlock]);

  const handleClear = useCallback(() => {
    setError(null);
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.title}>Screen Locked</Text>
          <Text style={styles.subtitle}>{APP_NAME}</Text>
        </View>

        <View style={styles.pinContainer}>
          <PinPad
            onComplete={handlePinComplete}
            onClear={handleClear}
            title="Enter PIN to unlock"
            error={error}
          />
        </View>

        <Text style={styles.hint}>
          Locked due to inactivity
        </Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8a8a9a',
  },
  pinContainer: {
    alignItems: 'center',
  },
  hint: {
    marginTop: 40,
    fontSize: 12,
    color: '#5a5a7a',
  },
});

export default LockScreen;
