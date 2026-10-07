export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export interface GoogleMapLocationPickerProps {
  value?: LocationData | null;
  onLocationChange?: (location: LocationData) => void;
  onConfirm?: (location: LocationData) => void;
  initialLocation?: LocationData;
  error?: string | null;
}
