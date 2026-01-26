import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Category, MenuItem, Order, OrderItemAddOn, PortionType } from '../src/types';
import { getItemsByCategory, MENU_ITEMS } from '../src/config/menu';
import { APP_NAME } from '../src/config/constants';
import {
  createEmptyOrder,
  addItemToOrder,
  updateItemQuantity,
  removeItemFromOrder,
  setOrderType,
  clearOrder,
  isOrderEmpty,
} from '../src/services/order/orderBuilder';
import { saveBill } from '../src/services/database/queries';
import { printBill } from '../src/services/printer/printerService';
import { logout } from '../src/services/auth/authService';

import CategoryGrid from '../src/components/billing/CategoryGrid';
import ItemCard from '../src/components/billing/ItemCard';
import AddOnModal from '../src/components/billing/AddOnModal';
import OrderSummary from '../src/components/billing/OrderSummary';
import Button from '../src/components/common/Button';
import LockScreen from '../src/components/auth/LockScreen';
import PrinterSettings from '../src/components/billing/PrinterSettings';
import { useInactivity } from '../src/hooks/useInactivity';
import { usePrinter } from '../src/hooks/usePrinter';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function BillingScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>('biryani');
  const [order, setOrder] = useState<Order>(createEmptyOrder());
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);

  // Printer hook
  const {
    status: printerStatus,
    isScanning,
    discoveredDevices,
    scanForPrinters,
    connectToPrinter,
    disconnectPrinter,
    forgetPrinter,
  } = usePrinter();

  // Inactivity lock
  const { resetTimer } = useInactivity({
    onLock: () => setShowLockScreen(true),
    enabled: true,
  });

  const handleUnlock = useCallback(() => {
    setShowLockScreen(false);
    resetTimer();
  }, [resetTimer]);

  // Reset inactivity timer on any interaction
  const handleInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Get items for selected category
  const categoryItems = useMemo(
    () => getItemsByCategory(selectedCategory),
    [selectedCategory]
  );

  // Handle item selection
  const handleItemPress = useCallback((item: MenuItem) => {
    if (item.hasPortions || item.hasAddOns) {
      // Open modal for biryani items
      setModalItem(item);
    } else {
      // Directly add simple items
      setOrder(prev => addItemToOrder(prev, item));
    }
  }, []);

  // Handle add-on modal confirm
  const handleAddOnConfirm = useCallback(
    (item: MenuItem, portion: PortionType, addOns: OrderItemAddOn[]) => {
      setOrder(prev => addItemToOrder(prev, item, portion, addOns));
      setModalItem(null);
    },
    []
  );

  // Handle quantity update
  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    setOrder(prev => updateItemQuantity(prev, itemId, quantity));
  }, []);

  // Handle remove item
  const handleRemoveItem = useCallback((itemId: string) => {
    setOrder(prev => removeItemFromOrder(prev, itemId));
  }, []);

  // Handle order type change
  const handleOrderTypeChange = useCallback((type: 'parcel' | 'dine-in') => {
    setOrder(prev => setOrderType(prev, type));
  }, []);

  // Handle generate bill
  const handleGenerateBill = useCallback(async () => {
    if (isOrderEmpty(order)) {
      Alert.alert('Empty Order', 'Please add items to the order first.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save bill to database
      const savedBill = await saveBill({
        orderType: order.orderType,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
      });

      // Print receipt
      await printBill(savedBill);

      // Reset order for next customer
      setOrder(createEmptyOrder());

      // Show brief success (optional, can be removed for speed)
      // Alert.alert('Success', `Bill ${savedBill.billNumber} generated!`);
    } catch (error) {
      console.error('Error generating bill:', error);
      Alert.alert('Error', 'Failed to generate bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [order]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  }, [router]);

  // Render menu item
  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => (
      <View style={styles.itemWrapper}>
        <ItemCard item={item} onPress={handleItemPress} />
      </View>
    ),
    [handleItemPress]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🍛</Text>
          <Text style={styles.title}>{APP_NAME}</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Printer Button with Status */}
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setShowPrinterSettings(true)}
          >
            <Text style={styles.headerButtonText}>🖨️</Text>
            <View style={[
              styles.printerStatusDot,
              { backgroundColor: printerStatus.connected ? '#4CAF50' : '#FF6B6B' }
            ]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <Text style={styles.headerButtonText}>🔒</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Menu Section */}
        <View style={styles.menuSection}>
          {/* Categories */}
          <CategoryGrid
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Items Grid */}
          <FlatList
            data={categoryItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={isTablet ? 4 : 2}
            contentContainerStyle={styles.itemsGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Order Summary Section */}
        <View style={styles.orderSection}>
          <OrderSummary
            order={order}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onUpdateOrderType={handleOrderTypeChange}
          />

          {/* Generate Bill Button */}
          <View style={styles.actionBar}>
            <Button
              title={`💵 Generate Bill${order.total > 0 ? ` - ₹${order.total}` : ''}`}
              onPress={handleGenerateBill}
              size="large"
              disabled={isOrderEmpty(order)}
              loading={isSubmitting}
            />
          </View>
        </View>
      </View>

      {/* Add-on Modal */}
      <AddOnModal
        visible={modalItem !== null}
        item={modalItem}
        onClose={() => setModalItem(null)}
        onConfirm={handleAddOnConfirm}
      />

      {/* Lock Screen */}
      <LockScreen
        visible={showLockScreen}
        onUnlock={handleUnlock}
      />

      {/* Printer Settings */}
      <PrinterSettings
        visible={showPrinterSettings}
        onClose={() => setShowPrinterSettings(false)}
        status={printerStatus}
        isScanning={isScanning}
        discoveredDevices={discoveredDevices}
        onScan={scanForPrinters}
        onConnect={connectToPrinter}
        onDisconnect={disconnectPrinter}
        onForget={forgetPrinter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  logo: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD93D',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 20,
  },
  printerStatusDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column',
  },
  menuSection: {
    flex: isTablet ? 2 : 1,
    backgroundColor: '#0f0f1a',
  },
  itemsGrid: {
    padding: 12,
    gap: 12,
  },
  itemWrapper: {
    flex: 1,
    padding: 6,
    maxWidth: isTablet ? '25%' : '50%',
  },
  orderSection: {
    flex: isTablet ? 1 : 1,
    backgroundColor: '#1a1a2e',
    borderLeftWidth: isTablet ? 1 : 0,
    borderTopWidth: isTablet ? 0 : 1,
    borderColor: '#2a2a4a',
  },
  actionBar: {
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
  },
});
