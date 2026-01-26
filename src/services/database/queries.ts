import { getDatabase } from './index';
import { Bill, OrderItem } from '../../types';
import { BILL_PREFIX } from '../../config/constants';

// Get next bill number for today
export const getNextBillNumber = async (): Promise<string> => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Get or create counter for today
  const result = await db.getFirstAsync<{ counter: number }>(
    'SELECT counter FROM daily_counter WHERE date = ?',
    [today]
  );

  let nextCounter: number;
  if (result) {
    nextCounter = result.counter + 1;
    await db.runAsync(
      'UPDATE daily_counter SET counter = ? WHERE date = ?',
      [nextCounter, today]
    );
  } else {
    nextCounter = 1;
    await db.runAsync(
      'INSERT INTO daily_counter (date, counter) VALUES (?, ?)',
      [today, nextCounter]
    );
  }

  // Format: BP-20260126-001
  const dateStr = today.replace(/-/g, '');
  const counterStr = nextCounter.toString().padStart(3, '0');
  return `${BILL_PREFIX}-${dateStr}-${counterStr}`;
};

// Save a new bill
export const saveBill = async (bill: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>): Promise<Bill> => {
  const db = await getDatabase();
  const billNumber = await getNextBillNumber();
  
  const result = await db.runAsync(
    `INSERT INTO bills (bill_number, order_type, items_json, subtotal, total) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      billNumber,
      bill.orderType,
      JSON.stringify(bill.items),
      bill.subtotal,
      bill.total,
    ]
  );

  return {
    id: result.lastInsertRowId,
    billNumber,
    orderType: bill.orderType,
    items: bill.items,
    subtotal: bill.subtotal,
    total: bill.total,
    createdAt: new Date().toISOString(),
  };
};

// Get today's bills
export const getTodaysBills = async (): Promise<Bill[]> => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  
  const results = await db.getAllAsync<{
    id: number;
    bill_number: string;
    order_type: 'parcel' | 'dine-in';
    items_json: string;
    subtotal: number;
    total: number;
    created_at: string;
  }>(
    `SELECT * FROM bills WHERE date(created_at) = date(?) ORDER BY created_at DESC`,
    [today]
  );

  return results.map(row => ({
    id: row.id,
    billNumber: row.bill_number,
    orderType: row.order_type,
    items: JSON.parse(row.items_json) as OrderItem[],
    subtotal: row.subtotal,
    total: row.total,
    createdAt: row.created_at,
  }));
};

// Get daily sales summary
export const getDailySales = async (date?: string): Promise<{ count: number; total: number }> => {
  const db = await getDatabase();
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const result = await db.getFirstAsync<{ count: number; total: number }>(
    `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total 
     FROM bills WHERE date(created_at) = date(?)`,
    [targetDate]
  );

  return result || { count: 0, total: 0 };
};

// Get bill by ID
export const getBillById = async (id: number): Promise<Bill | null> => {
  const db = await getDatabase();
  
  const row = await db.getFirstAsync<{
    id: number;
    bill_number: string;
    order_type: 'parcel' | 'dine-in';
    items_json: string;
    subtotal: number;
    total: number;
    created_at: string;
  }>('SELECT * FROM bills WHERE id = ?', [id]);

  if (!row) return null;

  return {
    id: row.id,
    billNumber: row.bill_number,
    orderType: row.order_type,
    items: JSON.parse(row.items_json) as OrderItem[],
    subtotal: row.subtotal,
    total: row.total,
    createdAt: row.created_at,
  };
};
