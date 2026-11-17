import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { BANK_ACCOUNTS } from '../data/mockData';
import { usePosStore } from '../store/usePosStore';
import { PaymentMethodType } from '../types';

export const PaymentScreen: React.FC = () => {
  const setScreen = usePosStore((s) => s.setScreen);
  const cart = usePosStore((s) => s.cart);
  const tableNumber = usePosStore((s) => s.tableNumber);
  const processPayment = usePosStore((s) => s.processPayment);
  const setQrisModalVisible = usePosStore((s) => s.setQrisModalVisible);

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('QRIS_PHYSICAL');
  const [cashReceived, setCashReceived] = useState<number>(50000);
  const [selectedBank, setSelectedBank] = useState('BCA');

  const change = Math.max(0, cashReceived - total);

  const handleConfirmPayment = () => {
    if (selectedMethod === 'CASH' && cashReceived < total) {
      Alert.alert('Uang Kurang', 'Nominal uang tunai diterima kurang dari total tagihan.');
      return;
    }

    processPayment({
      method: selectedMethod,
      amountDue: total,
      amountReceived: selectedMethod === 'CASH' ? cashReceived : total,
      change: selectedMethod === 'CASH' ? change : 0,
      bankName: selectedMethod === 'BANK_TRANSFER' ? selectedBank : undefined,
      status: 'PAID',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setScreen('POS_ORDER')} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.cream} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran Meja #{tableNumber}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Total Tagihan Card */}
        <View style={styles.totalCard}>
          <View>
            <Text style={styles.totalSub}>TOTAL PEMBAYARAN ({cart.length} ITEM)</Text>
            <Text style={styles.totalValue}>Rp {total.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.badgeDineIn}>
            <Text style={styles.badgeDineInText}>Meja #{tableNumber}</Text>
          </View>
        </View>

        {/* Payment Methods Section (NON-EDC) */}
        <Text style={styles.sectionTitle}>PILIH METODE PEMBAYARAN (NON-EDC)</Text>

        {/* 1. QRIS Fisik Toko */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            selectedMethod === 'QRIS_PHYSICAL' && styles.methodCardActive,
          ]}
          onPress={() => setSelectedMethod('QRIS_PHYSICAL')}
          activeOpacity={0.8}
        >
          <View style={styles.methodTop}>
            <View style={[styles.methodIconBox, { backgroundColor: COLORS.darkRoast }]}>
              <MaterialCommunityIcons name="qrcode-scan" size={22} color={COLORS.white} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Transfer via QRIS Fisik Toko</Text>
              <Text style={styles.methodSubtitle}>
                GoPay, DANA, OVO, ShopeePay, BCA QR, m-Banking
              </Text>
            </View>
            <View
              style={[
                styles.radioCirc,
                selectedMethod === 'QRIS_PHYSICAL' && styles.radioCircActive,
              ]}
            >
              {selectedMethod === 'QRIS_PHYSICAL' && <View style={styles.radioDot} />}
            </View>
          </View>

          {selectedMethod === 'QRIS_PHYSICAL' && (
            <TouchableOpacity
              style={styles.showQrisBtn}
              onPress={() => setQrisModalVisible(true)}
            >
              <MaterialCommunityIcons name="camera-metering-center" size={16} color={COLORS.darkRoast} />
              <Text style={styles.showQrisBtnText}>
                Tampilkan Barcode QRIS Layar Penuh (Scan Pelanggan)
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* 2. Transfer Bank Manual */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            selectedMethod === 'BANK_TRANSFER' && styles.methodCardActive,
          ]}
          onPress={() => setSelectedMethod('BANK_TRANSFER')}
          activeOpacity={0.8}
        >
          <View style={styles.methodTop}>
            <View style={[styles.methodIconBox, { backgroundColor: COLORS.blue }]}>
              <MaterialCommunityIcons name="bank-transfer" size={22} color={COLORS.white} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Transfer Bank (No. Rekening ATM)</Text>
              <Text style={styles.methodSubtitle}>
                BCA, Mandiri, BRI Manual M-Banking
              </Text>
            </View>
            <View
              style={[
                styles.radioCirc,
                selectedMethod === 'BANK_TRANSFER' && styles.radioCircActive,
              ]}
            >
              {selectedMethod === 'BANK_TRANSFER' && <View style={styles.radioDot} />}
            </View>
          </View>

          {selectedMethod === 'BANK_TRANSFER' && (
            <View style={styles.bankAccountsContainer}>
              {BANK_ACCOUNTS.map((b) => (
                <TouchableOpacity
                  key={b.bank}
                  style={[
                    styles.bankPill,
                    selectedBank === b.bank && styles.bankPillActive,
                  ]}
                  onPress={() => {
                    setSelectedBank(b.bank);
                    Alert.alert(
                      'Nomor Rekening Disalin',
                      `Bank ${b.bank}: ${b.accountNumber}\na.n. ${b.holderName}\n\nSilakan verifikasi mutasi masuk di m-Banking toko.`
                    );
                  }}
                >
                  <View>
                    <Text style={styles.bankName}>{b.bank}: {b.accountNumber}</Text>
                    <Text style={styles.bankHolder}>a.n. {b.holderName}</Text>
                  </View>
                  <View style={styles.copyBadge}>
                    <Text style={styles.copyBadgeText}>Salin & Pilih</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* 3. Tunai (Cash) */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            selectedMethod === 'CASH' && styles.methodCardActive,
          ]}
          onPress={() => setSelectedMethod('CASH')}
          activeOpacity={0.8}
        >
          <View style={styles.methodTop}>
            <View style={[styles.methodIconBox, { backgroundColor: COLORS.success }]}>
              <MaterialCommunityIcons name="cash" size={22} color={COLORS.white} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Uang Tunai (Cash)</Text>
              <Text style={styles.methodSubtitle}>Hitung uang fisik & kembalian laci</Text>
            </View>
            <View
              style={[
                styles.radioCirc,
                selectedMethod === 'CASH' && styles.radioCircActive,
              ]}
            >
              {selectedMethod === 'CASH' && <View style={styles.radioDot} />}
            </View>
          </View>

          {selectedMethod === 'CASH' && (
            <View style={styles.cashCalcBox}>
              <Text style={styles.calcLabel}>Nominal Uang Diterima:</Text>
              <View style={styles.cashInputWrap}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.cashInput}
                  keyboardType="numeric"
                  value={cashReceived ? cashReceived.toString() : ''}
                  onChangeText={(val) => setCashReceived(parseInt(val, 10) || 0)}
                />
              </View>

              {/* Quick Cash Buttons */}
              <View style={styles.quickNominalsRow}>
                <TouchableOpacity
                  style={styles.quickNomBtn}
                  onPress={() => setCashReceived(total)}
                >
                  <Text style={styles.quickNomText}>Pas ({total / 1000}k)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickNomBtn}
                  onPress={() => setCashReceived(30000)}
                >
                  <Text style={styles.quickNomText}>30k</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickNomBtn}
                  onPress={() => setCashReceived(50000)}
                >
                  <Text style={styles.quickNomText}>50k</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickNomBtn}
                  onPress={() => setCashReceived(100000)}
                >
                  <Text style={styles.quickNomText}>100k</Text>
                </TouchableOpacity>
              </View>

              {/* Change Box */}
              <View style={styles.changeCard}>
                <Text style={styles.changeLabel}>Kembalian Pelanggan:</Text>
                <Text style={styles.changeVal}>Rp {change.toLocaleString('id-ID')}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Verification Alert Note */}
        <View style={styles.verificationNote}>
          <MaterialCommunityIcons name="check-decagram" size={18} color={COLORS.success} />
          <Text style={styles.verificationNoteText}>
            Kasir pastikan notifikasi dana masuk telah diterima di HP toko sebelum konfirmasi.
          </Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Confirm Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPayment}>
          <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.white} />
          <Text style={styles.confirmBtnText}>
            KONFIRMASI LUNAS & BUKA LACI
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvasBg,
  },
  header: {
    backgroundColor: COLORS.darkRoast,
    paddingTop: 45,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.darkRoastLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  scrollContent: {
    padding: 16,
  },
  totalCard: {
    backgroundColor: COLORS.darkRoast,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalSub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.cream,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 4,
  },
  badgeDineIn: {
    backgroundColor: COLORS.darkRoastLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeDineInText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cream,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  methodCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  methodCardActive: {
    borderColor: COLORS.caramel,
    backgroundColor: '#FFFDFB',
  },
  methodTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  methodSubtitle: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  radioCirc: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircActive: {
    borderColor: COLORS.caramel,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.caramel,
  },
  showQrisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  showQrisBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.darkRoast,
  },
  bankAccountsContainer: {
    marginTop: 14,
    gap: 8,
  },
  bankPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.canvasBg,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bankPillActive: {
    borderColor: COLORS.caramel,
    backgroundColor: COLORS.cream,
  },
  bankName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  bankHolder: {
    fontSize: 10,
    color: COLORS.muted,
  },
  copyBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  copyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.caramel,
  },
  cashCalcBox: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  calcLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  cashInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.canvasBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 44,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.muted,
    marginRight: 6,
  },
  cashInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  quickNominalsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickNomBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickNomText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.caramel,
  },
  changeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  changeLabel: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  changeVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.success,
  },
  verificationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.cream,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  verificationNoteText: {
    fontSize: 11,
    color: COLORS.darkRoast,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmBtn: {
    backgroundColor: COLORS.caramel,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
