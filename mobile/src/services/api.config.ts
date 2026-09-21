import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = (): string => {
  // 1. Dynamic host resolution via Expo Constants (for Expo Go on physical devices & simulators)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants.manifest2?.extra?.expoGo as any)?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:2000/api`;
    }
  }

  // 2. Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:2000/api';
  }

  // 3. iOS Simulator & Web fallback (using explicit IPv4 127.0.0.1 to avoid iOS localhost IPv6 resolution failures)
  return 'http://127.0.0.1:2000/api';
};

export const API_BASE_URL = getBaseUrl();
