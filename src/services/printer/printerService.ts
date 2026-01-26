import { Bill, PrinterStatus } from '../../types';
import { generateReceipt, generatePlainReceipt } from './templates';

// Printer service state
let printerStatus: PrinterStatus = {
  connected: false,
  name: null,
  error: null,
};

// Note: Full Bluetooth printer implementation requires native modules
// This is a placeholder that will work with expo-print for basic functionality

// Get printer status
export const getPrinterStatus = (): PrinterStatus => printerStatus;

// Set printer status (for mock/testing)
export const setPrinterStatus = (status: Partial<PrinterStatus>): void => {
  printerStatus = { ...printerStatus, ...status };
};

// Print bill
export const printBill = async (bill: Bill, shopName?: string): Promise<boolean> => {
  try {
    // Generate receipt content
    const receiptContent = generateReceipt(bill, shopName);
    
    // For now, log the receipt (actual printing requires native Bluetooth module)
    console.log('=== PRINT PREVIEW ===');
    console.log(generatePlainReceipt(bill, shopName));
    console.log('===================');
    
    // In a full implementation, this would:
    // 1. Check Bluetooth connection
    // 2. Send ESC/POS commands to printer
    // 3. Handle errors and reconnect if needed
    
    return true;
  } catch (error) {
    console.error('Print error:', error);
    printerStatus.error = error instanceof Error ? error.message : 'Print failed';
    return false;
  }
};

// Scan for Bluetooth printers (placeholder)
export const scanForPrinters = async (): Promise<{ id: string; name: string }[]> => {
  // In full implementation, this would use react-native-ble-plx
  console.log('Scanning for printers...');
  return [];
};

// Connect to printer (placeholder)
export const connectToPrinter = async (printerId: string): Promise<boolean> => {
  console.log(`Connecting to printer: ${printerId}`);
  // Placeholder - would use Bluetooth connection
  return false;
};

// Disconnect from printer
export const disconnectPrinter = async (): Promise<void> => {
  printerStatus = {
    connected: false,
    name: null,
    error: null,
  };
};

// Test print
export const testPrint = async (): Promise<boolean> => {
  const testBill: Bill = {
    billNumber: 'TEST-001',
    orderType: 'dine-in',
    items: [
      {
        id: 'test-1',
        menuItemId: 'tea',
        name: 'Tea',
        category: 'beverages',
        portion: null,
        quantity: 2,
        basePrice: 15,
        addOns: [],
      },
    ],
    subtotal: 30,
    total: 30,
    createdAt: new Date().toISOString(),
  };
  
  return printBill(testBill);
};
