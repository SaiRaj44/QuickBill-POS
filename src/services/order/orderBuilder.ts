import { Order, OrderItem, OrderItemAddOn, OrderType, PortionType, MenuItem } from '../../types';
import { calculateSubtotal, calculateTotal } from '../pricing/pricingEngine';

// Generate unique ID for order items
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create initial empty order
export const createEmptyOrder = (): Order => ({
  items: [],
  orderType: 'dine-in',
  subtotal: 0,
  total: 0,
});

// Add item to order
export const addItemToOrder = (
  order: Order,
  menuItem: MenuItem,
  portion: PortionType | null = null,
  addOns: OrderItemAddOn[] = []
): Order => {
  const price = portion === 'half' && menuItem.halfPrice 
    ? menuItem.halfPrice 
    : menuItem.fullPrice;

  // Check if same item already exists (same menuItem + portion + no addons for simple items)
  const existingIndex = order.items.findIndex(
    item => 
      item.menuItemId === menuItem.id && 
      item.portion === portion &&
      !menuItem.hasAddOns // Only merge simple items without add-ons
  );

  let newItems: OrderItem[];

  if (existingIndex !== -1 && !menuItem.hasAddOns) {
    // Increment quantity for existing simple item
    newItems = order.items.map((item, index) => 
      index === existingIndex 
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  } else {
    // Add new item
    const newItem: OrderItem = {
      id: generateId(),
      menuItemId: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      portion,
      quantity: 1,
      basePrice: price,
      addOns,
    };
    newItems = [...order.items, newItem];
  }

  return recalculateOrder({ ...order, items: newItems });
};

// Update item quantity
export const updateItemQuantity = (
  order: Order,
  itemId: string,
  quantity: number
): Order => {
  if (quantity <= 0) {
    return removeItemFromOrder(order, itemId);
  }

  const newItems = order.items.map(item =>
    item.id === itemId ? { ...item, quantity } : item
  );

  return recalculateOrder({ ...order, items: newItems });
};

// Remove item from order
export const removeItemFromOrder = (order: Order, itemId: string): Order => {
  const newItems = order.items.filter(item => item.id !== itemId);
  return recalculateOrder({ ...order, items: newItems });
};

// Update add-on quantity for an item
export const updateAddOnQuantity = (
  order: Order,
  itemId: string,
  addOnId: string,
  quantity: number
): Order => {
  const newItems = order.items.map(item => {
    if (item.id !== itemId) return item;

    const newAddOns = item.addOns.map(addon =>
      addon.id === addOnId ? { ...addon, quantity: Math.max(0, quantity) } : addon
    ).filter(addon => addon.quantity > 0);

    return { ...item, addOns: newAddOns };
  });

  return recalculateOrder({ ...order, items: newItems });
};

// Set order type (parcel/dine-in)
export const setOrderType = (order: Order, orderType: OrderType): Order => ({
  ...order,
  orderType,
});

// Recalculate order totals
const recalculateOrder = (order: Order): Order => ({
  ...order,
  subtotal: calculateSubtotal(order.items),
  total: calculateTotal(order.items),
});

// Clear order
export const clearOrder = (): Order => createEmptyOrder();

// Check if order is empty
export const isOrderEmpty = (order: Order): boolean => order.items.length === 0;
