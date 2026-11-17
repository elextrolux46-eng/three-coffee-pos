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
import { usePosStore } from '../store/usePosStore';
import { COLORS } from '../constants/theme';
import { UserRole } from '../types';
import {
  openBluetoothSettings,
  openThermalPrinterApp,
  printThermalViaRawBt,
  requestBluetoothPermission,
} from '../utils/deviceIntegration';

export const ProfileScreen: React.FC = () => {
  const currentUser = usePosStore((s) => s.currentUser);
  const availableUsers = usePosStore((s) => s.availableUsers);
  const loginUser = usePosStore((s) => s.loginUser);
  const switchUser = usePosStore((s) => s.switchUser);
  const printerConnected = usePosStore((s) => s.printerConnected);
  const togglePrinterConnection = usePosStore((s) => s.togglePrinterConnection);
  const setScreen = usePosStore((s) => s.setScreen);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('OWNER');
  const [pinInput, setPinInput] = useState('');
  const [btPermissionStatus, setBtPermissionStatus] = useState<string>('Periksa');

  const isOwner = currentUser.role === 'OWNER';

  const handleOpenLogin = (role: UserRole) => {
    setSelectedRole(role);
    setPinInput('');
    setIsLoginModalOpen(true);
  };

  const handleConfirmLogin = () => {
    const res = loginUser(selectedRole, pinInput);
    if (res.success) {
      setIsLoginModalOpen(false);
      Alert.alert('Login Berhasil', `Sekarang masuk sebagai ${selectedRole}`);
    } else {
      Alert.alert('Gagal', res.message || 'PIN salah!');
    }
  };

  const handleRequestBtPermission = async () => {
    const res = await requestBluetoothPermission();
    setBtPermissionStatus(res.granted ? 'Diizinkan' : 'Ditolak');
    Alert.alert(
      res.granted ? 'Izin Bluetooth Aktif' : 'Izin Bluetooth Ditolak',
      res.message
    );
  };

  const handleTestPrint = async () => {
    const testSlip = `================================\n          THREE COFFEE          \n     TEST PRINT THERMAL 58MM    \n================================\nWaktu : ${new Date().toLocaleTimeString('id-ID')} WIB\nPrinter: Panda PRJ-58D / ESC-POS\nStatus : KONEKSI BLUETOOTH OK\n================================\n   TERIMA KASIH - THREE COFFEE  \n================================\n\n\n`;
    await printThermalViaRawBt(testSlip, () => {
      // fallback alert
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PROFIL & PENGATURAN</Text>
          <Text style={styles.headerSubtitle}>Kelola akun, hak akses role, & perangkat</Text>
        </View>

        <View style={[styles.roleBadge, isOwner ? styles.roleOwner : styles.roleKaryawan]}>
          <MaterialCommunityIcons
            name={isOwner ? 'shield-crown' : 'account'}
            size={14}
            color="#FFFFFF"
          />
          <Text style={styles.roleBadgeText}>
            {isOwner ? 'Owner' : 'Karyawan'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <MaterialCommunityIcons
              name={isOwner ? 'shield-crown-outline' : 'account-tie-outline'}
              size={36}
              color={COLORS.caramel}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.userRoleText}>
              Peran: {isOwner ? 'Pemilik Toko (Full Access)' : 'Kasir / Barista (Operasional)'}
            </Text>
            <Text style={styles.userShiftText}>Status: Shift Aktif • POS Online</Text>
          </View>
        </View>

        {/* Switch Account Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>GANTI AKUN / LOGIN ROLE</Text>
          <Text style={styles.cardDesc}>
            Pilih peran untuk menyesuaikan hak akses fitur di Three Coffee POS:
          </Text>

          <View style={styles.roleSwitchRow}>
            {/* Owner Button */}
            <TouchableOpacity
              style={[
                styles.roleSwitchBtn,
                isOwner && styles.roleSwitchBtnActive,
              ]}
              onPress={() => (isOwner ? null : handleOpenLogin('OWNER'))}
            >
              <MaterialCommunityIcons
                name="shield-crown"
                size={22}
                color={isOwner ? '#FFFFFF' : '#059669'}
              />
              <View>
                <Text style={[styles.roleSwitchTitle, isOwner && styles.roleSwitchTitleActive]}>
                  Pak Hendra (Owner)
                </Text>
                <Text style={[styles.roleSwitchSub, isOwner && styles.roleSwitchSubActive]}>
                  PIN: 1234 • Akses Penuh
                </Text>
              </View>
              {isOwner && (
                <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Karyawan Button */}
            <TouchableOpacity
              style={[
                styles.roleSwitchBtn,
                !isOwner && styles.roleSwitchBtnActive,
              ]}
              onPress={() => (!isOwner ? null : handleOpenLogin('KARYAWAN'))}
            >
              <MaterialCommunityIcons
                name="account-tie"
                size={22}
                color={!isOwner ? '#FFFFFF' : COLORS.caramel}
              />
              <View>
                <Text style={[styles.roleSwitchTitle, !isOwner && styles.roleSwitchTitleActive]}>
                  Budi (Kasir / Barista)
                </Text>
                <Text style={[styles.roleSwitchSub, !isOwner && styles.roleSwitchSubActive]}>
                  PIN: 0000 • Kasir Operasional
                </Text>
              </View>
              {!isOwner && (
                <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Hak Akses / Feature Permissions Matrix */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>MATRIKS HAK AKSES FITUR</Text>

          <View style={styles.permItem}>
            <View style={styles.permLeft}>
              <MaterialCommunityIcons name="cash-register" size={18} color={COLORS.caramel} />
              <Text style={styles.permName}>Transaksi Penjualan & Kasir POS</Text>
            </View>
            <View style={styles.badgeOpen}>
              <Text style={styles.badgeOpenText}>Terbuka Semua</Text>
            </View>
          </View>

          <View style={styles.permItem}>
            <View style={styles.permLeft}>
              <MaterialCommunityIcons name="printer" size={18} color={COLORS.caramel} />
              <Text style={styles.permName}>Cetak Struk & Kitchen Slip Barista</Text>
            </View>
            <View style={styles.badgeOpen}>
              <Text style={styles.badgeOpenText}>Terbuka Semua</Text>
            </View>
          </View>

          <View style={styles.permItem}>
            <View style={styles.permLeft}>
              <MaterialCommunityIcons name="clipboard-check" size={18} color={COLORS.caramel} />
              <Text style={styles.permName}>Rekap Kas Kecil & Tutup Shift</Text>
            </View>
            <View style={styles.badgeOpen}>
              <Text style={styles.badgeOpenText}>Terbuka Semua</Text>
            </View>
          </View>

          <View style={styles.permItem}>
            <View style={styles.permLeft}>
              <MaterialCommunityIcons name="currency-usd" size={18} color={COLORS.caramel} />
              <Text style={styles.permName}>Ubah Harga Menu di Custom Menu</Text>
            </View>
            <View style={isOwner ? styles.badgeOpen : styles.badgeLock}>
              <Text style={isOwner ? styles.badgeOpenText : styles.badgeLockText}>
                {isOwner ? 'Terbuka' : 'Khusus Owner'}
              </Text>
            </View>
          </View>

          <View style={[styles.permItem, { borderBottomWidth: 0 }]}>
            <View style={styles.permLeft}>
              <MaterialCommunityIcons name="plus-box-multiple" size={18} color={COLORS.caramel} />
              <Text style={styles.permName}>Tambah / Hapus Menu Produk</Text>
            </View>
            <View style={isOwner ? styles.badgeOpen : styles.badgeLock}>
              <Text style={isOwner ? styles.badgeOpenText : styles.badgeLockText}>
                {isOwner ? 'Terbuka' : 'Khusus Owner'}
              </Text>
            </View>
          </View>
        </View>

        {/* Bluetooth Thermal Printer Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>PRINTER BLUETOOTH THERMAL</Text>
              <Text style={styles.printerDeviceName}>
                Panda PRJ-58D / RPP02N (58mm ESC/POS)
              </Text>
            </View>
            <View
              style={[
                styles.printerStatusPill,
                printerConnected ? styles.pillConnected : styles.pillDisconnected,
              ]}
            >
              <View
                style={[
                  styles.dotStatus,
                  { backgroundColor: printerConnected ? '#10B981' : '#EF4444' },
                ]}
              />
              <Text style={styles.printerStatusText}>
                {printerConnected ? 'Terhubung' : 'Terputus'}
              </Text>
            </View>
          </View>

          {/* Quick Access to Bluetooth & Thermal App */}
          <View style={styles.quickDeviceRow}>
            {/* Request Permission Button */}
            <TouchableOpacity
              style={styles.btnPerm}
              onPress={handleRequestBtPermission}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="shield-check-outline" size={16} color={COLORS.darkRoast} />
              <View style={{ flex: 1 }}>
                <Text style={styles.btnPermTitle}>Izin Bluetooth</Text>
                <Text style={styles.btnPermSub}>Status: {btPermissionStatus}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.muted} />
            </TouchableOpacity>

            {/* Direct Open Bluetooth Settings Android */}
            <TouchableOpacity
              style={styles.btnDeviceAction}
              onPress={openBluetoothSettings}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bluetooth-settings" size={18} color="#0284C7" />
              <View style={{ flex: 1 }}>
                <Text style={styles.btnDeviceTitle}>Pengaturan Bluetooth HP</Text>
                <Text style={styles.btnDeviceSub}>Pairing / Hubungkan perangkat printer</Text>
              </View>
              <MaterialCommunityIcons name="arrow-top-right-thin-circle-outline" size={18} color="#0284C7" />
            </TouchableOpacity>

            {/* Direct Open Thermal Bluetooth App (RawBT) */}
            <TouchableOpacity
              style={styles.btnThermalApp}
              onPress={openThermalPrinterApp}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="printer-pos-star" size={18} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.btnThermalTitle}>Buka Aplikasi Thermal Printer</Text>
                <Text style={styles.btnThermalSub}>Driver RawBT / ESC-POS 58mm Service</Text>
              </View>
              <MaterialCommunityIcons name="arrow-top-right-thin-circle-outline" size={18} color="#D97706" />
            </TouchableOpacity>
          </View>

          {/* Printer Control Row */}
          <View style={styles.printerBtnRow}>
            <TouchableOpacity
              style={styles.btnTogglePrinter}
              onPress={togglePrinterConnection}
            >
              <MaterialCommunityIcons
                name={printerConnected ? 'bluetooth-off' : 'bluetooth-connect'}
                size={16}
                color={printerConnected ? '#DC2626' : COLORS.caramel}
              />
              <Text
                style={[
                  styles.btnTogglePrinterText,
                  { color: printerConnected ? '#DC2626' : COLORS.caramel },
                ]}
              >
                {printerConnected ? 'Putuskan' : 'Sambungkan'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnTestPrint} onPress={handleTestPrint}>
              <MaterialCommunityIcons name="printer-pos" size={16} color="#FFFFFF" />
              <Text style={styles.btnTestPrintText}>Test Cetak 58mm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shortcut to Shift Report */}
        <TouchableOpacity
          style={styles.shiftReportShortcut}
          onPress={() => setScreen('SHIFT_REPORT')}
        >
          <MaterialCommunityIcons name="file-chart-outline" size={20} color="#FFFFFF" />
          <Text style={styles.shiftReportShortcutText}>Buka Rekapitulasi Kas & Tutup Shift</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Shop Information Card */}
        <View style={styles.shopCard}>
          <Text style={styles.shopName}>THREE COFFEE</Text>
          <Text style={styles.shopAddress}>Jl. Senja Kopi No. 3, Bandung, Jawa Barat</Text>
          <Text style={styles.shopContact}>Telp: 0812-3456-7890 • IG: @threecoffee.id</Text>
          <View style={styles.shopDivider} />
          <Text style={styles.shopBankTitle}>Rekening Resmi Toko (Non-EDC):</Text>
          <Text style={styles.shopBankItem}>• BCA: 8735-0912-34 a.n. Three Coffee</Text>
          <Text style={styles.shopBankItem}>• Mandiri: 137-00-1928374-5 a.n. Three Coffee</Text>
          <Text style={styles.shopBankItem}>• BRI: 0123-01-000456-53-1 a.n. Three Coffee</Text>
        </View>
      </ScrollView>

      {/* Modal Input PIN Login */}
      <Modal visible={isLoginModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 320 }]}>
            <View style={styles.pinHeader}>
              <MaterialCommunityIcons
                name={selectedRole === 'OWNER' ? 'shield-crown' : 'account-key'}
                size={38}
                color={selectedRole === 'OWNER' ? '#059669' : COLORS.caramel}
              />
              <Text style={styles.pinTitle}>
                Login {selectedRole === 'OWNER' ? 'Owner' : 'Karyawan'}
              </Text>
              <Text style={styles.pinSub}>
                Masukkan PIN otorisasi untuk beralih peran
              </Text>
              <Text style={styles.pinDefaultNote}>
                (PIN Default: {selectedRole === 'OWNER' ? '1234' : '0000'})
              </Text>
            </View>

            <TextInput
              style={styles.pinInput}
              placeholder="••••"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              value={pinInput}
              onChangeText={setPinInput}
              autoFocus
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnModalCancel}
                onPress={() => setIsLoginModalOpen(false)}
              >
                <Text style={styles.btnModalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnModalSave} onPress={handleConfirmLogin}>
                <Text style={styles.btnModalSaveText}>Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.cream,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  roleOwner: {
    backgroundColor: '#059669',
  },
  roleKaryawan: {
    backgroundColor: COLORS.caramel,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  userRoleText: {
    fontSize: 12,
    color: COLORS.caramel,
    fontWeight: '700',
    marginTop: 2,
  },
  userShiftText: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.darkRoast,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 12,
  },
  roleSwitchRow: {
    gap: 10,
  },
  roleSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  roleSwitchBtnActive: {
    backgroundColor: COLORS.darkRoast,
    borderColor: COLORS.darkRoast,
  },
  roleSwitchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  roleSwitchTitleActive: {
    color: '#FFFFFF',
  },
  roleSwitchSub: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  roleSwitchSubActive: {
    color: COLORS.cream,
  },
  permItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  permLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  permName: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
  },
  badgeOpen: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeOpenText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  badgeLock: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeLockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991B1B',
  },
  printerStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillConnected: {
    backgroundColor: '#ECFDF5',
  },
  pillDisconnected: {
    backgroundColor: '#FEF2F2',
  },
  dotStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  printerStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },
  printerDeviceName: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 12,
  },
  printerBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  quickDeviceRow: {
    gap: 8,
    marginVertical: 10,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  btnPerm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnPermTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkRoast,
  },
  btnPermSub: {
    fontSize: 10,
    color: COLORS.muted,
  },
  btnDeviceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnDeviceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  btnDeviceSub: {
    fontSize: 10,
    color: '#0284C7',
  },
  btnThermalApp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnThermalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  btnThermalSub: {
    fontSize: 10,
    color: '#D97706',
  },
  btnTogglePrinter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.cream,
  },
  btnTogglePrinterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  btnTestPrint: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.caramel,
  },
  btnTestPrintText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shiftReportShortcut: {
    backgroundColor: COLORS.darkRoast,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shiftReportShortcutText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkRoast,
    letterSpacing: 1,
  },
  shopAddress: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
  },
  shopContact: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  shopDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  shopBankTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  shopBankItem: {
    fontSize: 10,
    color: COLORS.muted,
    marginVertical: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  pinHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pinTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkRoast,
    marginTop: 8,
  },
  pinSub: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  pinDefaultNote: {
    fontSize: 10,
    color: COLORS.caramel,
    fontWeight: '700',
    marginTop: 2,
  },
  pinInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.caramel,
    borderRadius: 12,
    height: 48,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: 16,
    color: COLORS.darkRoast,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnModalCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  btnModalCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },
  btnModalSave: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.caramel,
    alignItems: 'center',
  },
  btnModalSaveText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
