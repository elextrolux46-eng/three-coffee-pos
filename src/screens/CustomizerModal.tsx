import React, { useState, useEffect } from 'react';
import {
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
import { StrengthOption, SweetnessOption, Temperature } from '../types';

export const CustomizerModal: React.FC = () => {
  const product = usePosStore((s) => s.customizingProduct);
  const editingCartItem = usePosStore((s) => s.editingCartItem);
  const closeCustomizer = usePosStore((s) => s.closeCustomizer);
  const addToCart = usePosStore((s) => s.addToCart);
  const updateCartItemModifier = usePosStore((s) => s.updateCartItemModifier);

  const [temperature, setTemperature] = useState<Temperature>('ICED');
  const [strength, setStrength] = useState<StrengthOption>('NORMAL');
  const [sweetness, setSweetness] = useState<SweetnessOption>('100%');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingCartItem) {
      setTemperature(editingCartItem.modifier.temperature || 'ICED');
      setStrength(editingCartItem.modifier.strength || 'NORMAL');
      setSweetness(editingCartItem.modifier.sweetness || '100%');
      setNotes(editingCartItem.modifier.notes || '');
    } else if (product) {
      setTemperature('ICED');
      setStrength('NORMAL');
      setSweetness('100%');
      setNotes('');
    }
  }, [product, editingCartItem]);

  if (!product) return null;

  // Calculate dynamic price based on strength selection
  const currentPrice =
    strength === 'STRONG' && product.strongPrice
      ? product.strongPrice
      : product.price;

  const handleSave = () => {
    const modifier = {
      temperature,
      strength: product.hasStrengthOption ? strength : undefined,
      sweetness,
      notes: notes.trim() || undefined,
    };

    if (editingCartItem) {
      updateCartItemModifier(editingCartItem.cartItemId, product, modifier, currentPrice);
    } else {
      addToCart(product, modifier, currentPrice);
    }
  };

  return (
    <Modal visible={!!product} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeHeader}>
                <MaterialCommunityIcons name="tune-variant" size={14} color={COLORS.caramel} />
                <Text style={styles.badgeHeaderText}>
                  {editingCartItem ? 'Ubah Kustomisasi' : 'Kustomisasi Minuman'}
                </Text>
              </View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCat}>
                {product.category === 'BEST_COFFEE' ? 'Best Coffee' : 'Non Coffee'} • {product.sku}
              </Text>
            </View>
            <TouchableOpacity onPress={closeCustomizer} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={COLORS.darkRoast} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Section 1: Shot Strength (if applicable) */}
            {product.hasStrengthOption && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>KEKUATAN ESPRESSO SHOT</Text>
                <View style={styles.rowSelector}>
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      strength === 'NORMAL' && styles.selectorBtnActive,
                    ]}
                    onPress={() => setStrength('NORMAL')}
                  >
                    <MaterialCommunityIcons
                      name="coffee-outline"
                      size={16}
                      color={strength === 'NORMAL' ? COLORS.white : COLORS.text}
                    />
                    <Text
                      style={[
                        styles.selectorText,
                        strength === 'NORMAL' && styles.selectorTextActive,
                      ]}
                    >
                      Normal Shot
                    </Text>
                    <Text
                      style={[
                        styles.subPrice,
                        strength === 'NORMAL' && styles.subPriceActive,
                      ]}
                    >
                      Rp {product.price.toLocaleString('id-ID')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      strength === 'STRONG' && styles.selectorBtnActive,
                    ]}
                    onPress={() => setStrength('STRONG')}
                  >
                    <MaterialCommunityIcons
                      name="coffee"
                      size={16}
                      color={strength === 'STRONG' ? COLORS.white : COLORS.text}
                    />
                    <Text
                      style={[
                        styles.selectorText,
                        strength === 'STRONG' && styles.selectorTextActive,
                      ]}
                    >
                      Strong Shot
                    </Text>
                    <Text
                      style={[
                        styles.subPrice,
                        strength === 'STRONG' && styles.subPriceActive,
                      ]}
                    >
                      Rp {product.strongPrice?.toLocaleString('id-ID')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Section 2: Temperature */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TEMPERATUR SAJIAN</Text>
              <View style={styles.rowSelector}>
                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    temperature === 'ICED' && styles.selectorBtnActive,
                  ]}
                  onPress={() => setTemperature('ICED')}
                >
                  <MaterialCommunityIcons
                    name="cube-outline"
                    size={16}
                    color={temperature === 'ICED' ? COLORS.white : COLORS.text}
                  />
                  <Text
                    style={[
                      styles.selectorText,
                      temperature === 'ICED' && styles.selectorTextActive,
                    ]}
                  >
                    Iced (Dingin)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectorBtn,
                    temperature === 'HOT' && styles.selectorBtnActive,
                  ]}
                  onPress={() => setTemperature('HOT')}
                >
                  <MaterialCommunityIcons
                    name="fire"
                    size={16}
                    color={temperature === 'HOT' ? COLORS.white : COLORS.text}
                  />
                  <Text
                    style={[
                      styles.selectorText,
                      temperature === 'HOT' && styles.selectorTextActive,
                    ]}
                  >
                    Hot (Panas)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 3: Sweetness */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TINGKAT KEMANISAN (GULA)</Text>
              <View style={styles.rowSelector}>
                {(['100%', '50%', '0%'] as SweetnessOption[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.selectorBtn,
                      styles.selectorBtnSmall,
                      sweetness === level && styles.selectorBtnActive,
                    ]}
                    onPress={() => setSweetness(level)}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        sweetness === level && styles.selectorTextActive,
                      ]}
                    >
                      {level === '100%'
                        ? 'Normal (100%)'
                        : level === '50%'
                        ? 'Sedikit (50%)'
                        : 'Tanpa Gula (0%)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section 4: Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CATATAN KHUSUS BARISTA</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Contoh: Es batu sedikit, gula dipisah, ekstra cup..."
                placeholderTextColor={COLORS.muted}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <MaterialCommunityIcons
              name={editingCartItem ? 'check' : 'cart-plus'}
              size={18}
              color={COLORS.white}
            />
            <Text style={styles.saveBtnText}>
              {editingCartItem ? 'Simpan Perubahan' : 'Tambahkan ke Pesanan'} — Rp{' '}
              {currentPrice.toLocaleString('id-ID')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.caramelLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.caramel,
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.darkRoast,
  },
  productCat: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: COLORS.canvasBg,
    borderRadius: 20,
  },
  scrollBody: {
    maxHeight: 380,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.muted,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  rowSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: COLORS.canvasBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  selectorBtnSmall: {
    flex: 1,
  },
  selectorBtnActive: {
    backgroundColor: COLORS.caramel,
    borderColor: COLORS.caramel,
  },
  selectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  selectorTextActive: {
    color: COLORS.white,
  },
  subPrice: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '600',
  },
  subPriceActive: {
    color: COLORS.white,
  },
  notesInput: {
    backgroundColor: COLORS.canvasBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: COLORS.text,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.darkRoast,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
