export interface LocationSearchResult {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
}

export class LocationSearchService {
  /**
   * Search places with typo tolerance, proximity boosting (Calicut/Kerala/India),
   * and multi-provider fallback.
   */
  static async searchPlaces(
    query: string,
    currentCoords?: { latitude: number; longitude: number }
  ): Promise<LocationSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    // Default to Calicut / Kozhikode coordinates if none supplied
    const lat = currentCoords?.latitude ?? 11.2588;
    const lon = currentCoords?.longitude ?? 75.7804;

    // 1. Primary: Photon (OSM + Elasticsearch with built-in typo tolerance & proximity)
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        cleanQuery
      )}&lat=${lat}&lon=${lon}&limit=8`;

      const res = await fetch(photonUrl, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'DreamOutApp/1.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.features) && data.features.length > 0) {
          const results: LocationSearchResult[] = data.features.map(
            (feat: any, idx: number) => {
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

              return {
                place_id: p.osm_id || idx + 1000,
                name,
                display_name: parts.length > 0 ? parts.join(', ') : name,
                lat: String(coords[1]),
                lon: String(coords[0]),
              };
            }
          );

          if (results.length > 0) {
            return results;
          }
        }
      }
    } catch (photonErr) {
      console.warn('[LocationSearch] Photon search attempt failed, trying fallback:', photonErr);
    }

    // 2. Secondary: OpenStreetMap Nominatim with India countrycode + local viewbox bias
    try {
      const minLon = lon - 1.5;
      const maxLon = lon + 1.5;
      const minLat = lat - 1.5;
      const maxLat = lat + 1.5;
      const viewbox = `${minLon},${maxLat},${maxLon},${minLat}`;

      const nomIndiaUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanQuery
      )}&countrycodes=in&viewbox=${viewbox}&bounded=0&limit=8&addressdetails=1`;

      const res = await fetch(nomIndiaUrl, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'DreamOutApp/1.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            place_id: item.place_id,
            name: item.name || item.display_name.split(',')[0],
            display_name: item.display_name,
            lat: String(item.lat),
            lon: String(item.lon),
          }));
        }
      }
    } catch (nomErr) {
      console.warn('[LocationSearch] Nominatim India search failed:', nomErr);
    }

    // 3. Tertiary: OpenStreetMap Nominatim global search (for international locations)
    try {
      const globalUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanQuery
      )}&limit=6&addressdetails=1`;

      const res = await fetch(globalUrl, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'DreamOutApp/1.0',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            place_id: item.place_id,
            name: item.name || item.display_name.split(',')[0],
            display_name: item.display_name,
            lat: String(item.lat),
            lon: String(item.lon),
          }));
        }
      }
    } catch (globalErr) {
      console.warn('[LocationSearch] Global search error:', globalErr);
    }

    return [];
  }
}
