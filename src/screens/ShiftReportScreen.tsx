import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { usePosStore } from '../store/usePosStore';

export const ShiftReportScreen: React.FC = () => {
  const setScreen = usePosStore((s) => s.setScreen);
  const currentShift = usePosStore((s) => s.currentShift);
  const addCashMovement = usePosStore((s) => s.addCashMovement);

  // Cash count physical input state
  const totalCashOut = currentShift.cashMovements
    .filter((m) => m.type === 'CASH_OUT')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalCashInExtra = currentShift.cashMovements
    .filter((m) => m.type === 'CASH_IN')
    .reduce((sum, m) => sum + m.amount, 0);

  const expectedCashInDrawer =
    currentShift.openingCashFloat + currentShift.cashSales + totalCashInExtra - totalCashOut;

  const [physicalCashText, setPhysicalCashText] = useState(expectedCashInDrawer.toString());
  const physicalCash = parseInt(physicalCashText, 10) || 0;
  const variance = physicalCash - expectedCashInDrawer;

  // Modal for new cash movement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moveType, setMoveType] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_OUT');
  const [moveAmount, setMoveAmount] = useState('');
  const [moveNote, setMoveNote] = useState('');
  const [moveCategory, setMoveCategory] = useState('RAW_MATERIAL');

  const totalOmset =
    currentShift.cashSales + currentShift.qrisSales + currentShift.bankTransferSales;

  const handleAddMovement = () => {
    const amountNum = parseInt(moveAmount, 10);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Perhatian', 'Masukkan nominal uang yang valid.');
      return;
    }
    if (!moveNote.trim()) {
      Alert.alert('Perhatian', 'Keterangan pengeluaran/pemasukan wajib diisi.');
      return;
    }

    addCashMovement(moveType, moveCategory, amountNum, moveNote.trim());
    setIsModalOpen(false);
    setMoveAmount('');
    setMoveNote('');
    Alert.alert('Sukses', 'Mutasi kas berhasil dicatat!');
  };

  const handlePrintZReport = () => {
    Alert.alert(
      'Printer Bluetooth ESC/POS',
      'Mencetak Laporan Z-Report Tutup Shift ke Printer Kasir 58mm... Berhasil!'
    );
  };

  const handleSendWaReport = () => {
    const waText = `*LAPORAN TUTUP SHIFT - THREE COFFEE*\n--------------------------------\nShift ID: ${currentShift.shiftId}\nKasir: ${currentShift.cashierName}\nBuka: ${currentShift.openedAt} WIB\n\n*1. RINGKASAN PENJUALAN*\n- Tunai: Rp ${currentShift.cashSales.toLocaleString('id-ID')}\n- QRIS Fisik: Rp ${currentShift.qrisSales.toLocaleString('id-ID')}\n- Transfer Bank: Rp ${currentShift.bankTransferSales.toLocaleString('id-ID')}\n*Total Omset: Rp ${totalOmset.toLocaleString('id-ID')}* (${currentShift.totalTransactions} Trx)\n\n*2. REKAP KAS LACI*\n- Modal Awal: Rp ${currentShift.openingCashFloat.toLocaleString('id-ID')}\n- Kas Keluar (Petty): Rp ${totalCashOut.toLocaleString('id-ID')}\n- Kas Seharusnya: Rp ${expectedCashInDrawer.toLocaleString('id-ID')}\n- Kas Fisik Dihitung: Rp ${physicalCash.toLocaleString('id-ID')}\n- Selisih: Rp ${variance.toLocaleString('id-ID')} (${variance === 0 ? 'COCOK' : variance > 0 ? 'LEBIH' : 'KURANG'})\n--------------------------------\n_Laporan otomatis sistem POS Three Coffee_`;

    Alert.alert('Kirim Format Laporan WhatsApp', waText);
  };

  const handleCloseShift = () => {
    Alert.alert(
      'Konfirmasi Tutup Shift',
      `Tutup shift sekarang dengan selisih kas Rp ${variance.toLocaleString('id-ID')}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Tutup Shift',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Shift Ditutup', 'Shift berhasil ditutup dan data telah tersimpan.');
            setScreen('DASHBOARD');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('DASHBOARD')}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Rekapitulasi Kas & Tutup Shift</Text>
          <Text style={styles.headerSubtitle}>
            Shift: {currentShift.shiftId} • Kasir: {currentShift.cashierName}
          </Text>
        </View>
        <TouchableOpacity style={styles.printHeaderBtn} onPress={handlePrintZReport}>
          <MaterialCommunityIcons name="printer" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Total Omset */}
        <View style={styles.omsetBanner}>
          <View>
            <Text style={styles.omsetBannerLabel}>TOTAL OMSET SHIFT INI</Text>
            <Text style={styles.omsetBannerValue}>Rp {totalOmset.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.trxPill}>
            <Text style={styles.trxPillText}>{currentShift.totalTransactions} Transaksi</Text>
          </View>
        </View>

        {/* 1. Card Kas Masuk (Cash In) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapGreen}>
              <MaterialCommunityIcons name="cash-plus" size={18} color="#16A34A" />
            </View>
            <Text style={styles.cardSectionTitle}>1. Rekapitulasi Kas Masuk (Tunai)</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Modal Kas Awal (Opening Float)</Text>
            <Text style={styles.rowVal}>
              Rp {currentShift.openingCashFloat.toLocaleString('id-ID')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Penjualan Tunai di Kasir</Text>
            <Text style={styles.rowValBold}>
              + Rp {currentShift.cashSales.toLocaleString('id-ID')}
            </Text>
          </View>
          {totalCashInExtra > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Pemasukan Kas Lain / Titipan</Text>
              <Text style={styles.rowVal}>
                + Rp {totalCashInExtra.toLocaleString('id-ID')}
              </Text>
            </View>
          )}

          <View style={styles.divider} />
          <View style={styles.rowTotal}>
            <Text style={styles.totalLabel}>Ekspektasi Kas Masuk</Text>
            <Text style={styles.totalValGreen}>
              Rp {(currentShift.openingCashFloat + currentShift.cashSales + totalCashInExtra).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* 2. Card Kas Keluar (Petty Cash) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderBetween}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardIconWrapRed}>
                <MaterialCommunityIcons name="cash-minus" size={18} color="#DC2626" />
              </View>
              <Text style={styles.cardSectionTitle}>2. Kas Keluar (Petty Cash)</Text>
            </View>
            <TouchableOpacity
              style={styles.addMovementBtn}
              onPress={() => setIsModalOpen(true)}
            >
              <MaterialCommunityIcons name="plus" size={14} color={COLORS.primary} />
              <Text style={styles.addMovementBtnText}>Tambah</Text>
            </TouchableOpacity>
          </View>

          {currentShift.cashMovements.map((move) => (
            <View key={move.id} style={styles.movementItem}>
              <View style={styles.movementLeft}>
                <Text style={styles.movementNote}>{move.note}</Text>
                <Text style={styles.movementMeta}>
                  {move.timestamp} • {move.category}
                </Text>
              </View>
              <Text style={styles.movementAmount}>
                {move.type === 'CASH_OUT' ? '-' : '+'} Rp {move.amount.toLocaleString('id-ID')}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.rowTotal}>
            <Text style={styles.totalLabel}>Total Kas Keluar Shift Ini</Text>
            <Text style={styles.totalValRed}>
              - Rp {totalCashOut.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* 3. Card Digital Settlements (QRIS & Bank Transfer) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapBlue}>
              <MaterialCommunityIcons name="cellphone-check" size={18} color="#2563EB" />
            </View>
            <Text style={styles.cardSectionTitle}>3. Rekap Non-Tunai (Tanpa EDC)</Text>
          </View>

          <View style={styles.digitalRow}>
            <View style={styles.digitalLeft}>
              <MaterialCommunityIcons name="qrcode-scan" size={20} color={COLORS.primary} />
              <View>
                <Text style={styles.digitalTitle}>Transfer via QRIS Fisik Toko</Text>
                <Text style={styles.digitalSub}>GoPay, DANA, OVO, ShopeePay, m-Banking</Text>
              </View>
            </View>
            <Text style={styles.digitalAmount}>
              Rp {currentShift.qrisSales.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={styles.digitalRow}>
            <View style={styles.digitalLeft}>
              <MaterialCommunityIcons name="bank-transfer" size={20} color="#2563EB" />
              <View>
                <Text style={styles.digitalTitle}>Transfer Bank Manual</Text>
                <Text style={styles.digitalSub}>BCA, Mandiri, BRI (Sesuai Rekening Toko)</Text>
              </View>
            </View>
            <Text style={styles.digitalAmount}>
              Rp {currentShift.bankTransferSales.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.rowTotal}>
            <Text style={styles.totalLabel}>Total Penjualan Non-Tunai</Text>
            <Text style={styles.totalValBlue}>
              Rp {(currentShift.qrisSales + currentShift.bankTransferSales).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* 4. Card Rekonsiliasi & Fisik Laci */}
        <View style={styles.cardReconciliation}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconWrapPrimary}>
              <MaterialCommunityIcons name="scale-balance" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.cardSectionTitle}>4. Rekonsiliasi Kas Laci Fisik</Text>
          </View>

          <View style={styles.calcFormulaBlock}>
            <Text style={styles.calcFormulaTitle}>Perhitungan Kas Seharusnya di Laci:</Text>
            <Text style={styles.calcFormulaDetail}>
              (Modal Awal + Penjualan Tunai) - Kas Keluar
            </Text>
            <Text style={styles.calcFormulaMath}>
              ({currentShift.openingCashFloat.toLocaleString('id-ID')} + {currentShift.cashSales.toLocaleString('id-ID')}) - {totalCashOut.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.calcFormulaResult}>
              = Rp {expectedCashInDrawer.toLocaleString('id-ID')}
            </Text>
          </View>

          {/* Input Fisik Laci */}
          <View style={styles.physicalInputBox}>
            <Text style={styles.physicalInputLabel}>Nominal Uang Fisik di Laci Kasir:</Text>
            <View style={styles.inputPrefixWrap}>
              <Text style={styles.inputPrefix}>Rp</Text>
              <TextInput
                style={styles.inputField}
                value={physicalCashText}
                onChangeText={setPhysicalCashText}
                keyboardType="numeric"
                placeholder="1500000"
              />
            </View>
          </View>

          {/* Variance Status Pill */}
          <View
            style={[
              styles.varianceBox,
              variance === 0
                ? styles.varBalanced
                : variance > 0
                ? styles.varSurplus
                : styles.varShort,
            ]}
          >
            <View style={styles.varLeft}>
              <MaterialCommunityIcons
                name={
                  variance === 0
                    ? 'check-circle'
                    : variance > 0
                    ? 'arrow-up-bold-circle'
                    : 'alert-circle'
                }
                size={22}
                color={
                  variance === 0 ? '#16A34A' : variance > 0 ? '#2563EB' : '#DC2626'
                }
              />
              <View>
                <Text style={styles.varTitle}>
                  {variance === 0
                    ? 'STATUS: COCOK (BALANCED)'
                    : variance > 0
                    ? 'STATUS: KAS LEBIH (SURPLUS)'
                    : 'STATUS: KAS KURANG (SHORT)'}
                </Text>
                <Text style={styles.varSubtitle}>
                  Selisih Laci: Rp {Math.abs(variance).toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.btnZReport} onPress={handlePrintZReport}>
          <MaterialCommunityIcons name="printer" size={18} color="#FFFFFF" />
          <Text style={styles.btnActionText}>Cetak Z-Report (58mm)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnWa} onPress={handleSendWaReport}>
          <MaterialCommunityIcons name="whatsapp" size={18} color="#FFFFFF" />
          <Text style={styles.btnActionText}>Kirim WA Owner</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCloseShift} onPress={handleCloseShift}>
          <MaterialCommunityIcons name="lock-check" size={18} color="#FFFFFF" />
          <Text style={styles.btnActionText}>Tutup Shift</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Add Movement */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Catat Kas Keluar / Masuk</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <MaterialCommunityIcons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.tabToggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, moveType === 'CASH_OUT' && styles.toggleBtnActiveRed]}
                onPress={() => setMoveType('CASH_OUT')}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    moveType === 'CASH_OUT' && styles.toggleBtnTextActive,
                  ]}
                >
                  Kas Keluar (Petty Cash)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, moveType === 'CASH_IN' && styles.toggleBtnActiveGreen]}
                onPress={() => setMoveType('CASH_IN')}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    moveType === 'CASH_IN' && styles.toggleBtnTextActive,
                  ]}
                >
                  Kas Masuk (Titipan)
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Nominal (Rp)</Text>
            <TextInput
              style={styles.modalInput}
              value={moveAmount}
              onChangeText={setMoveAmount}
              placeholder="Contoh: 30000"
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Keterangan Keperluan</Text>
            <TextInput
              style={styles.modalInput}
              value={moveNote}
              onChangeText={setMoveNote}
              placeholder="Contoh: Beli Es Batu Kristal 3 pack"
            />

            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddMovement}>
              <Text style={styles.modalSaveText}>Simpan Mutasi Kas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  printHeaderBtn: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  omsetBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  omsetBannerLabel: {
    fontSize: 11,
    color: '#E8DFD8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  omsetBannerValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  trxPill: {
    backgroundColor: '#3E2419',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trxPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4A373',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  cardReconciliation: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIconWrapGreen: {
    backgroundColor: '#DCFCE7',
    padding: 6,
    borderRadius: 6,
  },
  cardIconWrapRed: {
    backgroundColor: '#FEE2E2',
    padding: 6,
    borderRadius: 6,
  },
  cardIconWrapBlue: {
    backgroundColor: '#DBEAFE',
    padding: 6,
    borderRadius: 6,
  },
  cardIconWrapPrimary: {
    backgroundColor: COLORS.surface,
    padding: 6,
    borderRadius: 6,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  addMovementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addMovementBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rowVal: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  rowValBold: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  totalValGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  totalValRed: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  totalValBlue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  movementLeft: {
    flex: 1,
    paddingRight: 10,
  },
  movementNote: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  movementMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  movementAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  digitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  digitalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  digitalTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  digitalSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  digitalAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  calcFormulaBlock: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  calcFormulaTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  calcFormulaDetail: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  calcFormulaMath: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  calcFormulaResult: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  physicalInputBox: {
    marginBottom: 12,
  },
  physicalInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  inputPrefixWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 6,
  },
  inputField: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  varianceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  varBalanced: {
    backgroundColor: '#DCFCE7',
  },
  varSurplus: {
    backgroundColor: '#DBEAFE',
  },
  varShort: {
    backgroundColor: '#FEE2E2',
  },
  varLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  varTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  varSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  btnZReport: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnWa: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnCloseShift: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  tabToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  toggleBtnActiveRed: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  toggleBtnActiveGreen: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: {
    color: COLORS.textDark,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 14,
  },
  modalSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
