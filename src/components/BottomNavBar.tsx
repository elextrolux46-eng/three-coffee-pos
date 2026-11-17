import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { usePosStore } from '../store/usePosStore';
import { COLORS } from '../constants/theme';
import { ScreenType } from '../types';

export const BottomNavBar: React.FC = () => {
  const currentScreen = usePosStore((s) => s.currentScreen);
  const setScreen = usePosStore((s) => s.setScreen);

  // Hidden when on landscape terminal or payment checkout flow
  if (currentScreen === 'POS_ORDER' || currentScreen === 'PAYMENT') {
    return null;
  }

  const handleOpenKasir = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (e) {
      // Orientation lock fallback for platforms that don't support it
    }
    setScreen('POS_ORDER');
  };

  const navItems: { screen: ScreenType; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
    { screen: 'DASHBOARD', label: 'Home', icon: 'home-variant' },
    { screen: 'CUSTOM_MENU', label: 'Custom Menu', icon: 'coffee-outline' },
    // Center button is Kasir (custom rendered)
    { screen: 'RECEIPT', label: 'Riwayat', icon: 'receipt-text-outline' },
    { screen: 'PROFILE', label: 'Profil', icon: 'account-circle-outline' },
  ];

  return (
    <View style={styles.wrapper}>
      {/* Tab 1: Home */}
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => setScreen('DASHBOARD')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={navItems[0].icon}
          size={24}
          color={currentScreen === 'DASHBOARD' ? '#0284C7' : '#8C827A'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentScreen === 'DASHBOARD' && styles.tabLabelActive,
          ]}
        >
          {navItems[0].label}
        </Text>
      </TouchableOpacity>

      {/* Tab 2: Custom Menu */}
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => setScreen('CUSTOM_MENU')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={navItems[1].icon}
          size={24}
          color={currentScreen === 'CUSTOM_MENU' ? '#0284C7' : '#8C827A'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentScreen === 'CUSTOM_MENU' && styles.tabLabelActive,
          ]}
        >
          {navItems[1].label}
        </Text>
      </TouchableOpacity>

      {/* Center Floating Action Button: KASIR */}
      <View style={styles.centerBtnContainer}>
        <TouchableOpacity
          style={styles.floatingCenterBtn}
          onPress={handleOpenKasir}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="credit-card-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.floatingLabel}>Kasir</Text>
      </View>

      {/* Tab 4: Riwayat Struk */}
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => setScreen('RECEIPT')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={navItems[2].icon}
          size={24}
          color={currentScreen === 'RECEIPT' ? '#0284C7' : '#8C827A'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentScreen === 'RECEIPT' && styles.tabLabelActive,
          ]}
        >
          {navItems[2].label}
        </Text>
      </TouchableOpacity>

      {/* Tab 5: Profil */}
      <TouchableOpacity
        style={styles.tabBtn}
        onPress={() => setScreen('PROFILE')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={navItems[3].icon}
          size={24}
          color={currentScreen === 'PROFILE' ? '#0284C7' : '#8C827A'}
        />
        <Text
          style={[
            styles.tabLabel,
            currentScreen === 'PROFILE' && styles.tabLabelActive,
          ]}
        >
          {navItems[3].label}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8DFD8',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 10,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8C827A',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  centerBtnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -16, // Elevates the circle above the bar
  },
  floatingCenterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  floatingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 2,
  },
});
