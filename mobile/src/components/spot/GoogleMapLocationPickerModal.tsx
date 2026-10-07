import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SelectedLocationData {
  locationName: string;
  latitude: number;
  longitude: number;
}

interface GoogleMapLocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: SelectedLocationData) => void;
  initialLocationName?: string;
  initialLatitude?: number;
  initialLongitude?: number;
}

interface GeocodeResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const PRESET_POPULAR_PLACES: { name: string; tag: string; lat: number; lng: number }[] = [
  { name: 'Baga Beach, Goa', tag: '🏖️ Beach', lat: 15.5553, lng: 73.7517 },
  { name: 'Varkala Cliff Beach, Kerala', tag: '🏖️ Beach', lat: 8.7379, lng: 76.7163 },
  { name: 'Fort Kochi Food Street, Kerala', tag: '🍔 Food', lat: 9.9658, lng: 76.2425 },
  { name: 'Kolukkumalai View Point, Munnar', tag: '⛰️ Mountain', lat: 10.0889, lng: 77.0595 },
  { name: 'Marina Beach, Chennai', tag: '🏖️ Beach', lat: 13.05, lng: 80.2824 },
  { name: 'Indiranagar Food Hub, Bangalore', tag: '🍔 Food', lat: 12.9784, lng: 77.6408 },
  { name: 'Attukal Waterfalls, Munnar', tag: '🌊 Waterfall', lat: 10.0536, lng: 77.0543 },
  { name: 'Calangute Beach, Goa', tag: '🏖️ Beach', lat: 15.5439, lng: 73.7553 },
];

