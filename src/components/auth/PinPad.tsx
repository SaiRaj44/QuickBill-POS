import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
} from 'react-native';
import { PIN_LENGTH } from '../../config/constants';

interface PinPadProps {
  onComplete: (pin: string) => void;
  onClear?: () => void;
  title?: string;
  error?: string | null;
}

const PinPad: React.FC<PinPadProps> = memo(({
  onComplete,
  onClear,
  title = 'Enter PIN',
  error = null,
}) => {
  const [pin, setPin] = useState('');

  const handlePress = useCallback((digit: string) => {
    Vibration.vibrate(30);
    
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === PIN_LENGTH) {
        onComplete(newPin);
        // Reset after a short delay
        setTimeout(() => setPin(''), 300);
      }
    }
  }, [pin, onComplete]);

  const handleDelete = useCallback(() => {
    Vibration.vibrate(30);
    setPin(prev => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
    onClear?.();
  }, [onClear]);

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < PIN_LENGTH; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            i < pin.length && styles.dotFilled,
            error && styles.dotError,
          ]}
        />
      );
    }
    return dots;
  };

  const renderKey = (label: string, onPress: () => void, style?: object) => (
    <TouchableOpacity
      style={[styles.key, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.keyText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.dotsContainer}>{renderDots()}</View>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <View style={styles.keypad}>
        <View style={styles.row}>
          {renderKey('1', () => handlePress('1'))}
          {renderKey('2', () => handlePress('2'))}
          {renderKey('3', () => handlePress('3'))}
        </View>
        <View style={styles.row}>
          {renderKey('4', () => handlePress('4'))}
          {renderKey('5', () => handlePress('5'))}
          {renderKey('6', () => handlePress('6'))}
        </View>
        <View style={styles.row}>
          {renderKey('7', () => handlePress('7'))}
          {renderKey('8', () => handlePress('8'))}
          {renderKey('9', () => handlePress('9'))}
        </View>
        <View style={styles.row}>
          {renderKey('C', handleClear, styles.keyAction)}
          {renderKey('0', () => handlePress('0'))}
          {renderKey('⌫', handleDelete, styles.keyAction)}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFD93D',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#FFD93D',
  },
  dotError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  error: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 16,
  },
  keypad: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyAction: {
    backgroundColor: '#3a3a5a',
  },
  keyText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PinPad;
