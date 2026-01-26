import React, { memo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
}

const QuantityControl: React.FC<QuantityControlProps> = memo(({
  value,
  onChange,
  min = 0,
  max = 99,
  size = 'medium',
}) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleIncrement = useCallback(() => {
    if (value < max) {
      onChange(value + 1);
    }
  }, [value, max, onChange]);

  const handleDecrement = useCallback(() => {
    if (value > min) {
      onChange(value - 1);
    }
  }, [value, min, onChange]);

  // Long press for rapid increment
  const handlePressIn = useCallback((isIncrement: boolean) => {
    let currentValue = value;
    
    // Start rapid change after 300ms hold
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (isIncrement && currentValue < max) {
          currentValue += 1;
          onChange(currentValue);
        } else if (!isIncrement && currentValue > min) {
          currentValue -= 1;
          onChange(currentValue);
        }
      }, 100);
    }, 300);
  }, [value, onChange, min, max]);

  const handlePressOut = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  const sizeStyles = {
    small: { button: 28, text: 14, value: 14, gap: 4 },
    medium: { button: 40, text: 20, value: 18, gap: 8 },
    large: { button: 52, text: 28, value: 24, gap: 12 },
  };

  const s = sizeStyles[size];

  return (
    <View style={[styles.container, { gap: s.gap }]}>
      <TouchableOpacity
        style={[
          styles.button,
          { width: s.button, height: s.button },
          value <= min && styles.buttonDisabled,
        ]}
        onPress={handleDecrement}
        onPressIn={() => handlePressIn(false)}
        onPressOut={handlePressOut}
        disabled={value <= min}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { fontSize: s.text }]}>−</Text>
      </TouchableOpacity>

      <Text style={[styles.value, { fontSize: s.value, minWidth: s.button }]}>
        {value}
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          { width: s.button, height: s.button },
          value >= max && styles.buttonDisabled,
        ]}
        onPress={handleIncrement}
        onPressIn={() => handlePressIn(true)}
        onPressOut={handlePressOut}
        disabled={value >= max}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { fontSize: s.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFD93D',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#3a3a5a',
    opacity: 0.5,
  },
  buttonText: {
    color: '#1a1a2e',
    fontWeight: '700',
  },
  value: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default QuantityControl;
