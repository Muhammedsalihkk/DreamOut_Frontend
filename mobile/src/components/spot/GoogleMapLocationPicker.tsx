import React from 'react';
import { Platform } from 'react-native';
import {
  GoogleMapLocationPickerProps,
  LocationData,
} from './GoogleMapLocationPicker.types';
import { GoogleMapLocationPicker as WebPicker } from './GoogleMapLocationPicker.web';

export * from './GoogleMapLocationPicker.types';

export const GoogleMapLocationPicker: React.FC<GoogleMapLocationPickerProps> = (
  props
) => {
  if (Platform.OS === 'web') {
    return <WebPicker {...props} />;
  }

  // On native platforms, Metro automatically resolves GoogleMapLocationPicker.native.tsx.
  // This lazy require serves as a safe fallback.
  const NativePicker = require('./GoogleMapLocationPicker.native')
    .GoogleMapLocationPicker;
  return <NativePicker {...props} />;
};

export default GoogleMapLocationPicker;
