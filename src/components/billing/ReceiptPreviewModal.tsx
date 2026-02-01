import React, { memo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Bill } from '../../types';
import { generatePlainReceipt } from '../../services/printer/templates';
import { APP_NAME } from '../../config/constants';

interface ReceiptPreviewModalProps {
  visible: boolean;
  bill: Bill | null;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = memo(({
  visible,
  bill,
  onClose,
}) => {
  if (!bill) return null;

  const receiptText = generatePlainReceipt(bill, APP_NAME);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🖨️ Receipt Preview</Text>
            <Text style={styles.subtitle}>
              This is how your receipt will look on a 58mm thermal printer
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Receipt Paper */}
          <View style={styles.paperContainer}>
            <View style={styles.receiptPaper}>
              {/* Torn edge top */}
              <View style={styles.tornEdge} />
              
              {/* Receipt content */}
              <ScrollView 
                style={styles.receiptScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.receiptText}>{receiptText}</Text>
              </ScrollView>
              
              {/* Torn edge bottom */}
              <View style={[styles.tornEdge, styles.tornEdgeBottom]} />
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              📄 Bill No: {bill.billNumber}
            </Text>
            <Text style={styles.infoText}>
              💰 Total: ₹{bill.total}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.85,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#8a8a9a',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
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
  paperContainer: {
    padding: 20,
    alignItems: 'center',
  },
  receiptPaper: {
    backgroundColor: '#FFFEF5',
    width: '100%',
    maxWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tornEdge: {
    height: 12,
    backgroundColor: '#FFFEF5',
    marginLeft: -1,
    marginRight: -1,
    borderStyle: 'dashed',
    borderTopWidth: 2,
    borderTopColor: '#ddd',
  },
  tornEdgeBottom: {
    borderTopWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  receiptScroll: {
    maxHeight: height * 0.4,
  },
  receiptText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
    color: '#1a1a1a',
    padding: 12,
    letterSpacing: -0.3,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#8a8a9a',
  },
  doneButton: {
    margin: 20,
    marginTop: 0,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ReceiptPreviewModal;
