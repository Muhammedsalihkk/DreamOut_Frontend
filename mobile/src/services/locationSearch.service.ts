import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationSearchResult {
  place_id: number | string;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  distanceKm?: number;
  category?: string;
}

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class LocationSearchService {
  /**
   * Search places prioritizing hyper-local places near the user/map center.
   * Multi-strategy:
   * 1. Native device Google/Apple geocoder (knows local businesses & hotels like "Edele Hotel")
   * 2. OpenStreetMap Nominatim with regional viewbox & countrycode
   * 3. Photon with regional bounding box to eliminate random international false positives
   * 4. Distance sorting ensuring closest places always appear first
   */
  static async searchPlaces(
    query: string,
    currentCoords?: { latitude: number; longitude: number }
  ): Promise<LocationSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    // Default to Kozhikode / Calicut coordinates if none provided
    const lat = currentCoords?.latitude ?? 11.2588;
    const lon = currentCoords?.longitude ?? 75.7804;

    const isIndia = lat >= 6 && lat <= 38 && lon >= 68 && lon <= 98;
    const allResults: LocationSearchResult[] = [];
    const seenCoordinates = new Set<string>();

    const addResult = (res: LocationSearchResult) => {
      const coordKey = `${parseFloat(res.lat).toFixed(4)},${parseFloat(res.lon).toFixed(4)}`;
      if (!seenCoordinates.has(coordKey)) {
        seenCoordinates.add(coordKey);
        allResults.push(res);
      }
    };

    // ─────────────────────────────────────────────────────────────
    // STRATEGY 1: NATIVE DEVICE GEOCODER (Android / iOS)
    // Google Play Services on Android has by far the highest coverage
    // for small local hotels, restaurants, shops, and landmarks in India.
    // ─────────────────────────────────────────────────────────────
    if (Platform.OS !== 'web') {
      try {
        let geoLocations: Location.LocationGeocodedLocation[] = [];

        // 1a. Try raw query first
        try {
          geoLocations = await Location.geocodeAsync(cleanQuery);
        } catch {
          // Ignore and continue
        }

        // 1b. If raw query returned nothing, get current city/region and try contextual query
        if (!geoLocations || geoLocations.length === 0) {
          try {
            let localCity = isIndia ? 'Kozhikode' : '';
            let localRegion = isIndia ? 'Kerala' : '';

            try {
              const currentRev = await Location.reverseGeocodeAsync({
                latitude: lat,
                longitude: lon,
              });
              if (currentRev && currentRev.length > 0) {
                const r0 = currentRev[0];
                if (r0.city || r0.subregion || r0.district) {
                  localCity = r0.city || r0.subregion || r0.district || localCity;
                }
                if (r0.region) {
                  localRegion = r0.region || localRegion;
                }
              }
            } catch {
              // use default fallback
            }

            if (
              localCity &&
              !cleanQuery.toLowerCase().includes(localCity.toLowerCase())
            ) {
              const contextualQuery = `${cleanQuery}, ${localCity}, ${localRegion}`;
              geoLocations = await Location.geocodeAsync(contextualQuery);
            }
          } catch {
            // Ignore
          }
        }

        if (geoLocations && geoLocations.length > 0) {
          const topCoords = geoLocations.slice(0, 5);
          for (let i = 0; i < topCoords.length; i++) {
            const c = topCoords[i];
            let addressName = cleanQuery;
            let displayName = cleanQuery;

            try {
              const revList = await Location.reverseGeocodeAsync({
                latitude: c.latitude,
                longitude: c.longitude,
              });

              if (revList && revList.length > 0) {
                const r = revList[0];
                addressName = r.name || cleanQuery;
                const parts = [
                  r.name && r.name !== cleanQuery ? r.name : cleanQuery,
                  r.street,
                  r.district || r.subregion,
                  r.city,
                  r.region,
                  r.country,
                ].filter(Boolean);

                displayName = Array.from(new Set(parts)).join(', ');
              }
            } catch {
              displayName = `${cleanQuery} (${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)})`;
            }

            const dist = calculateDistanceKm(lat, lon, c.latitude, c.longitude);
            // In India, ignore any geocoder match outside India (> 2500 km)
            if (!isIndia || dist < 2500) {
              addResult({
                place_id: `native-${i}-${c.latitude.toFixed(5)}`,
                name: addressName,
                display_name: displayName,
                lat: String(c.latitude),
                lon: String(c.longitude),
                distanceKm: dist,
              });
            }
          }

          // If we found local matches within 300km, return them sorted by proximity!
          const localNative = allResults.filter((r) => (r.distanceKm || 0) < 300);
          if (localNative.length > 0) {
            localNative.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
            return localNative;
          }
        }
      } catch (nativeErr) {
        console.warn('[LocationSearch] Native geocoding attempt error:', nativeErr);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // STRATEGY 2: REGION-BOUNDED PHOTON (OSM with local bbox)
    // Using &bbox guarantees results stay within the current region
    // (±1.5 degrees ~ 160 km around map center).
    // This strictly eliminates distant European results (Romania, Spain, etc.)
    // ─────────────────────────────────────────────────────────────
    try {
      const minLon = lon - 1.5;
      const maxLon = lon + 1.5;
      const minLat = lat - 1.5;
      const maxLat = lat + 1.5;
      const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

      const localPhotonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        cleanQuery
      )}&lat=${lat}&lon=${lon}&bbox=${bbox}&limit=8`;

      const res = await fetch(localPhotonUrl, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'DreamOutApp/1.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.features) && data.features.length > 0) {
          for (let i = 0; i < data.features.length; i++) {
            const feat = data.features[i];
            const p = feat.properties || {};
            const coords = feat.geometry?.coordinates || [lon, lat];
            const name = p.name || cleanQuery;

            const parts = [
              p.name,
              p.street,
              p.locality || p.district,
              p.city || p.county,
              p.state,
              p.country,
            ]
              .filter(Boolean)
              .filter((val, idx, arr) => arr.indexOf(val) === idx);

            const itemLat = Number(coords[1]);
            const itemLon = Number(coords[0]);
            const dist = calculateDistanceKm(lat, lon, itemLat, itemLon);

            addResult({
              place_id: p.osm_id || `photon-local-${i}`,
              name,
              display_name: parts.length > 0 ? parts.join(', ') : name,
              lat: String(itemLat),
              lon: String(itemLon),
              distanceKm: dist,
            });
          }

          if (allResults.length > 0) {
            allResults.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
            return allResults;
          }
        }
      }
    } catch (photonBboxErr) {
      console.warn('[LocationSearch] Regional Photon bbox error:', photonBboxErr);
    }

    // ─────────────────────────────────────────────────────────────
    // STRATEGY 3: OPENSTREETMAP NOMINATIM (India-focused + local viewbox)
    // ─────────────────────────────────────────────────────────────
    try {
      const minLon = lon - 1.2;
      const maxLon = lon + 1.2;
      const minLat = lat - 1.2;
      const maxLat = lat + 1.2;
      const viewbox = `${minLon},${maxLat},${maxLon},${minLat}`;

      const queriesToTry = [cleanQuery];
      if (
        isIndia &&
        !cleanQuery.toLowerCase().includes('calicut') &&
        !cleanQuery.toLowerCase().includes('kozhikode') &&
        !cleanQuery.toLowerCase().includes('kerala')
      ) {
        queriesToTry.push(`${cleanQuery} Kozhikode`);
        queriesToTry.push(`${cleanQuery} Kerala`);
      }

      for (const q of queriesToTry) {
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&countrycodes=${isIndia ? 'in' : ''}&viewbox=${viewbox}&bounded=0&limit=8&addressdetails=1`;

        const res = await fetch(nomUrl, {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'DreamOutApp/1.0',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            data.forEach((item: any) => {
              const itemLat = parseFloat(item.lat);
              const itemLon = parseFloat(item.lon);
              const dist = calculateDistanceKm(lat, lon, itemLat, itemLon);

              // Ignore places > 2500 km away when user is in India
              if (!isIndia || dist < 2500) {
                addResult({
                  place_id: item.place_id,
                  name: item.name || item.display_name.split(',')[0],
                  display_name: item.display_name,
                  lat: String(itemLat),
                  lon: String(itemLon),
                  distanceKm: dist,
                });
              }
            });

            if (allResults.length > 0) {
              allResults.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
              return allResults;
            }
          }
        }
      }
    } catch (nomErr) {
      console.warn('[LocationSearch] Nominatim local search error:', nomErr);
    }

    // ─────────────────────────────────────────────────────────────
    // STRATEGY 4: GENERAL PHOTON WITH STRICT DISTANCE FILTERING
    // Fallback if local searches had 0 results.
    // ─────────────────────────────────────────────────────────────
    try {
      const globalPhotonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        cleanQuery
      )}&lat=${lat}&lon=${lon}&limit=8`;

      const res = await fetch(globalPhotonUrl, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'DreamOutApp/1.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.features)) {
          data.features.forEach((feat: any, idx: number) => {
            const p = feat.properties || {};
            const coords = feat.geometry?.coordinates || [lon, lat];
            const name = p.name || cleanQuery;
            const parts = [
              p.name,
              p.street,
              p.locality || p.district,
              p.city || p.county,
              p.state,
              p.country,
            ]
              .filter(Boolean)
              .filter((val, i, arr) => arr.indexOf(val) === i);

            const itemLat = Number(coords[1]);
            const itemLon = Number(coords[0]);
            const dist = calculateDistanceKm(lat, lon, itemLat, itemLon);

            // Filter out foreign results if in India and no explicit international keyword
            const isExplicitInternational = /(usa|america|uk|london|dubai|uae|spain|italy|germany|france|europe|singapore)/i.test(
              cleanQuery
            );
            if (!isIndia || isExplicitInternational || dist < 2500) {
              addResult({
                place_id: p.osm_id || idx + 5000,
                name,
                display_name: parts.length > 0 ? parts.join(', ') : name,
                lat: String(itemLat),
                lon: String(itemLon),
                distanceKm: dist,
              });
            }
          });
        }
      }
    } catch (globalErr) {
      console.warn('[LocationSearch] General Photon error:', globalErr);
    }

    // Sort all accumulated results by proximity to the map coordinates
    allResults.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    return allResults.slice(0, 8);
  }
}
