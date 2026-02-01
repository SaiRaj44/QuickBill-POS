import React, { memo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Order, OrderItem } from '../../types';
import { formatItemName } from '../../services/pricing/pricingEngine';
import PriceDisplay from '../common/PriceDisplay';
import Button from '../common/Button';

interface OrderReviewModalProps {
  visible: boolean;
  order: Order;
  onConfirm: () => void;
  onEdit: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const { height } = Dimensions.get('window');

const OrderReviewModal: React.FC<OrderReviewModalProps> = memo(({
  visible,
  order,
  onConfirm,
  onEdit,
  onClose,
  isSubmitting = false,
}) => {
  const renderOrderItem = (item: OrderItem, index: number) => {
    const itemTotal = item.basePrice * item.quantity;
    
    return (
      <View key={item.id} style={styles.itemRow}>
        <View style={styles.itemNumber}>
          <Text style={styles.itemNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{formatItemName(item)}</Text>
          {item.addOns.length > 0 && (
            <View style={styles.addOns}>
              {item.addOns.map((addon) => (
                <Text key={addon.id} style={styles.addOnText}>
                  + {addon.name} {addon.quantity > 1 ? `×${addon.quantity}` : ''}
                </Text>
              ))}
            </View>
          )}
        </View>
        <View style={styles.itemQuantity}>
          <Text style={styles.quantityText}>×{item.quantity}</Text>
        </View>
        <View style={styles.itemPrice}>
          <PriceDisplay amount={itemTotal} size="small" />
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📋</Text>
            </View>
            <Text style={styles.title}>Review Your Order</Text>
            <Text style={styles.subtitle}>
              Please confirm all items before generating the bill
            </Text>
          </View>

          {/* Order Type Badge */}
          <View style={styles.orderTypeBadge}>
            <Text style={styles.orderTypeText}>
              {order.orderType === 'parcel' ? '📦 PARCEL' : '🍽️ DINE-IN'}
            </Text>
          </View>

          {/* Items List */}
          <ScrollView 
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
          >
            {order.items.map((item, index) => renderOrderItem(item, index))}
          </ScrollView>

          {/* Total Section */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Items</Text>
              <Text style={styles.totalValue}>{order.items.length}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Quantity</Text>
              <Text style={styles.totalValue}>
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <PriceDisplay amount={order.total} size="xlarge" />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={onEdit}
              disabled={isSubmitting}
            >
              <Text style={styles.editButtonText}>✏️ Edit Order</Text>
            </TouchableOpacity>
            
            <Button
              title="✅ Confirm & Generate Bill"
              onPress={onConfirm}
              size="large"
              loading={isSubmitting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerIconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8a8a9a',
    textAlign: 'center',
  },
  orderTypeBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2a2a4a',
    borderRadius: 20,
    marginVertical: 12,
  },
  orderTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C42',
  },
  itemsList: {
    maxHeight: height * 0.35,
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  itemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a8a9a',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addOns: {
    marginTop: 4,
  },
  addOnText: {
    fontSize: 12,
    color: '#8a8a9a',
  },
  itemQuantity: {
    marginRight: 12,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  itemPrice: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  totalSection: {
    padding: 16,
    backgroundColor: '#2a2a4a',
    margin: 16,
    borderRadius: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8a8a9a',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3a5a',
    marginVertical: 12,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  editButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OrderReviewModal;