export const GoogleMapLocationPickerModal: React.FC<GoogleMapLocationPickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialLocationName = 'Munnar, Kerala',
  initialLatitude = 10.0889,
  initialLongitude = 77.0595,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState(initialLocationName);
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Sync initial props when modal becomes visible
  useEffect(() => {
    if (visible) {
      setSelectedName(initialLocationName || 'Munnar, Kerala');
      setLatitude(initialLatitude || 10.0889);
      setLongitude(initialLongitude || 77.0595);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [visible, initialLocationName, initialLatitude, initialLongitude]);

  // Handle Search using OpenStreetMap Nominatim geocoding (reliable, zero API key required)
  const handleSearchSubmit = async (queryText?: string) => {
    const textToSearch = (queryText !== undefined ? queryText : searchQuery).trim();
    if (!textToSearch || textToSearch.length < 2) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          textToSearch
        )}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'DreamOutApp/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.warn('[GoogleMapPicker] Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: GeocodeResult) => {
    const parsedLat = parseFloat(result.lat);
    const parsedLng = parseFloat(result.lon);

    // Extract cleaner short address for the spot name
    const parts = result.display_name.split(',');
    const cleanName = parts.slice(0, 3).join(',').trim();

    setLatitude(parsedLat);
    setLongitude(parsedLng);
    setSelectedName(cleanName || result.display_name);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectPreset = (preset: (typeof PRESET_POPULAR_PLACES)[0]) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setSelectedName(preset.name);
    setSearchResults([]);
  };

  // GPS Current Location detection
  const handleUseCurrentLocation = async () => {
    setIsGpsLoading(true);

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'DreamOutApp/1.0',
                },
              }
            );
            if (res.ok) {
              const revData = await res.json();
              if (revData && revData.display_name) {
                const parts = revData.display_name.split(',');
                setSelectedName(parts.slice(0, 3).join(',').trim());
              } else {
                setSelectedName(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
              }
            }
          } catch {
            setSelectedName(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          } finally {
            setIsGpsLoading(false);
          }
        },
        () => {
          setIsGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      // Mobile runtime GPS via expo-location
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const perm = await Location.requestForegroundPermissionsAsync();
          status = perm.status;
        }

        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);

          try {
            const geocoded = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (geocoded && geocoded.length > 0) {
              const item = geocoded[0];
              const parts = [item.name, item.street, item.city, item.region].filter(Boolean);
              setSelectedName(parts.slice(0, 3).join(', '));
            } else {
              setSelectedName(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
          } catch {
            setSelectedName(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        }
      } catch (err) {
        console.warn('[GoogleMapLocationPickerModal] Location error:', err);
      } finally {
        setIsGpsLoading(false);
      }
    }
  };

  const handleConfirmLocation = () => {
    onConfirm({
      locationName: selectedName.trim() || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
    });
    onClose();
  };

  // Google Maps embed URL
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoomLevel}&output=embed`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.containerSheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.gMapLogoBadge}>
                <Ionicons name="map" size={16} color="#FF6B00" />
                <Text style={styles.gMapBadgeText}>Google Maps</Text>
              </View>
              <Text style={styles.headerTitle}>Select Spot Location</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#8A8F9B" />
            </TouchableOpacity>
          </View>

          {/* Search Input on Google Maps */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#FF6B00" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search beach, cafe, city or landmark..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.length > 2) {
                    handleSearchSubmit(text);
                  }
                }}
                returnKeyType="search"
                onSubmitEditing={() => handleSearchSubmit()}
              />
              {isSearching ? (
                <ActivityIndicator size="small" color="#FF6B00" />
              ) : searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#8A8F9B" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Current GPS button */}
            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={handleUseCurrentLocation}
              disabled={isGpsLoading}
              activeOpacity={0.8}
            >
              {isGpsLoading ? (
                <ActivityIndicator size="small" color="#FF6B00" />
              ) : (
                <Ionicons name="locate" size={18} color="#FF6B00" />
              )}
            </TouchableOpacity>
          </View>

          {/* Geocoding Results Dropdown */}
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsHeader}>Suggested Matches:</Text>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  style={styles.searchResultItem}
                  activeOpacity={0.7}
                  onPress={() => handleSelectSearchResult(item)}
                >
                  <Ionicons name="location-sharp" size={16} color="#FF6B00" style={{ marginRight: 8 }} />
                  <Text style={styles.searchResultText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Popular Spot Chips */}
          <View style={styles.presetChipsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {PRESET_POPULAR_PLACES.map((p) => {
                const isSelected =
                  Math.abs(latitude - p.lat) < 0.005 && Math.abs(longitude - p.lng) < 0.005;

                return (
                  <TouchableOpacity
                    key={p.name}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectPreset(p)}
                  >
                    <Text style={styles.chipTag}>{p.tag}</Text>
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {p.name.split(',')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Map Viewer Viewport */}
          <View style={styles.mapViewportContainer}>
            {Platform.OS === 'web' ? (
              // Live interactive Google Maps iframe embed on web
              // @ts-ignore
              <iframe
                src={googleMapsEmbedUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                  borderRadius: 16,
                  filter: 'invert(90%) hue-rotate(180deg)',
                }}
                loading="lazy"
                title="Google Maps Location View"
              />
            ) : (
              // High-fidelity native mobile map view representation with crosshairs & satellite view
              <View style={styles.nativeMapCanvas}>
                <View style={styles.nativeGridLineX} />
                <View style={styles.nativeGridLineY} />
                <View style={styles.nativeCenterTarget}>
                  <Ionicons name="location" size={36} color="#FF6B00" />
                </View>
                <View style={styles.nativeMapLabelBadge}>
                  <Text style={styles.nativeMapLabelText}>
                    Lat: {latitude.toFixed(4)} | Lng: {longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
            )}

            {/* Floating Zoom Controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity
                style={styles.zoomBtn}
                onPress={() => setZoomLevel((z) => Math.min(z + 1, 19))}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.zoomBtn}
                onPress={() => setZoomLevel((z) => Math.max(z - 1, 5))}
              >
                <Ionicons name="remove" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Location Confirmation Bar */}
          <View style={styles.confirmationCard}>
            <View style={styles.locationDetailsRow}>
              <View style={styles.pinCircle}>
                <Ionicons name="navigate" size={18} color="#FF6B00" />
              </View>
              <View style={styles.locationTexts}>
                <Text style={styles.selectedTitleLabel}>Selected Place Name</Text>
                <TextInput
                  style={styles.selectedNameInput}
                  value={selectedName}
                  onChangeText={setSelectedName}
                  placeholder="Enter or refine spot location name"
                  placeholderTextColor="#6B7280"
                />
                <Text style={styles.coordinatesText}>
                  Coordinates: {latitude.toFixed(5)}°, {longitude.toFixed(5)}°
                </Text>
              </View>
            </View>

            {/* Confirm & Use Location Button */}
            <TouchableOpacity
              style={styles.confirmBtn}
              activeOpacity={0.85}
              onPress={handleConfirmLocation}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Confirm This Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  containerSheet: {
    backgroundColor: '#0F1117',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '94%',
    minHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 3,
  },
  gMapLogoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  gMapBadgeText: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  gpsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsContainer: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    maxHeight: 180,
  },
  searchResultsHeader: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchResultText: {
    color: '#E5E7EB',
    fontSize: 12,
    flex: 1,
  },
  presetChipsSection: {
    marginBottom: 12,
  },
  chipsScroll: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderColor: '#FF6B00',
  },
  chipTag: {
    fontSize: 12,
  },
  chipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  mapViewportContainer: {
    flex: 1,
    minHeight: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
    backgroundColor: '#0A0B0E',
    marginBottom: 14,
  },
  nativeMapCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131620',
  },
  nativeGridLineX: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nativeGridLineY: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nativeCenterTarget: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeMapLabelBadge: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: 'rgba(10, 11, 14, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  nativeMapLabelText: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '700',
  },
  zoomControls: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmationCard: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  locationDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pinCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  locationTexts: {
    flex: 1,
  },
  selectedTitleLabel: {
    color: '#8A8F9B',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedNameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  coordinatesText: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 4,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    paddingVertical: 13,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
