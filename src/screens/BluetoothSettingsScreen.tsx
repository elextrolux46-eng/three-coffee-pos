import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { usePosStore } from '../store/usePosStore';
import {
  requestBluetoothPermission,
  openBluetoothSettings,
  openThermalPrinterApp,
  printThermalViaRawBt,
} from '../utils/deviceIntegration';

// Simulated paired device list (real scan needs native module beyond this stack)
const MOCK_PAIRED_DEVICES = [
  { id: 'bt-001', name: 'Panda PRJ-58D', type: 'printer', rssi: -52 },
  { id: 'bt-002', name: 'RPP02N Thermal', type: 'printer', rssi: -61 },
  { id: 'bt-003', name: 'BT-Speaker JBL', type: 'audio', rssi: -78 },
];

export const BluetoothSettingsScreen: React.FC = () => {
  const setScreen = usePosStore((s) => s.setScreen);
  const printerConnected = usePosStore((s) => s.printerConnected);
  const togglePrinterConnection = usePosStore((s) => s.togglePrinterConnection);

  const [btEnabled, setBtEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [permGranted, setPermGranted] = useState<boolean | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>('bt-001');
  const [devices, setDevices] = useState(MOCK_PAIRED_DEVICES);

  const handleToggleBluetooth = async (val: boolean) => {
    if (val) {
      // Request permission first when turning on
      const res = await requestBluetoothPermission();
      setPermGranted(res.granted);
      if (!res.granted) {
        Alert.alert('Izin Diperlukan', res.message, [
          { text: 'Buka Pengaturan', onPress: openBluetoothSettings },
          { text: 'Batal', style: 'cancel' },
        ]);
        return;
      }
    }
    setBtEnabled(val);
    if (!val) {
      setSelectedDevice(null);
      togglePrinterConnection();
    }
  };

  const handleScan = async () => {
    if (!btEnabled) {
      Alert.alert('Bluetooth Mati', 'Aktifkan Bluetooth terlebih dahulu.');
      return;
    }
    setIsScanning(true);
    // Open Android BT settings for real pairing
    await openBluetoothSettings();
    setTimeout(() => {
      setIsScanning(false);
      // Refresh mock list
      setDevices([...MOCK_PAIRED_DEVICES]);
    }, 2000);
  };

  const handleSelectDevice = (id: string, name: string) => {
    setSelectedDevice(id);
    if (!printerConnected) togglePrinterConnection();
    Alert.alert('Terhubung', `Printer "${name}" siap digunakan.`);
  };

  const handleTestPrint = async () => {
    if (!selectedDevice) {
      Alert.alert('Pilih Perangkat', 'Pilih printer terlebih dahulu.');
      return;
    }
    const device = devices.find((d) => d.id === selectedDevice);
    const testSlip =
      `================================\n` +
      `          THREE COFFEE          \n` +
      `     TEST PRINT THERMAL 58MM    \n` +
      `================================\n` +
      `Printer : ${device?.name || 'Unknown'}\n` +
      `Waktu   : ${new Date().toLocaleString('id-ID')}\n` +
      `Status  : BLUETOOTH TERHUBUNG OK\n` +
      `================================\n` +
      `  Powered by Three Coffee POS   \n` +
      `================================\n\n\n`;
    await printThermalViaRawBt(testSlip, () => {
      openThermalPrinterApp();
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('PROFILE')}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.darkRoast} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>BLUETOOTH PRINTER</Text>
          <Text style={styles.headerSub}>Pengaturan perangkat cetak nirkabel</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* BT ON/OFF Card */}
        <View style={styles.card}>
          <View style={styles.btToggleRow}>
            <View style={styles.btIconWrap}>
              <MaterialCommunityIcons
                name={btEnabled ? 'bluetooth' : 'bluetooth-off'}
                size={32}
                color={btEnabled ? '#0284C7' : COLORS.muted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.btToggleTitle}>Bluetooth</Text>
              <Text style={styles.btToggleSub}>
                {btEnabled ? 'Aktif — siap mendeteksi perangkat' : 'Nonaktif'}
              </Text>
            </View>
            <Switch
              value={btEnabled}
              onValueChange={handleToggleBluetooth}
              trackColor={{ false: '#E5E7EB', true: '#BAE6FD' }}
              thumbColor={btEnabled ? '#0284C7' : '#9CA3AF'}
            />
          </View>

          {permGranted === false && (
            <View style={styles.permWarning}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#D97706" />
              <Text style={styles.permWarningText}>Izin Bluetooth belum diberikan</Text>
              <TouchableOpacity onPress={openBluetoothSettings}>
                <Text style={styles.permWarningLink}>Buka Pengaturan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Device List */}
        {btEnabled && (
          <View style={styles.card}>
            <View style={styles.deviceListHeader}>
              <Text style={styles.cardTitle}>PERANGKAT TERSEDIA</Text>
              <TouchableOpacity
                style={[styles.scanBtn, isScanning && styles.scanBtnDisabled]}
                onPress={handleScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons name="refresh" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.scanBtnText}>{isScanning ? 'Mencari...' : 'Scan'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.deviceListNote}>
              Perangkat terpasang (paired) di HP ini:
            </Text>

            {devices.map((device) => {
              const isSelected = selectedDevice === device.id;
              const isPrinter = device.type === 'printer';
              return (
                <TouchableOpacity
                  key={device.id}
                  style={[styles.deviceRow, isSelected && styles.deviceRowSelected]}
                  onPress={() => isPrinter && handleSelectDevice(device.id, device.name)}
                  activeOpacity={isPrinter ? 0.7 : 1}
                >
                  <View style={styles.deviceIcon}>
                    <MaterialCommunityIcons
                      name={isPrinter ? 'printer-pos' : 'speaker'}
                      size={22}
                      color={isSelected ? '#0284C7' : COLORS.muted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.deviceName, isSelected && styles.deviceNameSelected]}>
                      {device.name}
                    </Text>
                    <Text style={styles.deviceMeta}>
                      {isPrinter ? '🖨 Thermal Printer 58mm' : '🔊 Audio'} • RSSI {device.rssi} dBm
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#0284C7" />
                  )}
                  {!isPrinter && (
                    <Text style={styles.deviceUnavail}>Bukan printer</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.pairNewBtn} onPress={openBluetoothSettings}>
              <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#0284C7" />
              <Text style={styles.pairNewText}>Tambah / Pasangkan Perangkat Baru</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Printer Actions */}
        {btEnabled && selectedDevice && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AKSI PRINTER</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleTestPrint}>
                <MaterialCommunityIcons name="printer-pos" size={20} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Test Cetak 58mm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={openThermalPrinterApp}>
                <MaterialCommunityIcons name="open-in-app" size={20} color="#0284C7" />
                <Text style={styles.actionBtnSecText}>Buka Driver App</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Printer Template Preview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PREVIEW TEMPLATE STRUK</Text>
          <Text style={styles.previewNote}>Tampilan struk 58mm yang akan dicetak:</Text>
          <View style={styles.receiptPreview}>
            <Text style={styles.receiptText}>{'================================'}</Text>
            <Text style={styles.receiptText}>{'         THREE COFFEE          '}</Text>
            <Text style={styles.receiptText}>{'  Jl. Kopi Sejahtera No. 3    '}</Text>
            <Text style={styles.receiptText}>{'================================'}</Text>
            <Text style={styles.receiptText}>{'No. Struk : TRX-0001'}</Text>
            <Text style={styles.receiptText}>{'Kasir     : Budi'}</Text>
            <Text style={styles.receiptText}>{'Meja      : 04 (DINE IN)'}</Text>
            <Text style={styles.receiptText}>{'Waktu     : 10:30'}</Text>
            <Text style={styles.receiptText}>{'--------------------------------'}</Text>
            <Text style={styles.receiptText}>{'1x Kopi Susu Spesial'}</Text>
            <Text style={styles.receiptText}>{'   Rp 28.000'}</Text>
            <Text style={styles.receiptText}>{'1x Matcha Latte'}</Text>
            <Text style={styles.receiptText}>{'   Rp 32.000'}</Text>
            <Text style={styles.receiptText}>{'--------------------------------'}</Text>
            <Text style={styles.receiptText}>{'TOTAL    : Rp 60.000'}</Text>
            <Text style={styles.receiptText}>{'Metode   : CASH'}</Text>
            <Text style={styles.receiptText}>{'Dibayar  : Rp 100.000'}</Text>
            <Text style={styles.receiptText}>{'Kembali  : Rp 40.000'}</Text>
            <Text style={styles.receiptText}>{'================================'}</Text>
            <Text style={styles.receiptText}>{'  Terima Kasih! @threecoffee.id'}</Text>
            <Text style={styles.receiptText}>{'================================'}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvasBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
    backgroundColor: COLORS.canvasBg,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkRoast,
    letterSpacing: 0.5,
  },
  headerSub: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  scroll: { padding: 14, gap: 12, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // BT Toggle
  btToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  btIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btToggleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkRoast },
  btToggleSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  permWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
  },
  permWarningText: { flex: 1, fontSize: 11, color: '#92400E' },
  permWarningLink: { fontSize: 11, fontWeight: '700', color: '#D97706' },

  // Device list
  deviceListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  deviceListNote: { fontSize: 11, color: COLORS.muted, marginBottom: 10 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scanBtnDisabled: { backgroundColor: COLORS.muted },
  scanBtnText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 6,
    backgroundColor: '#FAFAFA',
  },
  deviceRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BAE6FD',
  },
  deviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceName: { fontSize: 13, fontWeight: '600', color: COLORS.darkRoast },
  deviceNameSelected: { color: '#0284C7', fontWeight: '700' },
  deviceMeta: { fontSize: 10, color: COLORS.muted, marginTop: 1 },
  deviceUnavail: { fontSize: 10, color: COLORS.muted, fontStyle: 'italic' },
  pairNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  pairNewText: { fontSize: 12, fontWeight: '600', color: '#0284C7' },

  // Actions
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.caramel,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnSecText: { fontSize: 12, fontWeight: '700', color: '#0284C7' },

  // Receipt preview
  previewNote: { fontSize: 11, color: COLORS.muted, marginBottom: 10 },
  receiptPreview: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
  },
  receiptText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#E5E7EB',
    lineHeight: 16,
  },
});
