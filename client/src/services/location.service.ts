export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  latitude: number;
  longitude: number;
  distance?: number;
}

export const locationService = {
  // Get current position using browser Geolocation API
  getCurrentPosition: (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Failed to get location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  },

  // Reverse geocode using OpenStreetMap Nominatim (FREE)
  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  },

  // Search nearby places using OpenStreetMap Overpass API (FREE)
  searchNearbyPlaces: async (
    lat: number,
    lng: number,
    radius: number = 5000
  ): Promise<NearbyPlace[]> => {
    try {
      // Search for mobile phone repair shops using OpenStreetMap
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["shop"="mobile_phone"](around:${radius},${lat},${lng});node["shop"="electronics"](around:${radius},${lat},${lng});node["phone_repair"="yes"](around:${radius},${lat},${lng});node["repair"="mobile_phone"](around:${radius},${lat},${lng}););out;`;
      
      const response = await fetch(overpassUrl);
      
      if (!response.ok) {
        throw new Error('Failed to search nearby places');
      }
      
      const data = await response.json();
      
      const places: NearbyPlace[] = data.elements.map((element: any) => {
        const tags = element.tags || {};
        return {
          id: element.id.toString(),
          name: tags.name || tags.shop || 'Unknown Shop',
          address: tags['addr:street'] 
            ? `${tags['addr:street']}, ${tags['addr:city'] || ''}`
            : 'Address not available',
          phone: tags.phone || undefined,
          rating: tags.rating ? parseFloat(tags.rating) : undefined,
          latitude: element.lat,
          longitude: element.lon,
          distance: calculateDistance(lat, lng, element.lat, element.lon),
        };
      });

      // Filter out duplicates and sort by distance
      const uniquePlaces = places.filter((place, index, self) =>
        index === self.findIndex((p) => p.id === place.id)
      );

      return uniquePlaces
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
        .slice(0, 10);

    } catch (error) {
      console.error('Search nearby places error:', error);
      return [];
    }
  },

  // Search by text using Nominatim (FREE)
  searchByText: async (
    query: string,
    lat: number,
    lng: number,
    radius: number = 5000
  ): Promise<NearbyPlace[]> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&lat=${lat}&lon=${lng}&radius=${radius}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      return data.map((item: any) => ({
        id: item.place_id.toString(),
        name: item.display_name.split(',')[0] || 'Unknown',
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        distance: calculateDistance(lat, lng, parseFloat(item.lat), parseFloat(item.lon)),
      }));
    } catch (error) {
      console.error('Search by text error:', error);
      return [];
    }
  },
};

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}