import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, PermissionsAndroid, Alert, Permission } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BleManager, Device, State } from 'react-native-ble-plx';
import { PrinterStatus } from '../types';

const STORAGE_KEY = 'saved_printer';
const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 3;
const SCAN_DURATION = 10000; // 10 seconds scan

// Create BLE Manager instance
const bleManager = new BleManager();

interface SavedPrinter {
  id: string;
  name: string;
}

interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
}

// Common thermal printer name patterns
const PRINTER_NAME_PATTERNS = [
  'printer',
  'pos',
  'thermal',
  'receipt',
  'escpos',
  'esc/pos',
  'bluetooth printer',
  'bt printer',
  '58mm',
  '80mm',
  'xprinter',
  'epson',
  'star',
  'bixolon',
  'zjiang',
  'goojprt',
  'munbyn',
  'netum',
  'nyear',
  'milestone',
  'mht',
  'inner',
  'hprt',
  'gprinter',
];

// Check if device name matches printer patterns
const isPrinterDevice = (deviceName: string | null): boolean => {
  if (!deviceName) return false;
  const lowerName = deviceName.toLowerCase();
  return PRINTER_NAME_PATTERNS.some(pattern => lowerName.includes(pattern));
};

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
  const connectedDeviceRef = useRef<Device | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualDisconnectRef = useRef(false); // Track manual disconnect

  // Request Bluetooth permissions (Android)
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // Check Android version for appropriate permissions
        const androidVersion = Platform.Version;
        
        let permissionsToRequest: string[] = [];
        
        if (androidVersion >= 31) {
          // Android 12+ needs BLUETOOTH_SCAN and BLUETOOTH_CONNECT
          permissionsToRequest = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];
        } else {
          // Older Android versions
          permissionsToRequest = [
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];
        }

        const granted = await PermissionsAndroid.requestMultiple(
          permissionsToRequest as Permission[]
        );

        const allGranted = Object.values(granted).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          // Check if user selected "Never ask again"
          const neverAskAgain = Object.values(granted).some(
            (permission) => permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          );

          Alert.alert(
            'Bluetooth Permission Required',
            neverAskAgain
              ? 'Bluetooth permissions are required to connect to printers. Please enable them in your device Settings > Apps > AnnaBill > Permissions.'
              : 'Bluetooth permissions are required to scan for and connect to printers. Please grant the permissions when prompted.',
            [{ text: 'OK', style: 'default' }]
          );
          return false;
        }

        return true;
      } catch (error) {
        console.error('Permission request error:', error);
        Alert.alert(
          'Permission Error',
          'An error occurred while requesting Bluetooth permissions. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  // Check Bluetooth state
  const checkBluetoothState = async (): Promise<boolean> => {
    try {
      const state = await bleManager.state();
      if (state !== State.PoweredOn) {
        Alert.alert(
          'Bluetooth Required',
          'Please turn on Bluetooth to scan for printers.',
          [{ text: 'OK', style: 'default' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Bluetooth state check error:', error);
      return false;
    }
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

  // Scan for Bluetooth printers - REAL SCANNING
  const scanForPrinters = useCallback(async (): Promise<BluetoothDevice[]> => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      setStatus((prev) => ({
        ...prev,
        error: 'Bluetooth permissions required',
      }));
      return [];
    }

    const bluetoothOn = await checkBluetoothState();
    if (!bluetoothOn) {
      setStatus((prev) => ({
        ...prev,
        error: 'Bluetooth is not enabled',
      }));
      return [];
    }

    setIsScanning(true);
    setDiscoveredDevices([]);
    setStatus((prev) => ({ ...prev, error: null }));

    const foundDevices: Map<string, BluetoothDevice> = new Map();

    try {
      // Stop any existing scan
      bleManager.stopDeviceScan();

      // Start scanning
      bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setStatus((prev) => ({
            ...prev,
            error: 'Scan error: ' + error.message,
          }));
          return;
        }

        if (device && device.name) {
          // Add all devices with names (user can identify their printer)
          // Prioritize devices that match printer patterns
          const deviceInfo: BluetoothDevice = {
            id: device.id,
            name: device.name,
            rssi: device.rssi ?? undefined,
          };

          foundDevices.set(device.id, deviceInfo);
          
          // Update discovered devices list
          const deviceList = Array.from(foundDevices.values())
            // Sort: printers first, then by signal strength
            .sort((a, b) => {
              const aIsPrinter = isPrinterDevice(a.name);
              const bIsPrinter = isPrinterDevice(b.name);
              if (aIsPrinter && !bIsPrinter) return -1;
              if (!aIsPrinter && bIsPrinter) return 1;
              return (b.rssi ?? -100) - (a.rssi ?? -100);
            });

          setDiscoveredDevices(deviceList);
        }
      });

      // Stop scanning after duration
      await new Promise<void>((resolve) => {
        scanTimeoutRef.current = setTimeout(() => {
          bleManager.stopDeviceScan();
          resolve();
        }, SCAN_DURATION);
      });

      const deviceList = Array.from(foundDevices.values());
      
      if (deviceList.length === 0) {
        setStatus((prev) => ({
          ...prev,
          error: 'No Bluetooth devices found. Make sure your printer is turned on and in pairing mode.',
        }));
      }

      return deviceList;
    } catch (error) {
      console.error('Scan error:', error);
      setStatus((prev) => ({
        ...prev,
        error: 'Failed to scan for printers',
      }));
      return [];
    } finally {
      setIsScanning(false);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
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

      // Connect to the device
      const connectedDevice = await bleManager.connectToDevice(device.id, {
        timeout: 10000,
      });

      // Discover services and characteristics
      await connectedDevice.discoverAllServicesAndCharacteristics();

      connectedDeviceRef.current = connectedDevice;

      // Success
      setStatus({
        connected: true,
        name: device.name,
        error: null,
      });

      // Save for auto-reconnect
      await savePrinter({ id: device.id, name: device.name });

      reconnectAttemptsRef.current = 0;
      manualDisconnectRef.current = false; // Reset manual disconnect flag
      console.log(`Connected to printer: ${device.name}`);

      // Set up disconnection listener
      connectedDevice.onDisconnected((error, disconnectedDevice) => {
        console.log('Printer disconnected:', disconnectedDevice?.name);
        handleConnectionLoss();
      });

      return true;
    } catch (error: any) {
      console.error('Connection error:', error);
      setStatus({
        connected: false,
        name: null,
        error: `Failed to connect: ${error.message || 'Unknown error'}`,
      });
      return false;
    }
  }, []);

  // Disconnect from printer
  const disconnectPrinter = useCallback(async () => {
    try {
      // Set flag to prevent auto-reconnect
      manualDisconnectRef.current = true;
      
      // Stop auto-reconnect attempts
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      // Disconnect the device
      if (connectedDeviceRef.current) {
        try {
          await connectedDeviceRef.current.cancelConnection();
        } catch (e) {
          console.log('Device already disconnected');
        }
        connectedDeviceRef.current = null;
      }

      setStatus({
        connected: false,
        name: null,
        error: null,
      });

      console.log('Disconnected from printer');
    } catch (error) {
      console.error('Disconnect error:', error);
      setStatus({
        connected: false,
        name: null,
        error: null,
      });
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

  // Handle connection loss (only for unexpected disconnects)
  const handleConnectionLoss = useCallback(() => {
    // Don't auto-reconnect if manually disconnected
    if (manualDisconnectRef.current) {
      console.log('Manual disconnect - skipping auto-reconnect');
      return;
    }
    
    setStatus((prev) => ({
      ...prev,
      connected: false,
      error: 'Connection lost. Attempting to reconnect...',
    }));

    connectedDeviceRef.current = null;
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
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      bleManager.stopDeviceScan();
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
