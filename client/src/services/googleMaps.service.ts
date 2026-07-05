const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface NearbyPlace {
  googlePlaceId: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  latitude: number;
  longitude: number;
}

export const googleMapsService = {
  loadGoogleMaps: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).google) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  },

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

  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    try {
      await googleMapsService.loadGoogleMaps();
      
      const geocoder = new (window as any).google.maps.Geocoder();
      const latLng = new (window as any).google.maps.LatLng(lat, lng);
      
      const result = await new Promise<any[]>((resolve, reject) => {
        geocoder.geocode(
          { location: latLng },
          (results: any[], status: string) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });
      
      return result[0]?.formatted_address || `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return `${lat}, ${lng}`;
    }
  },

  searchByText: async (
    query: string,
    lat: number,
    lng: number,
    radius: number = 5000
  ): Promise<NearbyPlace[]> => {
    try {
      await googleMapsService.loadGoogleMaps();
      
      const service = new (window as any).google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      const request = {
        location: new (window as any).google.maps.LatLng(lat, lng),
        radius: radius,
        query: query,
      };
      
      const results = await new Promise<any[]>((resolve, reject) => {
        service.textSearch(
          request,
          (results: any[] | null, status: string) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Text search failed: ${status}`));
            }
          }
        );
      });
      
      const nearbyPlaces: NearbyPlace[] = results.slice(0, 10).map((place: any) => ({
        googlePlaceId: place.place_id,
        name: place.name || 'Unknown',
        address: place.formatted_address || 'Unknown',
        rating: place.rating || undefined,
        latitude: place.geometry?.location?.lat() || lat,
        longitude: place.geometry?.location?.lng() || lng,
      }));
      
      return nearbyPlaces;
    } catch (error) {
      console.error('Search by text error:', error);
      throw error;
    }
  },

  searchNearbyServiceCenters: async (
    lat: number,
    lng: number,
    radius: number = 5000
  ): Promise<NearbyPlace[]> => {
    try {
      await googleMapsService.loadGoogleMaps();
      
      const service = new (window as any).google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      const request = {
        location: new (window as any).google.maps.LatLng(lat, lng),
        radius: radius,
        type: 'electronics_store',
        keyword: 'mobile repair phone repair',
      };
      
      const results = await new Promise<any[]>((resolve, reject) => {
        service.nearbySearch(
          request,
          (results: any[] | null, status: string) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Places search failed: ${status}`));
            }
          }
        );
      });
      
      const nearbyPlaces: NearbyPlace[] = results.slice(0, 10).map((place: any) => ({
        googlePlaceId: place.place_id,
        name: place.name || 'Unknown',
        address: place.vicinity || 'Unknown',
        rating: place.rating || undefined,
        latitude: place.geometry?.location?.lat() || lat,
        longitude: place.geometry?.location?.lng() || lng,
      }));
      
      return nearbyPlaces;
    } catch (error) {
      console.error('Search nearby service centers error:', error);
      throw error;
    }
  },

  searchRepairShops: async (
    lat: number,
    lng: number,
    radius: number = 5000
  ): Promise<NearbyPlace[]> => {
    try {
      await googleMapsService.loadGoogleMaps();
      
      const service = new (window as any).google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      const request = {
        location: new (window as any).google.maps.LatLng(lat, lng),
        radius: radius,
        query: 'phone repair shop mobile repair service',
      };
      
      const results = await new Promise<any[]>((resolve, reject) => {
        service.textSearch(
          request,
          (results: any[] | null, status: string) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(`Text search failed: ${status}`));
            }
          }
        );
      });
      
      const nearbyPlaces: NearbyPlace[] = results.slice(0, 10).map((place: any) => ({
        googlePlaceId: place.place_id,
        name: place.name || 'Unknown',
        address: place.formatted_address || 'Unknown',
        rating: place.rating || undefined,
        latitude: place.geometry?.location?.lat() || lat,
        longitude: place.geometry?.location?.lng() || lng,
      }));
      
      return nearbyPlaces;
    } catch (error) {
      console.error('Search repair shops error:', error);
      throw error;
    }
  },
};