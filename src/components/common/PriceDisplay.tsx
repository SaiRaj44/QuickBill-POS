import React, { memo } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { CURRENCY_SYMBOL } from '../../config/constants';

interface PriceDisplayProps {
  amount: number;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: TextStyle;
  showSymbol?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = memo(({
  amount,
  size = 'medium',
  style,
  showSymbol = true,
}) => {
  const formattedAmount = Math.round(amount).toLocaleString('en-IN');
  
  return (
    <Text style={[styles.price, styles[`size_${size}`], style]}>
      {showSymbol ? `${CURRENCY_SYMBOL}${formattedAmount}` : formattedAmount}
    </Text>
  );
});

const styles = StyleSheet.create({
  price: {
    color: '#FFD93D',
    fontWeight: '700',
  },
  size_small: {
    fontSize: 14,
  },
  size_medium: {
    fontSize: 18,
  },
  size_large: {
    fontSize: 24,
  },
  size_xlarge: {
    fontSize: 32,
  },
});

export default PriceDisplay;
