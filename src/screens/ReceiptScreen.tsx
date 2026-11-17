import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { COLORS } from '../constants/theme';
import { usePosStore } from '../store/usePosStore';

export const ReceiptScreen: React.FC = () => {
  const setScreen = usePosStore((s) => s.setScreen);
  const currentOrder = usePosStore((s) => s.currentOrder);
  const completedOrders = usePosStore((s) => s.completedOrders);
  const order = currentOrder || completedOrders[0] || null;

  const [activeTab, setActiveTab] = useState<'ALL' | 'BARISTA' | 'CUSTOMER'>('ALL');
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const handlePrintBarista = () => {
    setPrintStatus('Mencetak Tiket Barista via Bluetooth (58mm)...');
    setTimeout(() => {
      setPrintStatus(null);
      Alert.alert('Printer Barista', 'Tiket Barista berhasil dicetak (ESC/POS 58mm)!');
    }, 1000);
  };

  const handlePrintCustomer = () => {
    setPrintStatus('Mencetak Struk Kasir via Bluetooth (58mm)...');
    setTimeout(() => {
      setPrintStatus(null);
      Alert.alert('Printer Kasir', 'Struk Pelanggan berhasil dicetak!');
    }, 1000);
  };

  const handleSendWa = () => {
    if (!order) return;
    const itemsText = order.items
      .map((i) => `- ${i.quantity}x ${i.product.name} (Rp ${i.subtotal.toLocaleString('id-ID')})`)
      .join('\n');

    const waMessage = `*THREE COFFEE*\nStruk Pembayaran #${order.orderNumber}\nTanggal: ${order.timestamp}\nMeja: ${order.tableNumber} (${order.orderType})\n------------------------\n${itemsText}\n------------------------\n*Total: Rp ${order.total.toLocaleString('id-ID')}*\nMetode: ${order.payment.method}\nTerima kasih telah berkunjung ke Three Coffee!`;

    Alert.alert('Bagikan Struk WhatsApp', waMessage);
  };

  const handleNewOrder = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (e) {
      // safe fallback
    }
    setScreen('POS_ORDER');
  };

  const handleBackToDashboard = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch (e) {
      // safe fallback
    }
    setScreen('DASHBOARD');
  };

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="receipt" size={64} color={COLORS.border} />
        <Text style={styles.emptyText}>Belum ada riwayat transaksi</Text>
        <TouchableOpacity style={styles.backBtn} onPress={handleBackToDashboard}>
          <Text style={styles.backBtnText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <View style={styles.badgeSuccess}>
          <MaterialCommunityIcons name="check-circle" size={18} color="#2E7D32" />
          <Text style={styles.badgeSuccessText}>
            Pembayaran Diterima ({order.orderNumber})
          </Text>
        </View>

        <TouchableOpacity style={styles.dashboardIconBtn} onPress={handleBackToDashboard}>
          <MaterialCommunityIcons name="view-dashboard-outline" size={20} color={COLORS.primary} />
          <Text style={styles.dashboardIconText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Segment Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'ALL' && styles.tabBtnTextActive]}>
            Semua (Dual View)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'BARISTA' && styles.tabBtnActive]}
          onPress={() => setActiveTab('BARISTA')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'BARISTA' && styles.tabBtnTextActive]}>
            Tiket Barista
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'CUSTOMER' && styles.tabBtnActive]}
          onPress={() => setActiveTab('CUSTOMER')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'CUSTOMER' && styles.tabBtnTextActive]}>
            Struk Pelanggan
          </Text>
        </TouchableOpacity>
      </View>

      {printStatus && (
        <View style={styles.statusToast}>
          <MaterialCommunityIcons name="printer-wireless" size={16} color={COLORS.primary} />
          <Text style={styles.statusToastText}>{printStatus}</Text>
        </View>
      )}

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsRow}>
          {/* 1. Barista Ticket (Kitchen Slip) */}
          {(activeTab === 'ALL' || activeTab === 'BARISTA') && (
            <View style={styles.receiptCard}>
              <View style={styles.cardHeaderBarista}>
                <MaterialCommunityIcons name="coffee" size={18} color="#FFFFFF" />
                <Text style={styles.cardHeaderTitle}>TIKET BARISTA (DAPUR)</Text>
              </View>

              <View style={styles.paperBody}>
                <Text style={styles.ticketShopTitle}>THREE COFFEE</Text>
                <Text style={styles.ticketShopSubtitle}>BAR ORDER SLIP (58mm)</Text>
                <View style={styles.dividerDashed} />

                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>NO ORDER:</Text>
                  <Text style={styles.metaValBold}>{order.orderNumber}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>MEJA / TIPE:</Text>
                  <Text style={styles.metaValBold}>
                    Meja {order.tableNumber} ({order.orderType})
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>WAKTU:</Text>
                  <Text style={styles.metaVal}>{order.timestamp}</Text>
                </View>

                <View style={styles.dividerDashed} />
                <Text style={styles.sectionHeading}>DETAIL ITEM & MODIFIER:</Text>

                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.baristaItemBlock}>
                    <Text style={styles.baristaItemTitle}>
                      {item.quantity}x {item.product.name}
                    </Text>
                    <View style={styles.baristaModRow}>
                      <Text style={styles.baristaModText}>
                        • Suhu: {item.modifier.temperature}
                      </Text>
                      {item.modifier.strength && (
                        <Text style={styles.baristaModText}>
                          • Espresso: {item.modifier.strength}
                        </Text>
                      )}
                      <Text style={styles.baristaModText}>
                        • Gula: {item.modifier.sweetness}
                      </Text>
                    </View>
                    {item.modifier.notes ? (
                      <Text style={styles.baristaNoteText}>
                        Catatan: "{item.modifier.notes}"
                      </Text>
                    ) : null}
                  </View>
                ))}

                <View style={styles.dividerDashed} />
                <Text style={styles.ticketFooterNote}>-- SIAPKAN SEGERA --</Text>
              </View>

              <TouchableOpacity style={styles.printActionBtn} onPress={handlePrintBarista}>
                <MaterialCommunityIcons name="printer" size={18} color="#FFFFFF" />
                <Text style={styles.printActionText}>Cetak Barista (58mm)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 2. Customer Receipt */}
          {(activeTab === 'ALL' || activeTab === 'CUSTOMER') && (
            <View style={styles.receiptCard}>
              <View style={styles.cardHeaderCustomer}>
                <MaterialCommunityIcons name="receipt" size={18} color="#FFFFFF" />
                <Text style={styles.cardHeaderTitle}>STRUK PELANGGAN</Text>
              </View>

              <View style={styles.paperBody}>
                <Text style={styles.ticketShopTitle}>THREE COFFEE</Text>
                <Text style={styles.ticketShopSubtitle}>Jl. Kopi Sejahtera No. 3</Text>
                <Text style={styles.ticketShopSubtitle}>WA: 0812-3456-7890</Text>
                <View style={styles.dividerDashed} />

                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>No. Struk:</Text>
                  <Text style={styles.metaVal}>{order.orderNumber}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Kasir / Meja:</Text>
                  <Text style={styles.metaVal}>
                    {order.cashierName} / Meja {order.tableNumber}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Waktu:</Text>
                  <Text style={styles.metaVal}>{order.timestamp}</Text>
                </View>

                <View style={styles.dividerDashed} />

                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.custReceiptItem}>
                    <View style={styles.custReceiptMain}>
                      <Text style={styles.custReceiptName}>{item.product.name}</Text>
                      <Text style={styles.custReceiptPrice}>
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </Text>
                    </View>
                    <Text style={styles.custReceiptSub}>
                      {item.quantity} x Rp {item.unitPrice.toLocaleString('id-ID')} ({item.modifier.temperature})
                    </Text>
                  </View>
                ))}

                <View style={styles.dividerDashed} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalAmount}>
                    Rp {order.total.toLocaleString('id-ID')}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Metode Bayar:</Text>
                  <Text style={styles.metaValBold}>
                    {order.payment.method === 'CASH'
                      ? 'TUNAI'
                      : order.payment.method === 'QRIS_PHYSICAL'
                      ? 'TRANSFER QRIS'
                      : `TRANSFER BANK (${order.payment.bankName || 'BCA'})`}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaKey}>Bayar / Diterima:</Text>
                  <Text style={styles.metaVal}>
                    Rp {order.payment.amountReceived.toLocaleString('id-ID')}
                  </Text>
                </View>
                {order.payment.change > 0 && (
                  <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Kembalian:</Text>
                    <Text style={styles.metaValBold}>
                      Rp {order.payment.change.toLocaleString('id-ID')}
                    </Text>
                  </View>
                )}

                <View style={styles.dividerDashed} />
                <Text style={styles.ticketFooterNote}>Terima Kasih atas Kunjungannya!</Text>
                <Text style={styles.ticketShopSubtitle}>Follow IG: @threecoffee</Text>
              </View>

              <TouchableOpacity style={styles.printActionBtn} onPress={handlePrintCustomer}>
                <MaterialCommunityIcons name="printer" size={18} color="#FFFFFF" />
                <Text style={styles.printActionText}>Cetak Struk Kasir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons: Kirim WA & Pesanan Baru */}
        <View style={styles.actionBtnRow}>
          <TouchableOpacity style={styles.waButton} onPress={handleSendWa}>
            <MaterialCommunityIcons name="whatsapp" size={20} color="#FFFFFF" />
            <Text style={styles.waButtonText}>Kirim WA Pelanggan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.newOrderButton} onPress={handleNewOrder}>
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.newOrderButtonText}>+ Pesanan Baru (Lanskap)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeSuccessText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  dashboardIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  dashboardIconText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  statusToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
  },
  statusToastText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  receiptCard: {
    width: 330,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeaderBarista: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
  },
  cardHeaderCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  paperBody: {
    padding: 16,
    backgroundColor: '#FCFAF8',
  },
  ticketShopTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    letterSpacing: 1,
  },
  ticketShopSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  dividerDashed: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1C7BD',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaKey: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  metaVal: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  metaValBold: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  baristaItemBlock: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEAE6',
  },
  baristaItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  baristaModRow: {
    marginTop: 3,
  },
  baristaModText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  baristaNoteText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#D97706',
    marginTop: 2,
  },
  ticketFooterNote: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 4,
  },
  custReceiptItem: {
    marginBottom: 8,
  },
  custReceiptMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  custReceiptName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  custReceiptPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  custReceiptSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  printActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#374151',
    paddingVertical: 12,
  },
  printActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  waButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 10,
  },
  waButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  newOrderButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
  },
  newOrderButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
