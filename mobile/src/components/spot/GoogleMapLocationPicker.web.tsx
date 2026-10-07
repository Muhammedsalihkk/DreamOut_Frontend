import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

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

interface SearchSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Generate unique DOM ID for container
let mapInstanceCounter = 0;

export const GoogleMapLocationPicker: React.FC<GoogleMapLocationPickerProps> = ({
  value,
  onLocationChange,
  onConfirm,
  initialLocation,
  error,
}) => {
  const containerIdRef = useRef(`google-map-picker-${++mapInstanceCounter}`);

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

  // Reverse geocoding loading
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Leaflet map instance ref on web
  const leafletMapRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);
  const googleMapRef = useRef<any>(null);
  const googleMarkerRef = useRef<any>(null);

  // Synchronize when value changes externally
  useEffect(() => {
    if (value && value.address && value.address !== currentLocation.address) {
      setCurrentLocation(value);
      setIsConfirmed(true);
      if (leafletMapRef.current && leafletMarkerRef.current) {
        leafletMapRef.current.setView([value.latitude, value.longitude], 15);
        leafletMarkerRef.current.setLatLng([value.latitude, value.longitude]);
      }
    }
  }, [value]);

  // Clean formatted address helper
  const cleanAddress = (rawAddress: string): string => {
    if (!rawAddress) return '';
    const parts = rawAddress.split(',').map((p) => p.trim());
    if (parts.length <= 4) return parts.join(', ');
    // Keep first 2 parts (landmark/area) and last 2 parts (state, country)
    return [parts[0], parts[1], parts[parts.length - 2], parts[parts.length - 1]]
      .filter(Boolean)
      .join(', ');
  };

  // Reverse geocode latitude and longitude to get real address
  const reverseGeocode = useCallback(
    async (lat: number, lon: number): Promise<string> => {
      setIsReverseGeocoding(true);
      try {
        // If Google Maps Geocoder is loaded and API key is active
        if (
          Platform.OS === 'web' &&
          typeof window !== 'undefined' &&
          (window as any).google?.maps?.Geocoder
        ) {
          const geocoder = new (window as any).google.maps.Geocoder();
          const response = await new Promise<string>((resolve) => {
            geocoder.geocode({ location: { lat, lng: lon } }, (results: any, status: any) => {
              if (status === 'OK' && results && results[0]) {
                resolve(results[0].formatted_address);
              } else {
                resolve('');
              }
            });
          });
          if (response) {
            setIsReverseGeocoding(false);
            return cleanAddress(response);
          }
        }

        // OpenStreetMap Nominatim reverse geocode (robust, worldwide, zero key needed)
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
  // WEB INTERACTIVE MAP SETUP (Google Maps JS API or Leaflet with Google Tiles)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    let isMounted = true;
    const containerId = containerIdRef.current;
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    const initMap = () => {
      const container = document.getElementById(containerId);
      if (!container || !isMounted) return;

      // 1. If Google Maps SDK is loaded with API Key
      if (apiKey && (window as any).google?.maps?.Map) {
        const google = (window as any).google;
        const center = { lat: currentLocation.latitude, lng: currentLocation.longitude };

        const map = new google.maps.Map(container, {
          center,
          zoom: 14,
          mapTypeId: 'roadmap',
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
          ],
        });

        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        // Click anywhere on the map
        map.addListener('click', (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          marker.setPosition({ lat, lng });
          updateCoordinates(lat, lng);
        });

        // Drag marker
        marker.addListener('dragend', (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          updateCoordinates(lat, lng);
        });

        googleMapRef.current = map;
        googleMarkerRef.current = marker;
        return;
      }

      // 2. Leaflet Map with Google Maps Tiles (Authentic Google Maps visuals with click & drag)
      if ((window as any).L) {
        const L = (window as any).L;

        // Clean up previous instance if any
        if (leafletMapRef.current) {
          try {
            leafletMapRef.current.remove();
          } catch {}
        }

        const map = L.map(containerId, {
          center: [currentLocation.latitude, currentLocation.longitude],
          zoom: 14,
          zoomControl: true,
        });

        // Google Maps Standard Road Map Tiles
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          attribution: 'Google Maps',
        }).addTo(map);

        // Custom styled Google Pin
        const pinIcon = L.divIcon({
          className: 'gmap-pin-custom',
          html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:42px;transform:translate(-50%, -100%);cursor:grab;">
            <svg width="34" height="42" viewBox="0 0 24 24" fill="#FF4D4D" stroke="#FFFFFF" stroke-width="1.8" filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.4))">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.8" fill="#FFFFFF"/>
            </svg>
          </div>`,
          iconSize: [0, 0],
        });

        const marker = L.marker([currentLocation.latitude, currentLocation.longitude], {
          draggable: true,
          icon: pinIcon,
        }).addTo(map);

        // Click anywhere on map to select location
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          updateCoordinates(lat, lng);
        });

        // Drag marker to adjust exact location
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          updateCoordinates(pos.lat, pos.lng);
        });

        leafletMapRef.current = map;
        leafletMarkerRef.current = marker;
      }
    };

    // Load Leaflet dynamically if not loaded
    if (!(window as any).L && !document.getElementById('leaflet-script')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.id = 'leaflet-script';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        if (isMounted) initMap();
      };
      document.head.appendChild(script);
    } else {
      setTimeout(initMap, 150);
    }

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch {}
      }
    };
  }, []); // Run on mount

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

    // Center map and update marker
    if (leafletMapRef.current && leafletMarkerRef.current) {
      leafletMapRef.current.setView([lat, lon], 15);
      leafletMarkerRef.current.setLatLng([lat, lon]);
    }
    if (googleMapRef.current && googleMarkerRef.current) {
      googleMapRef.current.panTo({ lat, lng: lon });
      googleMarkerRef.current.setPosition({ lat, lng: lon });
    }

    updateCoordinates(lat, lon, address);
  };

  // ─────────────────────────────────────────────────────────────
  // USE MY CURRENT LOCATION (Geolocation API)
  // ─────────────────────────────────────────────────────────────
  const handleUseCurrentLocation = () => {
    setGeoNotice(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setIsLocatingUser(false);
        setGeoNotice(null);

        // Center map and marker
        if (leafletMapRef.current && leafletMarkerRef.current) {
          leafletMapRef.current.setView([lat, lon], 16);
          leafletMarkerRef.current.setLatLng([lat, lon]);
        }
        if (googleMapRef.current && googleMarkerRef.current) {
          googleMapRef.current.panTo({ lat, lng: lon });
          googleMarkerRef.current.setPosition({ lat, lng: lon });
        }

        updateCoordinates(lat, lon);
      },
      (err) => {
        setIsLocatingUser(false);
        let msg = 'Location permission denied. You can search or tap on the map to choose a location.';
        if (err.code === 2) msg = 'Current position unavailable. Please search manually.';
        if (err.code === 3) msg = 'Location request timed out. Please try again.';
        setGeoNotice(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
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
  };

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
              <Ionicons name="location-sharp" size={16} color="#FF6B00" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={styles.suggestionText} numberOfLines={2}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Map Viewport Area */}
      <View style={[styles.mapContainer, Boolean(error) && !isConfirmed && styles.mapContainerError]}>
        <div
          id={containerIdRef.current}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '260px',
            borderRadius: '16px',
            backgroundColor: '#161922',
          }}
        />

        {/* Map Header Overlay with Instructions */}
        <View style={styles.mapInstructionPill}>
          <Ionicons name="finger-print" size={13} color="#FF6B00" />
          <Text style={styles.mapInstructionText}>Click anywhere or drag 📍 marker</Text>
        </View>
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
      <View style={[styles.locationSummaryCard, isConfirmed && styles.locationSummaryCardConfirmed]}>
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryIconCircle}>
            <Ionicons name="location" size={18} color="#FF6B00" />
          </View>
          <View style={styles.summaryTextGroup}>
            <Text style={styles.summaryHeading}>Selected Location:</Text>
            {isReverseGeocoding ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <ActivityIndicator size="small" color="#FF6B00" />
                <Text style={styles.summaryAddressText}>Fetching address from map...</Text>
              </View>
            ) : (
              <Text style={styles.summaryAddressText} numberOfLines={2}>
                {currentLocation.address || 'Select a point on the map above'}
              </Text>
            )}

            <View style={styles.coordsRow}>
              <Text style={styles.coordsLabel}>Latitude: </Text>
              <Text style={styles.coordsValue}>{currentLocation.latitude.toFixed(4)}</Text>
              <Text style={styles.coordsDivider}>•</Text>
              <Text style={styles.coordsLabel}>Longitude: </Text>
              <Text style={styles.coordsValue}>{currentLocation.longitude.toFixed(4)}</Text>
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
    zIndex: 1000,
  },
  mapInstructionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
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
});
export default GoogleMapLocationPicker;
