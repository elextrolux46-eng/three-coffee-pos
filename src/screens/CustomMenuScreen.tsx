import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePosStore } from '../store/usePosStore';
import { COLORS } from '../constants/theme';
import { Product } from '../types';

export const CustomMenuScreen: React.FC = () => {
  const products = usePosStore((s) => s.products);
  const currentUser = usePosStore((s) => s.currentUser);
  const addProduct = usePosStore((s) => s.addProduct);
  const updateProduct = usePosStore((s) => s.updateProduct);
  const deleteProduct = usePosStore((s) => s.deleteProduct);
  const toggleProductAvailability = usePosStore((s) => s.toggleProductAvailability);
  const loginUser = usePosStore((s) => s.loginUser);

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'BEST_COFFEE' | 'NON_COFFEE'>('ALL');
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<'BEST_COFFEE' | 'NON_COFFEE'>('BEST_COFFEE');
  const [price, setPrice] = useState('');
  const [hasStrength, setHasStrength] = useState(false);
  const [strongPrice, setStrongPrice] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');

  // Owner PIN check modal for Karyawan
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const isOwner = currentUser.role === 'OWNER';

  const requireOwnerAuth = (action: () => void) => {
    if (isOwner) {
      action();
    } else {
      setPendingAction(() => action);
      setInputPin('');
      setIsPinModalOpen(true);
    }
  };

  const handleVerifyPin = () => {
    const res = loginUser('OWNER', inputPin);
    if (res.success) {
      setIsPinModalOpen(false);
      Alert.alert('Berhasil', 'Akses Owner Terbuka');
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      Alert.alert('Gagal', res.message || 'PIN salah!');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat =
      activeCategory === 'ALL' ||
      (activeCategory === 'BEST_COFFEE' && p.category === 'BEST_COFFEE') ||
      (activeCategory === 'NON_COFFEE' && p.category === 'NON_COFFEE');
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenAddModal = () => {
    requireOwnerAuth(() => {
      setName('');
      setSku('');
      setCategory('BEST_COFFEE');
      setPrice('');
      setHasStrength(false);
      setStrongPrice('');
      setTag('');
      setDescription('');
      setIsAddModalOpen(true);
    });
  };

  const handleSaveNewProduct = () => {
    if (!name.trim() || !sku.trim() || !price.trim()) {
      Alert.alert('Perhatian', 'Nama, SKU, dan Harga wajib diisi');
      return;
    }

    const numPrice = parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
    const numStrongPrice = hasStrength
      ? parseInt(strongPrice.replace(/[^0-9]/g, ''), 10) || numPrice + 2000
      : undefined;

    addProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      price: numPrice,
      hasStrengthOption: hasStrength,
      strongPrice: numStrongPrice,
      tag: tag.trim() || undefined,
      description: description.trim() || undefined,
    });

    setIsAddModalOpen(false);
    Alert.alert('Sukses', `Menu "${name}" berhasil ditambahkan ke katalog`);
  };

  const handleOpenEditModal = (prod: Product) => {
    requireOwnerAuth(() => {
      setEditingProduct(prod);
      setName(prod.name);
      setSku(prod.sku);
      setCategory(prod.category);
      setPrice(prod.price.toString());
      setHasStrength(!!prod.hasStrengthOption);
      setStrongPrice(prod.strongPrice ? prod.strongPrice.toString() : '');
      setTag(prod.tag || '');
      setDescription(prod.description || '');
    });
  };

  const handleSaveEditProduct = () => {
    if (!editingProduct) return;
    const numPrice = parseInt(price.replace(/[^0-9]/g, ''), 10) || editingProduct.price;
    const numStrongPrice = hasStrength
      ? parseInt(strongPrice.replace(/[^0-9]/g, ''), 10) || numPrice + 2000
      : undefined;

    updateProduct(editingProduct.id, {
      name: name.trim() || editingProduct.name,
      sku: sku.trim().toUpperCase() || editingProduct.sku,
      category,
      price: numPrice,
      hasStrengthOption: hasStrength,
      strongPrice: numStrongPrice,
      tag: tag.trim() || undefined,
      description: description.trim() || undefined,
    });

    setEditingProduct(null);
    Alert.alert('Sukses', `Menu "${name}" berhasil diperbarui`);
  };

  const handleDeleteProduct = (prod: Product) => {
    requireOwnerAuth(() => {
      Alert.alert('Hapus Menu', `Yakin hapus menu "${prod.name}"?`, [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            deleteProduct(prod.id);
            Alert.alert('Dihapus', `Menu "${prod.name}" telah dihapus`);
          },
        },
      ]);
    });
  };

  const handleToggleStock = (prod: Product) => {
    requireOwnerAuth(() => {
      toggleProductAvailability(prod.id);
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>CUSTOM MENU & PRODUK</Text>
          <Text style={styles.subtitle}>Atur katalog, harga, & stok minuman</Text>
        </View>

        {/* Role Badge */}
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

      {/* Role Warning / Action Banner */}
      {!isOwner && (
        <View style={styles.bannerNotice}>
          <MaterialCommunityIcons name="lock-outline" size={16} color={COLORS.caramel} />
          <Text style={styles.bannerText}>
            Mode Karyawan: Perubahan harga & menu memerlukan PIN Owner.
          </Text>
          <TouchableOpacity
            style={styles.btnUnlock}
            onPress={() => requireOwnerAuth(() => {})}
          >
            <Text style={styles.btnUnlockText}>Buka Akses</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search & Add New Menu Bar */}
      <View style={styles.topActions}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={18} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari menu / SKU..."
            placeholderTextColor={COLORS.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={COLORS.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.btnAdd} onPress={handleOpenAddModal} activeOpacity={0.85}>
          <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
          <Text style={styles.btnAddText}>Tambah Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryRow}>
        <TouchableOpacity
          style={[styles.catChip, activeCategory === 'ALL' && styles.catChipActive]}
          onPress={() => setActiveCategory('ALL')}
        >
          <Text style={[styles.catText, activeCategory === 'ALL' && styles.catTextActive]}>
            Semua ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.catChip, activeCategory === 'BEST_COFFEE' && styles.catChipActive]}
          onPress={() => setActiveCategory('BEST_COFFEE')}
        >
          <Text style={[styles.catText, activeCategory === 'BEST_COFFEE' && styles.catTextActive]}>
            Best Coffee
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.catChip, activeCategory === 'NON_COFFEE' && styles.catChipActive]}
          onPress={() => setActiveCategory('NON_COFFEE')}
        >
          <Text style={[styles.catText, activeCategory === 'NON_COFFEE' && styles.catTextActive]}>
            Non Coffee
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isAvail = item.isAvailable !== false;
          return (
            <View style={[styles.productCard, !isAvail && styles.productCardDisabled]}>
              <View style={styles.cardHeader}>
                <View style={styles.skuBadge}>
                  <Text style={styles.skuText}>{item.sku}</Text>
                </View>

                <View style={styles.titleInfo}>
                  <Text style={styles.prodName}>{item.name}</Text>
                  <Text style={styles.prodCat}>
                    {item.category === 'BEST_COFFEE' ? 'Best Coffee' : 'Non Coffee'}
                    {item.tag ? ` • ${item.tag}` : ''}
                  </Text>
                </View>

                {/* Availability status badge */}
                <TouchableOpacity
                  style={[styles.stockBadge, isAvail ? styles.stockAvail : styles.stockEmpty]}
                  onPress={() => handleToggleStock(item)}
                >
                  <MaterialCommunityIcons
                    name={isAvail ? 'check-circle' : 'close-circle'}
                    size={12}
                    color="#FFFFFF"
                  />
                  <Text style={styles.stockText}>{isAvail ? 'Tersedia' : 'Habis'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.prodDesc} numberOfLines={1}>
                {item.description || 'Tidak ada deskripsi'}
              </Text>

              {/* Price & Action Row */}
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceLabel}>HARGA NORMAL</Text>
                  <Text style={styles.priceValue}>Rp {item.price.toLocaleString('id-ID')}</Text>
                  {item.hasStrengthOption && (
                    <Text style={styles.priceStrong}>
                      Strong: Rp {(item.strongPrice || item.price + 2000).toLocaleString('id-ID')}
                    </Text>
                  )}
                </View>

                <View style={styles.actionBtns}>
                  <TouchableOpacity
                    style={styles.btnActionEdit}
                    onPress={() => handleOpenEditModal(item)}
                  >
                    <MaterialCommunityIcons name="pencil" size={14} color={COLORS.caramel} />
                    <Text style={styles.btnActionEditText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnActionDelete}
                    onPress={() => handleDeleteProduct(item)}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={14} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Modal Tambah / Edit Menu */}
      <Modal visible={isAddModalOpen || editingProduct !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Ubah Detail Menu' : 'Tambah Menu Baru'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
              >
                <MaterialCommunityIcons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.formLabel}>Nama Menu *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Mis: Caramel Macchiato"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.formLabel}>SKU *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="CML"
                  maxLength={4}
                  autoCapitalize="characters"
                  value={sku}
                  onChangeText={setSku}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Kategori *</Text>
                <View style={styles.catSelectRow}>
                  <TouchableOpacity
                    style={[
                      styles.catOption,
                      category === 'BEST_COFFEE' && styles.catOptionActive,
                    ]}
                    onPress={() => setCategory('BEST_COFFEE')}
                  >
                    <Text
                      style={[
                        styles.catOptionText,
                        category === 'BEST_COFFEE' && styles.catOptionTextActive,
                      ]}
                    >
                      Best Coffee
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.catOption,
                      category === 'NON_COFFEE' && styles.catOptionActive,
                    ]}
                    onPress={() => setCategory('NON_COFFEE')}
                  >
                    <Text
                      style={[
                        styles.catOptionText,
                        category === 'NON_COFFEE' && styles.catOptionTextActive,
                      ]}
                    >
                      Non Coffee
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Harga Normal (Rp) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="10000"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.formLabel}>Tag Rekomendasi</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Favorit / Baru"
                  value={tag}
                  onChangeText={setTag}
                />
              </View>
            </View>

            {/* Toggle Strength option */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setHasStrength(!hasStrength)}
            >
              <MaterialCommunityIcons
                name={hasStrength ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={20}
                color={COLORS.caramel}
              />
              <Text style={styles.toggleText}>Sediakan pilihan Extra Shot (Strong Espresso)</Text>
            </TouchableOpacity>

            {hasStrength && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.formLabel}>Harga Varian Strong (Rp)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="12000"
                  keyboardType="numeric"
                  value={strongPrice}
                  onChangeText={setStrongPrice}
                />
              </View>
            )}

            <View style={{ marginBottom: 16 }}>
              <Text style={styles.formLabel}>Deskripsi Singkat</Text>
              <TextInput
                style={[styles.formInput, { height: 44 }]}
                placeholder="Rasa kopi susu dengan sirup..."
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Modal CTA Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnModalCancel}
                onPress={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
              >
                <Text style={styles.btnModalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnModalSave}
                onPress={editingProduct ? handleSaveEditProduct : handleSaveNewProduct}
              >
                <Text style={styles.btnModalSaveText}>Simpan Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Input PIN Owner */}
      <Modal visible={isPinModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxWidth: 320 }]}>
            <View style={styles.pinHeader}>
              <MaterialCommunityIcons name="shield-lock" size={36} color={COLORS.caramel} />
              <Text style={styles.pinTitle}>Masukkan PIN Owner</Text>
              <Text style={styles.pinSub}>Aksi ini membutuhkan otorisasi Pemilik Toko</Text>
              <Text style={styles.pinDefaultNote}>(PIN Default: 1234)</Text>
            </View>

            <TextInput
              style={styles.pinInput}
              placeholder="••••"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
              keyboardType="numeric"
              maxLength={6}
              value={inputPin}
              onChangeText={setInputPin}
              autoFocus
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnModalCancel}
                onPress={() => {
                  setIsPinModalOpen(false);
                  setPendingAction(null);
                }}
              >
                <Text style={styles.btnModalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnModalSave} onPress={handleVerifyPin}>
                <Text style={styles.btnModalSaveText}>Verifikasi</Text>
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
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
    backgroundColor: '#059669', // Emerald green
  },
  roleKaryawan: {
    backgroundColor: COLORS.caramel,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  bannerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    marginLeft: 6,
    fontWeight: '500',
  },
  btnUnlock: {
    backgroundColor: COLORS.caramel,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnUnlockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    marginLeft: 6,
  },
  btnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.caramel,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
  },
  btnAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    backgroundColor: COLORS.darkRoast,
    borderColor: COLORS.darkRoast,
  },
  catText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skuBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skuText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  titleInfo: {
    flex: 1,
    marginLeft: 10,
  },
  prodName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  prodCat: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockAvail: {
    backgroundColor: '#059669',
  },
  stockEmpty: {
    backgroundColor: '#DC2626',
  },
  stockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  prodDesc: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.muted,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  priceStrong: {
    fontSize: 10,
    color: COLORS.caramel,
    fontWeight: '600',
    marginTop: 2,
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnActionEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnActionEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.caramel,
  },
  btnActionDelete: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },

  // Modal styles
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
    maxWidth: 420,
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
    color: COLORS.darkRoast,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 12,
    color: COLORS.text,
  },
  catSelectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  catOptionActive: {
    backgroundColor: COLORS.darkRoast,
  },
  catOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },
  catOptionTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  toggleText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
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

  // PIN modal
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
});
