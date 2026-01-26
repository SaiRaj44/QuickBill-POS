import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MenuItem } from '../../types';
import PriceDisplay from '../common/PriceDisplay';

interface ItemCardProps {
  item: MenuItem;
  onPress: (item: MenuItem) => void;
}

const ItemCard: React.FC<ItemCardProps> = memo(({ item, onPress }) => {
  const handlePress = () => {
    onPress(item);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      
      <View style={styles.priceContainer}>
        <PriceDisplay amount={item.fullPrice} size="medium" />
        {item.halfPrice && (
          <Text style={styles.halfPrice}>
            Half: ₹{item.halfPrice}
          </Text>
        )}
      </View>
      
      {item.hasAddOns && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+ Add-ons</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a4a',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceContainer: {
    gap: 4,
  },
  halfPrice: {
    fontSize: 12,
    color: '#8a8a9a',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD93D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1a1a2e',
  },
});

export default ItemCard;
