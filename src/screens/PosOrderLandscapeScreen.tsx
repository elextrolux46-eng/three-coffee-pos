import React from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { COLORS } from '../constants/theme';
import { THREE_COFFEE_PRODUCTS } from '../data/mockData';
import { usePosStore } from '../store/usePosStore';
import { CartItem, Product } from '../types';

export const PosOrderLandscapeScreen: React.FC = () => {
  const setScreen = usePosStore((s) => s.setScreen);
  const products = usePosStore((s) => s.products);
  const selectedCategory = usePosStore((s) => s.selectedCategory);
  const setSelectedCategory = usePosStore((s) => s.setSelectedCategory);
  const searchQuery = usePosStore((s) => s.searchQuery);
  const setSearchQuery = usePosStore((s) => s.setSearchQuery);
  const tableNumber = usePosStore((s) => s.tableNumber);
  const setTableNumber = usePosStore((s) => s.setTableNumber);
  const orderType = usePosStore((s) => s.orderType);
  const setOrderType = usePosStore((s) => s.setOrderType);
  const isTableModalVisible = usePosStore((s) => s.isTableModalVisible);
  const setTableModalVisible = usePosStore((s) => s.setTableModalVisible);

  const cart = usePosStore((s) => s.cart);
  const updateQuantity = usePosStore((s) => s.updateQuantity);
  const openCustomizer = usePosStore((s) => s.openCustomizer);
  const openCustomizerForEdit = usePosStore((s) => s.openCustomizerForEdit);
  const addToCart = usePosStore((s) => s.addToCart);
  const clearCart = usePosStore((s) => s.clearCart);

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Return to portrait dashboard
  const handleBackToDashboard = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch (e) {}
    setScreen('DASHBOARD');
  };

  // Filter products
  const filteredProducts = products.filter((item) => {
    const matchesCat =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleQuickAdd = (product: Product) => {
    addToCart(
      product,
      { temperature: 'ICED', sweetness: '100%' },
      product.price
    );
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    Alert.alert(
      'Kosongkan Keranjang',
      'Yakin ingin menghapus semua pesanan saat ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Kosongkan', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const TABLE_OPTIONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'VIP', 'BAR'];

  return (
    <View style={styles.container}>
      {/* LEFT PANEL: CATALOG & SEARCH (62%) */}
      <View style={styles.leftPanel}>
        {/* Top Header */}
        <View style={styles.catalogHeader}>
          <TouchableOpacity onPress={handleBackToDashboard} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <View>
            <Text style={styles.shopTitle}>THREE COFFEE</Text>
            <Text style={styles.shopSub}>Terminal Kasir POS</Text>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={18} color={COLORS.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari kopi / non-coffee..."
              placeholderTextColor={COLORS.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={16} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Table / Order Type Toggle */}
          <View style={styles.tableSelector}>
            <TouchableOpacity
              style={[styles.typePill, orderType === 'DINE_IN' && styles.typePillActive]}
              onPress={() => {
                setOrderType('DINE_IN');
                setTableModalVisible(true);
              }}
            >
              <MaterialCommunityIcons
                name="table-chair"
                size={14}
                color={orderType === 'DINE_IN' ? COLORS.white : COLORS.cream}
              />
              <Text
                style={[
                  styles.typePillText,
                  orderType === 'DINE_IN' && styles.typePillTextActive,
                ]}
              >
                Meja #{tableNumber}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typePill, orderType === 'TAKE_AWAY' && styles.typePillActive]}
              onPress={() => setOrderType('TAKE_AWAY')}
            >
              <MaterialCommunityIcons
                name="shopping"
                size={14}
                color={orderType === 'TAKE_AWAY' ? COLORS.white : COLORS.cream}
              />
              <Text
                style={[
                  styles.typePillText,
                  orderType === 'TAKE_AWAY' && styles.typePillTextActive,
                ]}
              >
                Take Away
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Bar */}
        <View style={styles.categoriesBar}>
          <TouchableOpacity
            style={[styles.catBtn, selectedCategory === 'ALL' && styles.catBtnActive]}
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text
              style={[
                styles.catBtnText,
                selectedCategory === 'ALL' && styles.catBtnTextActive,
              ]}
            >
              Semua ({products.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.catBtn,
              selectedCategory === 'BEST_COFFEE' && styles.catBtnActive,
            ]}
            onPress={() => setSelectedCategory('BEST_COFFEE')}
          >
            <Text
              style={[
                styles.catBtnText,
                selectedCategory === 'BEST_COFFEE' && styles.catBtnTextActive,
              ]}
            >
              Best Coffee ({products.filter((p) => p.category === 'BEST_COFFEE').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.catBtn,
              selectedCategory === 'NON_COFFEE' && styles.catBtnActive,
            ]}
            onPress={() => setSelectedCategory('NON_COFFEE')}
          >
            <Text
              style={[
                styles.catBtnText,
                selectedCategory === 'NON_COFFEE' && styles.catBtnTextActive,
              ]}
            >
              Non Coffee ({products.filter((p) => p.category === 'NON_COFFEE').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Product Grid 3 Columns */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isAvailable = item.isAvailable !== false;
            return (
              <View style={[styles.productCard, !isAvailable && { opacity: 0.6 }]}>
                <View style={styles.cardTopRow}>
                  <View style={styles.skuBadge}>
                    <Text style={styles.skuText}>{item.sku}</Text>
                  </View>
                  {!isAvailable ? (
                    <View style={[styles.tagBadge, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.tagText, { color: '#DC2626' }]}>Habis</Text>
                    </View>
                  ) : item.tag ? (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (!isAvailable) {
                      Alert.alert('Stok Habis', `Menu "${item.name}" sedang tidak tersedia`);
                      return;
                    }
                    openCustomizer(item);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.productDesc} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={styles.productPrice}>
                    Rp{' '}
                    {item.hasStrengthOption
                      ? `${item.price / 1000}k / ${item.strongPrice! / 1000}k`
                      : item.price.toLocaleString('id-ID')}
                  </Text>
                </TouchableOpacity>

                {/* Action Buttons: Kustom & Quick Add */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={[styles.customBtn, !isAvailable && { backgroundColor: '#F3F4F6' }]}
                    onPress={() => {
                      if (!isAvailable) {
                        Alert.alert('Stok Habis', `Menu "${item.name}" sedang tidak tersedia`);
                        return;
                      }
                      openCustomizer(item);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="tune-variant"
                      size={13}
                      color={isAvailable ? COLORS.caramel : COLORS.muted}
                    />
                    <Text
                      style={[
                        styles.customBtnText,
                        !isAvailable && { color: COLORS.muted },
                      ]}
                    >
                      Kustom
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.addBtn, !isAvailable && { backgroundColor: '#E5E7EB' }]}
                    onPress={() => {
                      if (!isAvailable) {
                        Alert.alert('Stok Habis', `Menu "${item.name}" sedang tidak tersedia`);
                        return;
                      }
                      handleQuickAdd(item);
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>

      {/* RIGHT PANEL: ORDER CART (38%) */}
      <View style={styles.rightPanel}>
        {/* Cart Header */}
        <View style={styles.cartHeader}>
          <View>
            <Text style={styles.cartHeaderTitle}>PESANAN AKTIF</Text>
            <Text style={styles.cartHeaderSub}>
              {cart.reduce((s, i) => s + i.quantity, 0)} Item dipilih
            </Text>
          </View>

          <View style={styles.cartHeaderActions}>
            {cart.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtnMini}
                onPress={handleClearCart}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
                <Text style={styles.clearBtnMiniText}>Reset</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.shiftBtnMini}
              onPress={() => setScreen('SHIFT_REPORT')}
            >
              <MaterialCommunityIcons name="cash-register" size={16} color={COLORS.cream} />
              <Text style={styles.shiftBtnMiniText}>Kas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cart Items List */}
        <ScrollView style={styles.cartItemsScroll} showsVerticalScrollIndicator={false}>
          {cart.length === 0 ? (
            <View style={styles.emptyCartBox}>
              <MaterialCommunityIcons name="coffee-outline" size={48} color={COLORS.muted} />
              <Text style={styles.emptyCartText}>Belum ada item dipilih</Text>
              <Text style={styles.emptyCartSub}>Ketuk menu di kiri untuk menambah atau kustom</Text>
            </View>
          ) : (
            cart.map((item) => (
              <View key={item.cartItemId} style={styles.cartItemRow}>
                <View style={styles.cartItemInfo}>
                  <View style={styles.cartItemTitleRow}>
                    <Text style={styles.cartItemName}>{item.product.name}</Text>
                    <TouchableOpacity
                      style={styles.editModPill}
                      onPress={() => openCustomizerForEdit(item)}
                    >
                      <MaterialCommunityIcons name="pencil" size={11} color={COLORS.caramel} />
                      <Text style={styles.editModText}>Ubah</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cartItemMod}>
                    {item.modifier.temperature === 'ICED' ? 'Dingin (Iced)' : 'Panas (Hot)'}
                    {item.modifier.strength ? ` • ${item.modifier.strength}` : ''}
                    {` • Gula ${item.modifier.sweetness}`}
                  </Text>
                  {item.modifier.notes ? (
                    <Text style={styles.cartItemNotes}>
                      Catatan: "{item.modifier.notes}"
                    </Text>
                  ) : null}

                  <Text style={styles.cartItemUnitPrice}>
                    Rp {item.unitPrice.toLocaleString('id-ID')}
                  </Text>
                </View>

                {/* Qty Stepper */}
                <View style={styles.stepperWrap}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => updateQuantity(item.cartItemId, -1)}
                  >
                    <MaterialCommunityIcons name="minus" size={14} color={COLORS.text} />
                  </TouchableOpacity>

                  <Text style={styles.stepQty}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={[styles.stepBtn, styles.stepBtnPlus]}
                    onPress={() => updateQuantity(item.cartItemId, 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Cart Summary & Pay CTA */}
        <View style={styles.cartFooter}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} item)</Text>
            <Text style={styles.summaryVal}>Rp {subtotal.toLocaleString('id-ID')}</Text>
          </View>

          <View style={styles.grandTotalBox}>
            <Text style={styles.grandTotalLabel}>TOTAL BAYAR</Text>
            <Text style={styles.grandTotalVal}>Rp {subtotal.toLocaleString('id-ID')}</Text>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            style={[styles.checkoutBtn, cart.length === 0 && styles.checkoutBtnDisabled]}
            disabled={cart.length === 0}
            onPress={() => setScreen('PAYMENT')}
          >
            <Text style={styles.checkoutBtnText}>
              BAYAR (Rp {subtotal.toLocaleString('id-ID')})
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Picker Modal */}
      <Modal visible={isTableModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.tableModalCard}>
            <View style={styles.tableModalHeader}>
              <Text style={styles.tableModalTitle}>Pilih Nomor Meja Pelanggan</Text>
              <TouchableOpacity onPress={() => setTableModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={COLORS.darkRoast} />
              </TouchableOpacity>
            </View>
            <View style={styles.tableGrid}>
              {TABLE_OPTIONS.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.tableGridBtn,
                    tableNumber === num && styles.tableGridBtnActive,
                  ]}
                  onPress={() => setTableNumber(num)}
                >
                  <Text
                    style={[
                      styles.tableGridText,
                      tableNumber === num && styles.tableGridTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
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
    flexDirection: 'row',
    backgroundColor: COLORS.canvasBg,
  },
  leftPanel: {
    flex: 62,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  catalogHeader: {
    backgroundColor: COLORS.darkRoast,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.darkRoastLight,
  },
  shopTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  shopSub: {
    fontSize: 10,
    color: COLORS.cream,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    height: '100%',
  },
  tableSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.darkRoastLight,
    padding: 3,
    borderRadius: 10,
    gap: 4,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  typePillActive: {
    backgroundColor: COLORS.caramel,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cream,
  },
  typePillTextActive: {
    color: COLORS.white,
  },
  categoriesBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.canvasBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catBtnActive: {
    backgroundColor: COLORS.darkRoast,
    borderColor: COLORS.darkRoast,
  },
  catBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },
  catBtnTextActive: {
    color: COLORS.white,
  },
  gridContent: {
    padding: 10,
    gap: 10,
  },
  productCard: {
    flex: 1 / 3,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    margin: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  skuBadge: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skuText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  tagBadge: {
    backgroundColor: COLORS.caramelLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.caramel,
  },
  productName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 10,
    color: COLORS.muted,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.caramel,
    marginBottom: 8,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  customBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.caramelLight,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 3,
  },
  customBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.caramel,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.darkRoast,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightPanel: {
    flex: 38,
    backgroundColor: COLORS.white,
    display: 'flex',
    flexDirection: 'column',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FAFAFA',
  },
  cartHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  cartHeaderSub: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 1,
  },
  cartHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearBtnMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  clearBtnMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  shiftBtnMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.darkRoast,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  shiftBtnMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  cartItemsScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyCartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyCartSub: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  cartItemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  cartItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  editModPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.caramelLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  editModText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.caramel,
  },
  cartItemMod: {
    fontSize: 10,
    color: COLORS.caramel,
    fontWeight: '600',
    marginTop: 2,
  },
  cartItemNotes: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#D97706',
    marginTop: 1,
  },
  cartItemUnitPrice: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.canvasBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepBtnPlus: {
    backgroundColor: COLORS.darkRoast,
    borderColor: COLORS.darkRoast,
  },
  stepQty: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    minWidth: 16,
    textAlign: 'center',
  },
  cartFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FAFAFA',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.muted,
  },
  summaryVal: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  grandTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  grandTotalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.caramel,
  },
  checkoutBtn: {
    backgroundColor: COLORS.caramel,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  checkoutBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  checkoutBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tableModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: 280,
  },
  tableModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tableModalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tableGridBtn: {
    width: 56,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.canvasBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableGridBtnActive: {
    backgroundColor: COLORS.caramel,
    borderColor: COLORS.caramel,
  },
  tableGridText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  tableGridTextActive: {
    color: COLORS.white,
  },
});
