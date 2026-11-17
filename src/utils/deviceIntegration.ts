import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';

/**
 * Format Indonesian and international phone numbers for WhatsApp
 */
export const formatWhatsAppNumber = (phone: string): string => {
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  if (digits.startsWith('8')) {
    return '62' + digits;
  }
  return digits;
};

/**
 * Send pre-formatted text directly to WhatsApp app or web fallback
 */
export const sendToWhatsApp = async (message: string, rawPhone?: string): Promise<boolean> => {
  const formattedPhone = rawPhone ? formatWhatsAppNumber(rawPhone) : '';

  // Prepare deep link URL (native WhatsApp app scheme)
  let appUrl = '';
  let webUrl = '';

  if (formattedPhone.length >= 8) {
    appUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    webUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
  } else {
    // No specific phone number: open WhatsApp contact/chat selector
    appUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    webUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  }

  try {
    const canOpen = await Linking.canOpenURL(appUrl);
    if (canOpen) {
      await Linking.openURL(appUrl);
      return true;
    }
  } catch (e) {
    // Fallback if canOpenURL fails
  }

  // Fallback to web link (browser redirects to WhatsApp if installed)
  try {
    const canOpenWeb = await Linking.canOpenURL(webUrl);
    if (canOpenWeb) {
      await Linking.openURL(webUrl);
      return true;
    } else {
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
      return true;
    }
  } catch (err) {
    Alert.alert(
      'Gagal Membuka WhatsApp',
      'Pastikan aplikasi WhatsApp terpasang di perangkat dan HP terhubung ke internet.'
    );
    return false;
  }
};

/**
 * Request runtime Bluetooth permissions on Android
 */
export const requestBluetoothPermission = async (): Promise<{
  granted: boolean;
  message: string;
}> => {
  if (Platform.OS !== 'android') {
    return { granted: true, message: 'Platform non-Android tidak membutuhkan izin runtime ini.' };
  }

  try {
    if (Platform.Version >= 31) {
      // Android 12+ (API 31+) permissions
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      const isScanGranted =
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const isConnectGranted =
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED;

      if (isScanGranted && isConnectGranted) {
        return { granted: true, message: 'Izin Bluetooth Connect & Scan aktif.' };
      } else {
        return {
          granted: false,
          message: 'Izin Bluetooth ditolak. Harap izinkan akses Bluetooth di Pengaturan Aplikasi.',
        };
      }
    } else {
      // Android 11 and below permissions
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Izin Lokasi untuk Bluetooth',
          message: 'Android memerlukan izin lokasi untuk memindai perangkat printer Bluetooth thermal terdekat.',
          buttonPositive: 'Izinkan',
          buttonNegative: 'Batal',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return { granted: true, message: 'Izin Bluetooth lokasi aktif.' };
      } else {
        return { granted: false, message: 'Izin Bluetooth lokasi ditolak.' };
      }
    }
  } catch (err: any) {
    return { granted: false, message: err?.message || 'Gagal meminta izin Bluetooth.' };
  }
};

/**
 * Open Android native Bluetooth Settings screen directly
 */
export const openBluetoothSettings = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      // Direct intent to Android Bluetooth Settings
      await Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
      return;
    } catch (e) {
      // Fallback to app settings
      try {
        await Linking.openSettings();
      } catch (err) {
        Alert.alert('Perhatian', 'Buka menu Pengaturan > Bluetooth di HP Anda secara manual.');
      }
    }
  } else {
    try {
      await Linking.openSettings();
    } catch (e) {}
  }
};

/**
 * Open or download Thermal Printer App (RawBT Print Service / Bluetooth Print)
 */
export const openThermalPrinterApp = async (): Promise<void> => {
  const rawbtScheme = 'rawbt:';
  const playStoreRawbt = 'market://details?id=ru.a402d.rawbtprinter';
  const webPlayStoreRawbt = 'https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter';

  try {
    const canOpen = await Linking.canOpenURL(rawbtScheme);
    if (canOpen) {
      await Linking.openURL(rawbtScheme);
      return;
    }
  } catch (e) {}

  // If not installed, ask user to open Play Store to install RawBT or Bluetooth Print
  Alert.alert(
    'Aplikasi Thermal Bluetooth',
    'Aplikasi RawBT / Driver Printer Thermal 58mm belum terbuka. Ingin membuka Google Play Store untuk mengunduh RawBT Driver?',
    [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Buka Pengaturan BT',
        onPress: openBluetoothSettings,
      },
      {
        text: 'Download RawBT',
        onPress: async () => {
          try {
            const canOpenStore = await Linking.canOpenURL(playStoreRawbt);
            if (canOpenStore) {
              await Linking.openURL(playStoreRawbt);
            } else {
              await Linking.openURL(webPlayStoreRawbt);
            }
          } catch (err) {
            await Linking.openURL(webPlayStoreRawbt);
          }
        },
      },
    ]
  );
};

/**
 * Send text payload directly to Thermal Bluetooth Printer via RawBT protocol
 */
export const printThermalViaRawBt = async (
  rawText: string,
  onFallback?: () => void
): Promise<boolean> => {
  const rawbtUrl = `rawbt:data:text/plain;charset=utf-8,${encodeURIComponent(rawText)}`;

  try {
    const canOpen = await Linking.canOpenURL('rawbt:');
    if (canOpen) {
      await Linking.openURL(rawbtUrl);
      return true;
    }
  } catch (e) {}

  // If RawBT is not installed, prompt user with choices
  Alert.alert(
    'Cetak Thermal Bluetooth (58mm)',
    'Ingin mencetak via aplikasi RawBT Thermal Printer atau simulasi printer bawaan?',
    [
      {
        text: 'Simulasi Cetak POS',
        onPress: () => {
          if (onFallback) onFallback();
          Alert.alert('Simulasi Cetak Berhasil', 'Struk 58mm ESC/POS berhasil diproses.');
        },
      },
      {
        text: 'Buka RawBT / Driver',
        onPress: openThermalPrinterApp,
      },
    ]
  );

  return false;
};
