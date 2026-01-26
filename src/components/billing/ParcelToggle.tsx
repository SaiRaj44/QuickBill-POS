import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OrderType } from '../../types';

interface ParcelToggleProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
}

const ParcelToggle: React.FC<ParcelToggleProps> = memo(({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          value === 'dine-in' && styles.buttonActive,
        ]}
        onPress={() => onChange('dine-in')}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>🍽️</Text>
        <Text
          style={[
            styles.text,
            value === 'dine-in' && styles.textActive,
          ]}
        >
          Dine-In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          value === 'parcel' && styles.buttonActive,
        ]}
        onPress={() => onChange('parcel')}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>📦</Text>
        <Text
          style={[
            styles.text,
            value === 'parcel' && styles.textActive,
          ]}
        >
          Parcel
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2a2a4a',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonActive: {
    borderColor: '#FFD93D',
    backgroundColor: '#3a3a5a',
  },
  icon: {
    fontSize: 20,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a8a9a',
  },
  textActive: {
    color: '#FFD93D',
  },
});

export default ParcelToggle;
