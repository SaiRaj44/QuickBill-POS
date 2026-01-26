import { Bill, OrderItem } from '../../types';
import { formatPrice, formatItemName } from '../pricing/pricingEngine';
import { DEFAULT_SETTINGS } from '../../config/constants';

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';

export const ESCPOS = {
  // Initialize printer
  INIT: `${ESC}@`,
  
  // Text alignment
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  
  // Text formatting
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  DOUBLE_HEIGHT_ON: `${GS}!\x10`,
  DOUBLE_WIDTH_ON: `${GS}!\x20`,
  DOUBLE_SIZE_ON: `${GS}!\x30`,
  NORMAL_SIZE: `${GS}!\x00`,
  UNDERLINE_ON: `${ESC}-\x01`,
  UNDERLINE_OFF: `${ESC}-\x00`,
  
  // Line spacing
  LINE_SPACING_DEFAULT: `${ESC}2`,
  LINE_SPACING_SET: (n: number) => `${ESC}3${String.fromCharCode(n)}`,
  
  // Paper
  LINE_FEED: '\n',
  CUT_PAPER: `${GS}V\x00`,
  CUT_PAPER_PARTIAL: `${GS}V\x01`,
  
  // Cash drawer
  OPEN_DRAWER: `${ESC}p\x00\x19\xFA`,
};

// Character width for 58mm printer (typically 32 chars)
const LINE_WIDTH = 32;

// Helper functions
const line = (char: string = '-'): string => char.repeat(LINE_WIDTH);
const padRight = (text: string, width: number): string => 
  text.length >= width ? text.substring(0, width) : text + ' '.repeat(width - text.length);
const padLeft = (text: string, width: number): string => 
  text.length >= width ? text.substring(0, width) : ' '.repeat(width - text.length) + text;

// Format item line: "Item Name          ×2  ₹100"
const formatItemLine = (name: string, qty: number, price: number): string => {
  const priceStr = formatPrice(price);
  const qtyStr = `×${qty}`;
  const nameWidth = LINE_WIDTH - priceStr.length - qtyStr.length - 2;
  return `${padRight(name, nameWidth)} ${qtyStr} ${priceStr}`;
};

// Format add-on line: "  + Extra Chicken ×2"
const formatAddOnLine = (name: string, qty: number): string => {
  return `  + ${name}${qty > 1 ? ` ×${qty}` : ''}`;
};

// Generate receipt text
export const generateReceipt = (bill: Bill, shopName: string = DEFAULT_SETTINGS.shopName): string => {
  const lines: string[] = [];
  
  // Header
  lines.push(ESCPOS.INIT);
  lines.push(ESCPOS.ALIGN_CENTER);
  lines.push(ESCPOS.DOUBLE_SIZE_ON);
  lines.push(shopName);
  lines.push(ESCPOS.NORMAL_SIZE);
  lines.push(ESCPOS.LINE_FEED);
  lines.push(line('═'));
  lines.push(ESCPOS.LINE_FEED);
  
  // Items
  lines.push(ESCPOS.ALIGN_LEFT);
  
  bill.items.forEach(item => {
    const itemName = formatItemName(item);
    const itemTotal = item.basePrice * item.quantity;
    lines.push(formatItemLine(itemName, item.quantity, itemTotal));
    lines.push(ESCPOS.LINE_FEED);
    
    // Add-ons
    item.addOns.forEach(addon => {
      if (addon.quantity > 0) {
        lines.push(formatAddOnLine(addon.name, addon.quantity));
        lines.push(ESCPOS.LINE_FEED);
      }
    });
  });
  
  // Separator
  lines.push(line('-'));
  lines.push(ESCPOS.LINE_FEED);
  
  // Total
  lines.push(ESCPOS.BOLD_ON);
  lines.push(ESCPOS.DOUBLE_HEIGHT_ON);
  const totalLine = `TOTAL: ${formatPrice(bill.total)}`;
  lines.push(padLeft(totalLine, LINE_WIDTH));
  lines.push(ESCPOS.NORMAL_SIZE);
  lines.push(ESCPOS.BOLD_OFF);
  lines.push(ESCPOS.LINE_FEED);
  
  // Separator
  lines.push(line('-'));
  lines.push(ESCPOS.LINE_FEED);
  
  // Bill info
  lines.push(ESCPOS.ALIGN_CENTER);
  lines.push(`Bill No: ${bill.billNumber}`);
  lines.push(ESCPOS.LINE_FEED);
  
  // Date & Time
  const date = new Date(bill.createdAt);
  const dateStr = date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  const timeStr = date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  lines.push(`${dateStr}  ${timeStr}`);
  lines.push(ESCPOS.LINE_FEED);
  
  // Order type
  lines.push(ESCPOS.BOLD_ON);
  lines.push(bill.orderType === 'parcel' ? '[ PARCEL ]' : '[ DINE-IN ]');
  lines.push(ESCPOS.BOLD_OFF);
  lines.push(ESCPOS.LINE_FEED);
  
  // Footer
  lines.push(line('═'));
  lines.push(ESCPOS.LINE_FEED);
  lines.push('Thank You! Visit Again');
  lines.push(ESCPOS.LINE_FEED);
  lines.push(ESCPOS.LINE_FEED);
  lines.push(ESCPOS.LINE_FEED);
  
  // Cut paper
  lines.push(ESCPOS.CUT_PAPER_PARTIAL);
  
  return lines.join('');
};

// Generate plain text receipt (for preview/fallback)
export const generatePlainReceipt = (bill: Bill, shopName: string = DEFAULT_SETTINGS.shopName): string => {
  const lines: string[] = [];
  
  // Header
  lines.push('');
  lines.push(shopName.padStart((LINE_WIDTH + shopName.length) / 2));
  lines.push(line('═'));
  
  // Items
  bill.items.forEach(item => {
    const itemName = formatItemName(item);
    const itemTotal = item.basePrice * item.quantity;
    lines.push(formatItemLine(itemName, item.quantity, itemTotal));
    
    // Add-ons
    item.addOns.forEach(addon => {
      if (addon.quantity > 0) {
        lines.push(formatAddOnLine(addon.name, addon.quantity));
      }
    });
  });
  
  lines.push(line('-'));
  
  // Total
  const totalLine = `TOTAL: ${formatPrice(bill.total)}`;
  lines.push(padLeft(totalLine, LINE_WIDTH));
  
  lines.push(line('-'));
  
  // Bill info
  lines.push(`Bill No: ${bill.billNumber}`.padStart((LINE_WIDTH + 20) / 2));
  
  const date = new Date(bill.createdAt);
  const dateStr = date.toLocaleDateString('en-IN');
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  lines.push(`${dateStr}  ${timeStr}`.padStart((LINE_WIDTH + 20) / 2));
  
  lines.push((bill.orderType === 'parcel' ? '[ PARCEL ]' : '[ DINE-IN ]').padStart((LINE_WIDTH + 10) / 2));
  
  lines.push(line('═'));
  lines.push('Thank You! Visit Again'.padStart((LINE_WIDTH + 22) / 2));
  lines.push('');
  
  return lines.join('\n');
};
