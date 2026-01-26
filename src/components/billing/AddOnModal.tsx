import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MenuItem, AddOn, PortionType, OrderItemAddOn } from '../../types';
import { getAddOnsForItem } from '../../config/menu';
import Button from '../common/Button';
import QuantityControl from '../common/QuantityControl';
import PriceDisplay from '../common/PriceDisplay';

interface AddOnModalProps {
  visible: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (
    item: MenuItem,
    portion: PortionType,
    addOns: OrderItemAddOn[]
  ) => void;
}

const AddOnModal: React.FC<AddOnModalProps> = memo(({
  visible,
  item,
  onClose,
  onConfirm,
}) => {
  const [portion, setPortion] = useState<PortionType>('full');
  const [addOnQuantities, setAddOnQuantities] = useState<Record<string, number>>({});

  const applicableAddOns = item ? getAddOnsForItem(item.id) : [];

  const resetState = useCallback(() => {
    setPortion('full');
    setAddOnQuantities({});
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleConfirm = useCallback(() => {
    if (!item) return;

    const selectedAddOns: OrderItemAddOn[] = applicableAddOns
      .filter(addon => (addOnQuantities[addon.id] || 0) > 0)
      .map(addon => ({
        id: addon.id,
        name: addon.name,
        price: addon.price,
        quantity: addOnQuantities[addon.id],
      }));

    onConfirm(item, portion, selectedAddOns);
    resetState();
  }, [item, portion, addOnQuantities, applicableAddOns, onConfirm, resetState]);

  const updateAddOnQuantity = useCallback((addOnId: string, qty: number) => {
    setAddOnQuantities(prev => ({
      ...prev,
      [addOnId]: Math.max(0, qty),
    }));
  }, []);

  const calculateTotal = useCallback(() => {
    if (!item) return 0;
    
    const basePrice = portion === 'half' && item.halfPrice 
      ? item.halfPrice 
      : item.fullPrice;
    
    const addOnTotal = applicableAddOns.reduce((sum, addon) => {
      return sum + (addon.price * (addOnQuantities[addon.id] || 0));
    }, 0);
    
    return basePrice + addOnTotal;
  }, [item, portion, addOnQuantities, applicableAddOns]);

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{item.name}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Portion Selection */}
            {item.hasPortions && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Portion Size</Text>
                <View style={styles.portionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.portionButton,
                      portion === 'full' && styles.portionButtonActive,
                    ]}
                    onPress={() => setPortion('full')}
                  >
                    <Text
                      style={[
                        styles.portionText,
                        portion === 'full' && styles.portionTextActive,
                      ]}
                    >
                      Full
                    </Text>
                    <PriceDisplay amount={item.fullPrice} size="small" />
                  </TouchableOpacity>

                  {item.halfPrice && (
                    <TouchableOpacity
                      style={[
                        styles.portionButton,
                        portion === 'half' && styles.portionButtonActive,
                      ]}
                      onPress={() => setPortion('half')}
                    >
                      <Text
                        style={[
                          styles.portionText,
                          portion === 'half' && styles.portionTextActive,
                        ]}
                      >
                        Half
                      </Text>
                      <PriceDisplay amount={item.halfPrice} size="small" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Add-ons */}
            {applicableAddOns.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add-ons</Text>
                {applicableAddOns.map((addon) => (
                  <View key={addon.id} style={styles.addOnRow}>
                    <View style={styles.addOnInfo}>
                      <Text style={styles.addOnName}>{addon.name}</Text>
                      <PriceDisplay amount={addon.price} size="small" />
                    </View>
                    <QuantityControl
                      value={addOnQuantities[addon.id] || 0}
                      onChange={(qty) => updateAddOnQuantity(addon.id, qty)}
                      size="small"
                    />
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <PriceDisplay amount={calculateTotal()} size="large" />
            </View>
            <Button
              title="Add to Order"
              onPress={handleConfirm}
              size="large"
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#8a8a9a',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a8a9a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  portionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  portionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  portionButtonActive: {
    borderColor: '#FFD93D',
    backgroundColor: '#3a3a5a',
  },
  portionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8a8a9a',
    marginBottom: 4,
  },
  portionTextActive: {
    color: '#FFFFFF',
  },
  addOnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  addOnInfo: {
    flex: 1,
  },
  addOnName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
    gap: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddOnModal;
