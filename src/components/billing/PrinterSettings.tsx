import React, { memo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Button from '../common/Button';

interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
}

interface PrinterStatus {
  connected: boolean;
  name: string | null;
  error: string | null;
}

interface PrinterSettingsProps {
  visible: boolean;
  onClose: () => void;
  status: PrinterStatus;
  isScanning: boolean;
  discoveredDevices: BluetoothDevice[];
  onScan: () => Promise<BluetoothDevice[]>;
  onConnect: (device: BluetoothDevice) => Promise<boolean>;
  onDisconnect: () => Promise<void>;
  onForget: () => Promise<void>;
}

const PrinterSettings: React.FC<PrinterSettingsProps> = memo(({
  visible,
  onClose,
  status,
  isScanning,
  discoveredDevices,
  onScan,
  onConnect,
  onDisconnect,
  onForget,
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (device: BluetoothDevice) => {
    setConnecting(device.id);
    try {
      await onConnect(device);
    } finally {
      setConnecting(null);
    }
  };

  const renderDevice = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      style={styles.deviceRow}
      onPress={() => handleConnect(item)}
      disabled={connecting === item.id}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        {item.rssi && (
          <Text style={styles.deviceRssi}>
            Signal: {item.rssi > -60 ? '🟢 Strong' : item.rssi > -80 ? '🟡 Medium' : '🔴 Weak'}
          </Text>
        )}
      </View>
      {connecting === item.id ? (
        <ActivityIndicator color="#FFD93D" />
      ) : (
        <Text style={styles.connectText}>Connect</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🖨️ Printer Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Current Status */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>Connection Status</Text>
            <View style={styles.statusCard}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: status.connected ? '#4CAF50' : '#FF6B6B' }
              ]} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusText}>
                  {status.connected ? 'Connected' : 'Not Connected'}
                </Text>
                {status.name && (
                  <Text style={styles.printerName}>{status.name}</Text>
                )}
                {status.error && (
                  <Text style={styles.errorText}>{status.error}</Text>
                )}
              </View>
            </View>

            {status.connected && (
              <View style={styles.connectedActions}>
                <Button
                  title="Disconnect"
                  onPress={onDisconnect}
                  variant="secondary"
                  size="small"
                />
                <Button
                  title="Forget Printer"
                  onPress={onForget}
                  variant="danger"
                  size="small"
                />
              </View>
            )}
          </View>

          {/* Scan Section */}
          {!status.connected && (
            <View style={styles.scanSection}>
              <View style={styles.scanHeader}>
                <Text style={styles.sectionTitle}>Available Printers</Text>
                <Button
                  title={isScanning ? 'Scanning...' : 'Scan'}
                  onPress={onScan}
                  variant="secondary"
                  size="small"
                  loading={isScanning}
                />
              </View>

              {isScanning ? (
                <View style={styles.scanningContainer}>
                  <ActivityIndicator size="large" color="#FFD93D" />
                  <Text style={styles.scanningText}>
                    Searching for nearby printers...
                  </Text>
                </View>
              ) : discoveredDevices.length > 0 ? (
                <FlatList
                  data={discoveredDevices}
                  renderItem={renderDevice}
                  keyExtractor={(item) => item.id}
                  style={styles.deviceList}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyText}>No printers found</Text>
                  <Text style={styles.emptySubtext}>
                    Make sure your printer is turned on and in pairing mode
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>📋 Setup Guide</Text>
            <Text style={styles.instructionsText}>
              1. Turn on your Bluetooth printer{'\n'}
              2. Enable pairing mode on the printer{'\n'}
              3. Tap "Scan" to find nearby devices{'\n'}
              4. Select your printer to connect
            </Text>
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
    maxHeight: '90%',
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
  statusSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a8a9a',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  printerName: {
    fontSize: 14,
    color: '#FFD93D',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  connectedActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  scanSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanningContainer: {
    alignItems: 'center',
    padding: 32,
  },
  scanningText: {
    marginTop: 16,
    fontSize: 14,
    color: '#8a8a9a',
  },
  deviceList: {
    maxHeight: 200,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a4a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deviceRssi: {
    fontSize: 12,
    color: '#8a8a9a',
    marginTop: 4,
  },
  connectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD93D',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8a8a9a',
    textAlign: 'center',
  },
  instructions: {
    padding: 20,
    backgroundColor: '#2a2a4a',
    margin: 20,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD93D',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: '#8a8a9a',
    lineHeight: 22,
  },
});

export default PrinterSettings;
