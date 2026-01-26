// Core types for the Billing App

export type Category = 'biryani' | 'beverages' | 'snacks';
export type OrderType = 'parcel' | 'dine-in';
export type PortionType = 'full' | 'half';

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  fullPrice: number;
  halfPrice?: number;
  hasPortions: boolean;
  hasAddOns: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  applicableTo: string[]; // item IDs
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  category: Category;
  portion: PortionType | null;
  quantity: number;
  basePrice: number;
  addOns: OrderItemAddOn[];
}

export interface OrderItemAddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  items: OrderItem[];
  orderType: OrderType;
  subtotal: number;
  total: number;
}

export interface Bill {
  id?: number;
  billNumber: string;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  total: number;
  createdAt: string;
}

export interface PrinterStatus {
  connected: boolean;
  name: string | null;
  error: string | null;
}

export interface AppSettings {
  shopName: string;
  shopAddress?: string;
  shopPhone?: string;
  autoPrint: boolean;
  darkMode: boolean;
}
