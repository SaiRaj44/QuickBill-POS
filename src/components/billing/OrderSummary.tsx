import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Order, OrderItem } from '../../types';
import { formatItemName } from '../../services/pricing/pricingEngine';
import PriceDisplay from '../common/PriceDisplay';
import QuantityControl from '../common/QuantityControl';
import ParcelToggle from './ParcelToggle';

interface OrderSummaryProps {
  order: Order;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateOrderType: (type: 'parcel' | 'dine-in') => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = memo(({
  order,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateOrderType,
}) => {
  const renderOrderItem = (item: OrderItem) => {
    const itemTotal = item.basePrice * item.quantity;
    
    return (
      <View key={item.id} style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>
              {formatItemName(item)}
            </Text>
            <TouchableOpacity
              onPress={() => onRemoveItem(item.id)}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Add-ons */}
          {item.addOns.length > 0 && (
            <View style={styles.addOns}>
              {item.addOns.map((addon) => (
                <Text key={addon.id} style={styles.addOnText}>
                  + {addon.name} {addon.quantity > 1 ? `×${addon.quantity}` : ''} (₹{addon.price * addon.quantity})
                </Text>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.itemControls}>
          <QuantityControl
            value={item.quantity}
            onChange={(qty) => onUpdateQuantity(item.id, qty)}
            size="small"
            min={1}
          />
          <PriceDisplay amount={itemTotal} size="medium" />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Parcel Toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Order Summary</Text>
        <ParcelToggle
          value={order.orderType}
          onChange={onUpdateOrderType}
        />
      </View>

      {/* Order Items */}
      <ScrollView 
        style={styles.itemsList}
        showsVerticalScrollIndicator={false}
      >
        {order.items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>No items added yet</Text>
            <Text style={styles.emptySubtext}>
              Tap on items to add them to your order
            </Text>
          </View>
        ) : (
          order.items.map(renderOrderItem)
        )}
      </ScrollView>

      {/* Total */}
      {order.items.length > 0 && (
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <PriceDisplay amount={order.total} size="xlarge" />
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B33',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  addOns: {
    marginTop: 4,
  },
  addOnText: {
    fontSize: 12,
    color: '#8a8a9a',
  },
  itemControls: {
    alignItems: 'flex-end',
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8a8a9a',
    textAlign: 'center',
  },
  totalSection: {
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#FFD93D',
    backgroundColor: '#2a2a4a',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

export default OrderSummary;
