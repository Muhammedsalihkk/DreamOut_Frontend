import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import {
  LocationData,
  GoogleMapLocationPickerProps,
} from './GoogleMapLocationPicker.types';

export { LocationData, GoogleMapLocationPickerProps };

interface SearchSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

export const GoogleMapLocationPicker: React.FC<GoogleMapLocationPickerProps> = ({
  value,
  onLocationChange,
  onConfirm,
  initialLocation,
  error,
}) => {
  // Location state
  const [currentLocation, setCurrentLocation] = useState<LocationData>(() => {
    if (value && value.address) return value;
    if (initialLocation && initialLocation.address) return initialLocation;
    return {
      address: '',
      latitude: 11.2588,
      longitude: 75.7804,
    };
  });

  const [isConfirmed, setIsConfirmed] = useState<boolean>(() => {
    return Boolean(value && value.address);
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Geolocation state
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Reverse geocoding loading
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Fullscreen map modal state
  const [isFullScreenModal, setIsFullScreenModal] = useState(false);

  // Map references
  const mapRef = useRef<MapView | null>(null);
  const modalMapRef = useRef<MapView | null>(null);

  // Check initial location permission on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          setHasLocationPermission(true);
        }
      } catch (err) {
        console.warn('[GoogleMapLocationPicker] Error checking permission:', err);
      }
    })();
  }, []);

  // Synchronize when value changes externally
  useEffect(() => {
    if (value && value.address && value.address !== currentLocation.address) {
      setCurrentLocation(value);
      setIsConfirmed(true);
      const targetRegion: Region = {
        latitude: value.latitude,
        longitude: value.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      mapRef.current?.animateToRegion(targetRegion, 400);
      modalMapRef.current?.animateToRegion(targetRegion, 400);
    }
  }, [value]);

  // Clean formatted address helper
  const cleanAddress = (rawAddress: string): string => {
    if (!rawAddress) return '';
    const parts = rawAddress.split(',').map((p) => p.trim());
    if (parts.length <= 4) return parts.join(', ');
    return [parts[0], parts[1], parts[parts.length - 2], parts[parts.length - 1]]
      .filter(Boolean)
      .join(', ');
  };

  // Reverse geocode coordinates using native expo-location with Nominatim fallback
  const reverseGeocode = useCallback(
    async (lat: number, lon: number): Promise<string> => {
      setIsReverseGeocoding(true);
      try {
        // 1. Try native geocoding via expo-location (fast, accurate, no rate limits)
        const nativeResults = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });

        if (nativeResults && nativeResults.length > 0) {
          const item = nativeResults[0];
          const parts = [
            item.name,
            item.street,
            item.district,
            item.subregion,
            item.city,
            item.region,
            item.country,
          ].filter(Boolean);

          const unique = parts.filter(
            (p, idx, arr) => p && arr.indexOf(p) === idx
          );
          if (unique.length > 0) {
            setIsReverseGeocoding(false);
            return unique.slice(0, 3).join(', ');
          }
        }
      } catch (nativeErr) {
        // Continue to fallback
      }

      try {
        // 2. Fallback to OpenStreetMap Nominatim reverse geocode
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'DreamOutApp/1.0',
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name) {
            return cleanAddress(data.display_name);
          }
        }
      } catch (err) {
        console.warn('[GoogleMapLocationPicker] Reverse geocode error:', err);
      } finally {
        setIsReverseGeocoding(false);
      }

      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    },
    []
  );

  // Update coordinates and reverse geocode address
  const updateCoordinates = useCallback(
    async (lat: number, lon: number, forcedAddress?: string) => {
      setIsConfirmed(false);
      const address = forcedAddress || (await reverseGeocode(lat, lon));
      const updated: LocationData = {
        address,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lon.toFixed(6)),
      };
      setCurrentLocation(updated);
      onLocationChange?.(updated);
    },
    [reverseGeocode, onLocationChange]
  );

  // ─────────────────────────────────────────────────────────────
  // SEARCH FUNCTIONALITY
  // ─────────────────────────────────────────────────────────────
  const handleSearchSubmit = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'DreamOutApp/1.0',
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
        } else {
          setSuggestions([]);
          setSearchError('No matching places found. Try another query.');
        }
      }
    } catch (err) {
      setSearchError('Search failed. Please check network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (item: SearchSuggestion) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const address = cleanAddress(item.display_name);

    setSuggestions([]);
    setSearchQuery('');
    setSearchError(null);

    const region: Region = {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    };
    mapRef.current?.animateToRegion(region, 500);
    modalMapRef.current?.animateToRegion(region, 500);

    updateCoordinates(lat, lon, address);
  };

  // ─────────────────────────────────────────────────────────────
  // USE MY CURRENT LOCATION (Expo Location API with runtime permission)
  // ─────────────────────────────────────────────────────────────
  const handleUseCurrentLocation = async () => {
    setGeoNotice(null);
    setIsLocatingUser(true);

    try {
      // 1. Request foreground location permission if needed
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const permRes = await Location.requestForegroundPermissionsAsync();
        status = permRes.status;
      }

      if (status !== 'granted') {
        setGeoNotice(
          'Location permission was denied. Please allow location access in your device settings or choose a point manually.'
        );
        setIsLocatingUser(false);
        return;
      }

      setHasLocationPermission(true);

      // 2. Get current GPS position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const region: Region = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      };

      mapRef.current?.animateToRegion(region, 500);
      modalMapRef.current?.animateToRegion(region, 500);

      await updateCoordinates(lat, lon);
    } catch (err: any) {
      console.warn('[GoogleMapLocationPicker] Geolocation error:', err);
      setGeoNotice(
        'Unable to detect your current location. Please tap the map or search manually.'
      );
    } finally {
      setIsLocatingUser(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // CONFIRM LOCATION ACTION
  // ─────────────────────────────────────────────────────────────
  const handleConfirmLocation = () => {
    if (!currentLocation.address) {
      return;
    }
    setIsConfirmed(true);
    onConfirm?.(currentLocation);
    onLocationChange?.(currentLocation);
    if (isFullScreenModal) {
      setIsFullScreenModal(false);
    }
  };

  // Map Provider selection (Google Maps on Android, native default/Google on iOS)
  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

  return (
    <View style={styles.container}>
      {/* Location Section Header & Divider */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Location</Text>
        {isConfirmed ? (
          <View style={styles.confirmedBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#10B981" />
            <Text style={styles.confirmedBadgeText}>Confirmed</Text>
          </View>
        ) : (
          <Text style={styles.requiredIndicator}>* Exact spot coordinates</Text>
        )}
      </View>
      <View style={styles.headerDivider} />

      {/* Top Search Box: [ 🔍 Search for a location... ] */}
      <View style={styles.searchBoxRow}>
        <View style={styles.searchBoxInputWrapper}>
          <Ionicons name="search" size={17} color="#FF6B00" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchBoxInput}
            placeholder="Search for a location..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={(txt) => {
              setSearchQuery(txt);
              if (txt.length > 2) handleSearchSubmit();
              if (!txt) setSuggestions([]);
            }}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#FF6B00" />
          ) : searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSuggestions([]); }}>
              <Ionicons name="close-circle" size={18} color="#8A8F9B" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Search Error Notice */}
      {searchError && (
        <Text style={styles.searchErrorText}>{searchError}</Text>
      )}

      {/* Search Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsCard}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.place_id}
              style={styles.suggestionItem}
              activeOpacity={0.7}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Ionicons
                name="location-sharp"
                size={16}
                color="#FF6B00"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text style={styles.suggestionText} numberOfLines={2}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Map Viewport Area */}
      <View
        style={[
          styles.mapContainer,
          Boolean(error) && !isConfirmed && styles.mapContainerError,
        ]}
      >
        <MapView
          ref={mapRef}
          provider={mapProvider}
          style={StyleSheet.absoluteFill}
          customMapStyle={DARK_MAP_STYLE}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            updateCoordinates(latitude, longitude);
          }}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={false}
          showsCompass={false}
          loadingEnabled
          loadingIndicatorColor="#FF6B00"
          loadingBackgroundColor="#161922"
        >
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              updateCoordinates(latitude, longitude);
            }}
            pinColor="#FF4D4D"
            title="Selected Spot"
            description={currentLocation.address || 'Selected Location'}
          />
        </MapView>

        {/* Map Header Overlay with Instructions */}
        <View style={styles.mapInstructionPill}>
          <Ionicons name="finger-print" size={13} color="#FF6B00" />
          <Text style={styles.mapInstructionText}>Tap or drag 📍 marker</Text>
        </View>

        {/* Fullscreen Expand Button */}
        <TouchableOpacity
          style={styles.fullscreenBtn}
          activeOpacity={0.8}
          onPress={() => setIsFullScreenModal(true)}
        >
          <Ionicons name="expand" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Button: [ 📍 Use My Current Location ] */}
      <TouchableOpacity
        style={styles.currentLocationBtn}
        activeOpacity={0.8}
        onPress={handleUseCurrentLocation}
        disabled={isLocatingUser}
      >
        {isLocatingUser ? (
          <ActivityIndicator size="small" color="#FF6B00" style={{ marginRight: 8 }} />
        ) : (
          <Ionicons name="navigate" size={16} color="#FF6B00" style={{ marginRight: 8 }} />
        )}
        <Text style={styles.currentLocationBtnText}>
          {isLocatingUser ? 'Finding Your Location...' : 'Use My Current Location'}
        </Text>
      </TouchableOpacity>

      {/* Geolocation Notice (Permission denied / info) */}
      {geoNotice && (
        <View style={styles.geoNoticeCard}>
          <Ionicons name="information-circle" size={16} color="#FBBF24" />
          <Text style={styles.geoNoticeText}>{geoNotice}</Text>
        </View>
      )}

      {/* Selected Location Summary Box */}
      <View
        style={[
          styles.locationSummaryCard,
          isConfirmed && styles.locationSummaryCardConfirmed,
        ]}
      >
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryIconCircle}>
            <Ionicons name="location" size={18} color="#FF6B00" />
          </View>
          <View style={styles.summaryTextGroup}>
            <Text style={styles.summaryHeading}>Selected Location:</Text>
            {isReverseGeocoding ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 2,
                }}
              >
                <ActivityIndicator size="small" color="#FF6B00" />
                <Text style={styles.summaryAddressText}>
                  Fetching address from map...
                </Text>
              </View>
            ) : (
              <Text style={styles.summaryAddressText} numberOfLines={2}>
                {currentLocation.address || 'Tap or drag on the map above'}
              </Text>
            )}

            <View style={styles.coordsRow}>
              <Text style={styles.coordsLabel}>Latitude: </Text>
              <Text style={styles.coordsValue}>
                {currentLocation.latitude.toFixed(4)}
              </Text>
              <Text style={styles.coordsDivider}>•</Text>
              <Text style={styles.coordsLabel}>Longitude: </Text>
              <Text style={styles.coordsValue}>
                {currentLocation.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        </View>

        {/* [Confirm Location] Button */}
        <TouchableOpacity
          style={[
            styles.confirmLocationBtn,
            isConfirmed && styles.confirmLocationBtnDone,
            (!currentLocation.address || isReverseGeocoding) && { opacity: 0.5 },
          ]}
          activeOpacity={0.85}
          disabled={!currentLocation.address || isReverseGeocoding}
          onPress={handleConfirmLocation}
        >
          <Ionicons
            name={isConfirmed ? 'checkmark-circle' : 'checkmark-sharp'}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.confirmLocationBtnText}>
            {isConfirmed ? 'Location Confirmed ✓' : 'Confirm Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Validation Error Banner */}
      {error && !isConfirmed ? (
        <View style={styles.validationErrorRow}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.validationErrorText}>{error}</Text>
        </View>
      ) : null}

      {/* Fullscreen Interactive Map Modal */}
      <Modal
        visible={isFullScreenModal}
        animationType="slide"
        onRequestClose={() => setIsFullScreenModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsFullScreenModal(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Select Spot on Map</Text>
            <TouchableOpacity
              style={styles.modalGpsBtn}
              onPress={handleUseCurrentLocation}
              disabled={isLocatingUser}
            >
              <Ionicons name="navigate" size={18} color="#FF6B00" />
            </TouchableOpacity>
          </View>

          {/* Modal Search Bar */}
          <View style={styles.modalSearchWrapper}>
            <Ionicons name="search" size={16} color="#FF6B00" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search location..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={(txt) => {
                setSearchQuery(txt);
                if (txt.length > 2) handleSearchSubmit();
                if (!txt) setSuggestions([]);
              }}
              onSubmitEditing={handleSearchSubmit}
            />
          </View>

          {/* Modal Suggestions List */}
          {suggestions.length > 0 && (
            <View style={styles.modalSuggestionsCard}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.place_id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Ionicons name="location-sharp" size={16} color="#FF6B00" style={{ marginRight: 8 }} />
                  <Text style={styles.suggestionText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Fullscreen Map Canvas */}
          <View style={styles.modalMapWrapper}>
            <MapView
              ref={modalMapRef}
              provider={mapProvider}
              style={StyleSheet.absoluteFill}
              customMapStyle={DARK_MAP_STYLE}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              onPress={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                updateCoordinates(latitude, longitude);
              }}
              showsUserLocation={hasLocationPermission}
              showsMyLocationButton={false}
              showsCompass={true}
            >
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                draggable
                onDragEnd={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  updateCoordinates(latitude, longitude);
                }}
                pinColor="#FF4D4D"
                title="Selected Spot"
                description={currentLocation.address || 'Selected Location'}
              />
            </MapView>
          </View>

          {/* Modal Bottom Confirm Bar */}
          <View style={styles.modalBottomBar}>
            <View style={styles.modalAddressGroup}>
              <Text style={styles.modalAddressLabel}>Selected Location:</Text>
              <Text style={styles.modalAddressText} numberOfLines={2}>
                {currentLocation.address || 'Tap or drag on map to select spot'}
              </Text>
              <Text style={styles.modalCoordsText}>
                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.modalConfirmBtn,
                (!currentLocation.address || isReverseGeocoding) && { opacity: 0.5 },
              ]}
              disabled={!currentLocation.address || isReverseGeocoding}
              onPress={handleConfirmLocation}
            >
              <Text style={styles.modalConfirmBtnText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  requiredIndicator: {
    color: '#8A8F9B',
    fontSize: 11,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  confirmedBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 14,
  },
  searchBoxRow: {
    marginBottom: 8,
  },
  searchBoxInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchBoxInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  searchErrorText: {
    color: '#F87171',
    fontSize: 11,
    marginBottom: 8,
  },
  suggestionsCard: {
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    maxHeight: 160,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionText: {
    color: '#E5E7EB',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  mapContainer: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    position: 'relative',
    backgroundColor: '#12141A',
    marginBottom: 10,
  },
  mapContainerError: {
    borderColor: '#EF4444',
  },
  mapInstructionPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10, 11, 14, 0.82)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  mapInstructionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  fullscreenBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 11, 14, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FF6B00',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  currentLocationBtnText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '700',
  },
  geoNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  geoNoticeText: {
    color: '#FBBF24',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  locationSummaryCard: {
    backgroundColor: '#161922',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  locationSummaryCardConfirmed: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  summaryIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryHeading: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  summaryAddressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  coordsLabel: {
    color: '#8A8F9B',
    fontSize: 11,
  },
  coordsValue: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '700',
  },
  coordsDivider: {
    color: '#6B7280',
    fontSize: 11,
  },
  confirmLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    paddingVertical: 10,
  },
  confirmLocationBtnDone: {
    backgroundColor: '#10B981',
  },
  confirmLocationBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  validationErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  validationErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalGpsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161922',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  modalSuggestionsCard: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: '#161922',
    zIndex: 100,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FF6B00',
    maxHeight: 180,
  },
  modalMapWrapper: {
    flex: 1,
  },
  modalBottomBar: {
    backgroundColor: '#161922',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  modalAddressGroup: {
    gap: 2,
  },
  modalAddressLabel: {
    color: '#8A8F9B',
    fontSize: 11,
    fontWeight: '600',
  },
  modalAddressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalCoordsText: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default GoogleMapLocationPicker;
