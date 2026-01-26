import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrinterStatus } from '../types';

const STORAGE_KEY = 'saved_printer';
const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 3;

// Simulated Bluetooth printer management
// In production, replace with react-native-ble-plx or similar

interface SavedPrinter {
  id: string;
  name: string;
}

interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
}

export const usePrinter = () => {
  const [status, setStatus] = useState<PrinterStatus>({
    connected: false,
    name: null,
    error: null,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>([]);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedPrinterRef = useRef<SavedPrinter | null>(null);

  // Request Bluetooth permissions (Android)
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return Object.values(granted).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  // Load saved printer
  const loadSavedPrinter = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        savedPrinterRef.current = JSON.parse(saved);
        return savedPrinterRef.current;
      }
    } catch (error) {
      console.error('Error loading saved printer:', error);
    }
    return null;
  }, []);

  // Save printer for auto-reconnect
  const savePrinter = async (printer: SavedPrinter) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(printer));
      savedPrinterRef.current = printer;
    } catch (error) {
      console.error('Error saving printer:', error);
    }
  };

  // Scan for Bluetooth printers
  const scanForPrinters = useCallback(async (): Promise<BluetoothDevice[]> => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      setStatus((prev) => ({
        ...prev,
        error: 'Bluetooth permissions required',
      }));
      return [];
    }

    setIsScanning(true);
    setDiscoveredDevices([]);

    try {
      // Simulated device discovery
      // In production, use BLE library to scan for ESC/POS printers
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Mock discovered printers (replace with actual BLE scanning)
      const mockDevices: BluetoothDevice[] = [
        { id: 'printer-001', name: 'Thermal Printer 58mm', rssi: -50 },
        { id: 'printer-002', name: 'POS Printer', rssi: -65 },
      ];

      setDiscoveredDevices(mockDevices);
      return mockDevices;
    } catch (error) {
      console.error('Scan error:', error);
      setStatus((prev) => ({
        ...prev,
        error: 'Failed to scan for printers',
      }));
      return [];
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Connect to a printer
  const connectToPrinter = useCallback(async (device: BluetoothDevice): Promise<boolean> => {
    try {
      setStatus({
        connected: false,
        name: device.name,
        error: null,
      });

      // Simulated connection (replace with actual BLE connection)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success
      setStatus({
        connected: true,
        name: device.name,
        error: null,
      });

      // Save for auto-reconnect
      await savePrinter({ id: device.id, name: device.name });

      reconnectAttemptsRef.current = 0;
      console.log(`Connected to printer: ${device.name}`);
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      setStatus({
        connected: false,
        name: null,
        error: `Failed to connect to ${device.name}`,
      });
      return false;
    }
  }, []);

  // Disconnect from printer
  const disconnectPrinter = useCallback(async () => {
    try {
      // Stop auto-reconnect attempts
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      setStatus({
        connected: false,
        name: null,
        error: null,
      });

      console.log('Disconnected from printer');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, []);

  // Auto-reconnect logic
  const attemptReconnect = useCallback(async () => {
    const savedPrinter = savedPrinterRef.current;
    if (!savedPrinter) return;

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setStatus((prev) => ({
        ...prev,
        error: 'Auto-reconnect failed after multiple attempts',
      }));
      return;
    }

    reconnectAttemptsRef.current++;
    console.log(`Reconnect attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);

    const success = await connectToPrinter({
      id: savedPrinter.id,
      name: savedPrinter.name,
    });

    if (!success) {
      // Schedule next attempt
      reconnectTimerRef.current = setTimeout(attemptReconnect, RECONNECT_INTERVAL);
    }
  }, [connectToPrinter]);

  // Handle connection loss
  const handleConnectionLoss = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      connected: false,
      error: 'Connection lost. Attempting to reconnect...',
    }));

    reconnectAttemptsRef.current = 0;
    attemptReconnect();
  }, [attemptReconnect]);

  // Try to auto-connect on mount
  useEffect(() => {
    const autoConnect = async () => {
      const savedPrinter = await loadSavedPrinter();
      if (savedPrinter) {
        console.log(`Auto-connecting to saved printer: ${savedPrinter.name}`);
        await connectToPrinter({
          id: savedPrinter.id,
          name: savedPrinter.name,
        });
      }
    };

    autoConnect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [loadSavedPrinter, connectToPrinter]);

  // Forget saved printer
  const forgetPrinter = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      savedPrinterRef.current = null;
      await disconnectPrinter();
    } catch (error) {
      console.error('Error forgetting printer:', error);
    }
  };

  return {
    status,
    isScanning,
    discoveredDevices,
    scanForPrinters,
    connectToPrinter,
    disconnectPrinter,
    forgetPrinter,
    handleConnectionLoss,
  };
};

export default usePrinter;
