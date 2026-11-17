import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { usePosStore } from './src/store/usePosStore';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CustomMenuScreen } from './src/screens/CustomMenuScreen';
import { PosOrderLandscapeScreen } from './src/screens/PosOrderLandscapeScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { ReceiptScreen } from './src/screens/ReceiptScreen';
import { ShiftReportScreen } from './src/screens/ShiftReportScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CustomizerModal } from './src/screens/CustomizerModal';
import { QrisModal } from './src/components/QrisModal';
import { BottomNavBar } from './src/components/BottomNavBar';

export default function App() {
  const currentScreen = usePosStore((s) => s.currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'DASHBOARD':
        return <DashboardScreen />;
      case 'CUSTOM_MENU':
        return <CustomMenuScreen />;
      case 'POS_ORDER':
        return <PosOrderLandscapeScreen />;
      case 'PAYMENT':
        return <PaymentScreen />;
      case 'RECEIPT':
        return <ReceiptScreen />;
      case 'SHIFT_REPORT':
        return <ShiftReportScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.mainContent}>
        {renderScreen()}
      </View>
      <BottomNavBar />
      <CustomizerModal />
      <QrisModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
  },
});
