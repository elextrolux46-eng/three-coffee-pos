import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { usePosStore } from '../store/usePosStore';

export const QrisModal: React.FC = () => {
  const isVisible = usePosStore((s) => s.isQrisModalVisible);
  const setVisible = usePosStore((s) => s.setQrisModalVisible);
  const cart = usePosStore((s) => s.cart);
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.shopName}>THREE COFFEE</Text>
              <Text style={styles.qrisNMID}>NMID: ID1020038291024</Text>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.darkRoast} />
            </TouchableOpacity>
          </View>

          {/* QR Code Container Simulation */}
          <View style={styles.qrFrame}>
            <View style={styles.qrHeaderTag}>
              <Text style={styles.qrTagText}>QRIS STANDAR PEMBAYARAN NASIONAL</Text>
            </View>
            <View style={styles.qrCenterBox}>
              <MaterialCommunityIcons name="qrcode-scan" size={180} color={COLORS.darkRoast} />
            </View>
            <Text style={styles.merchantName}>THREE COFFEE KASIR RESMI</Text>
            <Text style={styles.walletSupport}>
              GoPay • DANA • OVO • ShopeePay • BCA QR • Livin • BRImo
            </Text>
          </View>

          {/* Amount Box */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Total Tagihan:</Text>
            <Text style={styles.amountValue}>Rp {total.toLocaleString('id-ID')}</Text>
          </View>

          <Text style={styles.instruction}>
            Arahkan layar ini ke pelanggan atau minta pelanggan scan akrilik QRIS di meja kasir.
          </Text>

          <TouchableOpacity style={styles.doneBtn} onPress={() => setVisible(false)}>
            <Text style={styles.doneBtnText}>Tutup Tampilan QRIS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkRoast,
    letterSpacing: 0.5,
  },
  qrisNMID: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  qrFrame: {
    width: '100%',
    backgroundColor: '#FBFBFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'center',
  },
  qrHeaderTag: {
    backgroundColor: COLORS.darkRoast,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  qrTagText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  qrCenterBox: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  merchantName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
  },
  walletSupport: {
    fontSize: 9,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.cream,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  amountLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 18,
    color: COLORS.darkRoast,
    fontWeight: '800',
  },
  instruction: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: COLORS.caramel,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
