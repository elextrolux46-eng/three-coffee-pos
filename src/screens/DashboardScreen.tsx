import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { COLORS } from '../constants/theme';
import { THREE_COFFEE_PRODUCTS } from '../data/mockData';
import { usePosStore } from '../store/usePosStore';

export const DashboardScreen: React.FC = () => {
  const setScreen = usePosStore((s) => s.setScreen);
  const currentShift = usePosStore((s) => s.currentShift);
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

  const totalOmset =
    currentShift.cashSales + currentShift.qrisSales + currentShift.bankTransferSales;

  // Handle auto-rotate to landscape when "Mulai Menjual" is pressed
  const handleStartSelling = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (e) {
      // Fallback if simulator/orientation lock not supported on web
    }
    setScreen('POS_ORDER');
  };

  const getChartData = () => {
    switch (activeTab) {
      case 'DAILY':
        return {
          data: [
            { label: '08:00', height: 40, count: '14' },
            { label: '10:00', height: 75, count: '28' },
            { label: '12:00', height: 110, count: '45' },
            { label: '14:00', height: 140, count: '62', highlight: true },
            { label: '16:00', height: 95, count: '38' },
            { label: '18:00', height: 60, count: '22' },
          ],
          peak: 'Peak Hours: 14.00 - 16.00 (Kopsu Aren & Butterscotch Latte)',
        };
      case 'WEEKLY':
        return {
          data: [
            { label: 'Sen', height: 70, count: '145' },
            { label: 'Sel', height: 85, count: '180' },
            { label: 'Rab', height: 80, count: '165' },
            { label: 'Kam', height: 95, count: '190' },
            { label: 'Jum', height: 115, count: '210' },
            { label: 'Sab', height: 145, count: '280', highlight: true },
            { label: 'Min', height: 135, count: '260' },
          ],
          peak: 'Hari Teramai: Sabtu (280 Cup Terjual — Omset Rp 3.1 jt)',
        };
      case 'MONTHLY':
        return {
          data: [
            { label: 'Mgg 1', height: 85, count: '850' },
            { label: 'Mgg 2', height: 105, count: '920' },
            { label: 'Mgg 3', height: 140, count: '1.1k', highlight: true },
            { label: 'Mgg 4', height: 110, count: '980' },
          ],
          peak: 'Minggu Puncak: Mgg ke-3 (1.100 Cup — Total Rp 12.4 jt)',
        };
    }
  };

  const currentChart = getChartData();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>THREE COFFEE</Text>
          <Text style={styles.brandSubtitle}>POS Management & Overview</Text>
        </View>

        <TouchableOpacity
          style={styles.shiftBadge}
          onPress={() => setScreen('SHIFT_REPORT')}
        >
          <MaterialCommunityIcons name="clipboard-text-clock" size={16} color={COLORS.cream} />
          <Text style={styles.shiftBadgeText}>Shift: {currentShift.cashierName}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 3 KPI Cards */}
        <View style={styles.kpiRow}>
          {/* KPI 1 */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <MaterialCommunityIcons name="coffee" size={18} color={COLORS.caramel} />
              <Text style={styles.kpiLabel}>JML PRODUK</Text>
            </View>
            <Text style={styles.kpiValue}>{THREE_COFFEE_PRODUCTS.length} Menu</Text>
            <Text style={styles.kpiSub}>2 Kategori Aktif</Text>
          </View>

          {/* KPI 2 */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <MaterialCommunityIcons name="receipt" size={18} color={COLORS.success} />
              <Text style={styles.kpiLabel}>TRANSAKSI</Text>
            </View>
            <Text style={styles.kpiValue}>{currentShift.totalTransactions} TRX</Text>
            <Text style={[styles.kpiSub, { color: COLORS.success }]}>
              Rp {(totalOmset / 1000).toLocaleString('id-ID')}k
            </Text>
          </View>

          {/* KPI 3 */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiIconWrap}>
              <MaterialCommunityIcons name="cup-water" size={18} color={COLORS.blue} />
              <Text style={styles.kpiLabel}>TERJUAL</Text>
            </View>
            <Text style={styles.kpiValue}>{currentShift.totalItemsSold} Cup</Text>
            <Text style={styles.kpiSub}>+18% vs kemarin</Text>
          </View>
        </View>

        {/* Sales Trend Chart Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>TREN PENJUALAN</Text>
              <Text style={styles.cardSubtitle}>
                {activeTab === 'DAILY'
                  ? 'Aktivitas transaksi per jam hari ini'
                  : activeTab === 'WEEKLY'
                  ? 'Tren omset harian minggu ini'
                  : 'Pertumbuhan penjualan bulanan'}
              </Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'DAILY' && styles.tabBtnActive]}
                onPress={() => setActiveTab('DAILY')}
              >
                <Text style={[styles.tabText, activeTab === 'DAILY' && styles.tabTextActive]}>
                  Harian
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'WEEKLY' && styles.tabBtnActive]}
                onPress={() => setActiveTab('WEEKLY')}
              >
                <Text style={[styles.tabText, activeTab === 'WEEKLY' && styles.tabTextActive]}>
                  Minggu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'MONTHLY' && styles.tabBtnActive]}
                onPress={() => setActiveTab('MONTHLY')}
              >
                <Text style={[styles.tabText, activeTab === 'MONTHLY' && styles.tabTextActive]}>
                  Bulan
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bar Chart Visual */}
          <View style={styles.chartArea}>
            {currentChart.data.map((bar, idx) => (
              <View key={idx} style={styles.barCol}>
                <Text style={styles.barValueText}>{bar.count}</Text>
                <View
                  style={[
                    styles.barPill,
                    { height: bar.height },
                    bar.highlight ? styles.barHighlight : styles.barNormal,
                  ]}
                />
                <Text style={styles.barLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.peakBadge}>
            <MaterialCommunityIcons name="clock-fast" size={14} color={COLORS.caramel} />
            <Text style={styles.peakText}>{currentChart.peak}</Text>
          </View>
        </View>

        {/* Top 3 Menu Leaderboard */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TOP 3 MENU TERLARIS SHIFT INI</Text>

          <View style={styles.leaderboardItem}>
            <View style={styles.leaderboardLeft}>
              <View style={[styles.rankBadge, { backgroundColor: '#FFD700' }]}>
                <Text style={styles.rankNum}>1</Text>
              </View>
              <View>
                <Text style={styles.leaderName}>Kopsu Aren</Text>
                <Text style={styles.leaderCat}>Best Coffee • Rp 10.000</Text>
              </View>
            </View>
            <View style={styles.leaderboardRight}>
              <Text style={styles.leaderSold}>78 Cup</Text>
              <Text style={styles.leaderPrice}>Rp 780.000</Text>
            </View>
          </View>

          <View style={styles.leaderboardItem}>
            <View style={styles.leaderboardLeft}>
              <View style={[styles.rankBadge, { backgroundColor: '#C0C0C0' }]}>
                <Text style={styles.rankNum}>2</Text>
              </View>
              <View>
                <Text style={styles.leaderName}>Butterscotch Latte</Text>
                <Text style={styles.leaderCat}>Best Coffee • Rp 12.000</Text>
              </View>
            </View>
            <View style={styles.leaderboardRight}>
              <Text style={styles.leaderSold}>54 Cup</Text>
              <Text style={styles.leaderPrice}>Rp 648.000</Text>
            </View>
          </View>

          <View style={[styles.leaderboardItem, { borderBottomWidth: 0 }]}>
            <View style={styles.leaderboardLeft}>
              <View style={[styles.rankBadge, { backgroundColor: '#CD7F32' }]}>
                <Text style={styles.rankNum}>3</Text>
              </View>
              <View>
                <Text style={styles.leaderName}>Lemon Tea</Text>
                <Text style={styles.leaderCat}>Non Coffee • Rp 5.000</Text>
              </View>
            </View>
            <View style={styles.leaderboardRight}>
              <Text style={styles.leaderSold}>42 Cup</Text>
              <Text style={styles.leaderPrice}>Rp 210.000</Text>
            </View>
          </View>
        </View>

        {/* Non-Cash Transfer Overview */}
        <View style={styles.nonCashCard}>
          <Text style={styles.nonCashTitle}>METODE TRANSAKSI NON-TUNAI (NON-EDC)</Text>

          <View style={styles.nonCashRow}>
            <View style={styles.nonCashCol}>
              <Text style={styles.nonCashMethod}>Transfer QRIS Fisik Toko</Text>
              <Text style={styles.nonCashSub}>GoPay, DANA, OVO, ShopeePay, m-Banking</Text>
            </View>
            <Text style={styles.nonCashVal}>
              Rp {currentShift.qrisSales.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={[styles.nonCashRow, { borderBottomWidth: 0 }]}>
            <View style={styles.nonCashCol}>
              <Text style={styles.nonCashMethod}>Transfer Bank Manual</Text>
              <Text style={styles.nonCashSub}>BCA, Mandiri, BRI Manual M-Banking</Text>
            </View>
            <Text style={styles.nonCashVal}>
              Rp {currentShift.bankTransferSales.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startSellBtn}
          onPress={handleStartSelling}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="storefront-outline" size={22} color={COLORS.white} />
          <Text style={styles.startSellText}>MULAI MENJUAL (MODE LANSKAP POS)</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.white} />
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
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 11,
    color: COLORS.cream,
    marginTop: 2,
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.darkRoastLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A332A',
  },
  shiftBadgeText: {
    fontSize: 11,
    color: COLORS.cream,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.muted,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  kpiSub: {
    fontSize: 10,
    color: COLORS.caramel,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.darkRoast,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    padding: 2,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  tabBtnActive: {
    backgroundColor: COLORS.darkRoast,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  barCol: {
    alignItems: 'center',
    gap: 6,
  },
  barValueText: {
    fontSize: 9,
    color: COLORS.muted,
    fontWeight: '600',
  },
  barPill: {
    width: 28,
    borderRadius: 6,
  },
  barNormal: {
    backgroundColor: COLORS.cream,
  },
  barHighlight: {
    backgroundColor: COLORS.caramel,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '600',
  },
  peakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.caramelLight,
    padding: 10,
    borderRadius: 10,
  },
  peakText: {
    fontSize: 11,
    color: COLORS.caramel,
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  leaderName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  leaderCat: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  leaderPrice: {
    fontSize: 11,
    color: COLORS.muted,
  },
  leaderSold: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.caramel,
  },
  nonCashCard: {
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  nonCashTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.darkRoast,
    marginBottom: 12,
  },
  nonCashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D8D0',
  },
  nonCashCol: {
    gap: 2,
  },
  nonCashMethod: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  nonCashSub: {
    fontSize: 10,
    color: COLORS.muted,
  },
  nonCashVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  startSellBtn: {
    backgroundColor: COLORS.caramel,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: COLORS.caramel,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  startSellText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
