import { OrderItem, OrderItemAddOn } from '../../types';

// Calculate total for a single order item including add-ons
export const calculateItemTotal = (item: OrderItem): number => {
  const baseTotal = item.basePrice * item.quantity;
  
  const addOnTotal = item.addOns.reduce((sum, addon) => {
    return sum + (addon.price * addon.quantity);
  }, 0);
  
  return baseTotal + addOnTotal;
};

// Calculate subtotal for all items (before rounding)
export const calculateSubtotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

// Calculate final total with rounding
export const calculateTotal = (items: OrderItem[]): number => {
  const subtotal = calculateSubtotal(items);
  return Math.round(subtotal); // Round to nearest rupee
};

// Format price with currency symbol
export const formatPrice = (amount: number): string => {
  return `₹${amount.toFixed(0)}`;
};

// Format item display name with portion
export const formatItemName = (item: OrderItem): string => {
  if (item.portion) {
    return `${item.name} (${item.portion === 'full' ? 'Full' : 'Half'})`;
  }
  return item.name;
};

// Calculate add-ons breakdown for an item
export const getAddOnsSummary = (addOns: OrderItemAddOn[]): string => {
  if (addOns.length === 0) return '';
  
  return addOns
    .filter(a => a.quantity > 0)
    .map(a => `+ ${a.name}${a.quantity > 1 ? ` ×${a.quantity}` : ''}`)
    .join('\n');
};
