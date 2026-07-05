import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { FiMapPin, FiNavigation, FiRefreshCw } from 'react-icons/fi';
import { locationService, Location, NearbyPlace } from '../../../services/location.service';
import toast from 'react-hot-toast';

// Fix default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'blue-marker',
});

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onPlaceSelect?: (place: NearbyPlace) => void;
  initialLocation?: { lat: number; lng: number };
  radius?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  onPlaceSelect,
  initialLocation,
  radius = 1000,
}) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [address, setAddress] = useState<string>('');
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingPlaces, setSearchingPlaces] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
      reverseGeocode(initialLocation.lat, initialLocation.lng);
      searchNearbyPlaces(initialLocation.lat, initialLocation.lng);
    }
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const pos = await locationService.getCurrentPosition();
      setPosition(pos);
      await reverseGeocode(pos.lat, pos.lng);
      await searchNearbyPlaces(pos.lat, pos.lng);
      onLocationSelect({ ...pos, address });
      toast.success('Location detected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const addr = await locationService.reverseGeocode(lat, lng);
      setAddress(addr);
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  const searchNearbyPlaces = async (lat: number, lng: number) => {
    setSearchingPlaces(true);
    try {
      const places = await locationService.searchNearbyPlaces(lat, lng, radius);
      setNearbyPlaces(places);
    } catch (error) {
      console.error('Search places error:', error);
    } finally {
      setSearchingPlaces(false);
    }
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setPosition({ lat, lng });
    reverseGeocode(lat, lng);
    searchNearbyPlaces(lat, lng);
    onLocationSelect({ lat, lng, address });
  };

  const handlePlaceSelect = (place: NearbyPlace) => {
    setPosition({ lat: place.latitude, lng: place.longitude });
    setAddress(place.address);
    onLocationSelect({ 
      lat: place.latitude, 
      lng: place.longitude, 
      address: place.address 
    });
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
    toast.success(`Selected: ${place.name}`);
  };

  // Map center component to update view
  const MapController = ({ center }: { center: { lat: number; lng: number } }) => {
    const map = useMap();
    useEffect(() => {
      map.setView([center.lat, center.lng], 15);
    }, [center, map]);
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Location Controls */}
      <div className="flex gap-2">
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <FiRefreshCw className="animate-spin" />
          ) : (
            <FiNavigation />
          )}
          {loading ? 'Detecting...' : 'Use Current Location'}
        </button>
      </div>

      {/* Map */}
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200">
        <MapContainer
          center={position ? [position.lat, position.lng] : [23.8103, 90.4125]}
          zoom={15}
          className="w-full h-full"
          style={{ height: '100%', width: '100%' }}
          whenReady={() => {
            // Fix default marker icons
            L.Marker.prototype.options.icon = defaultIcon;
          }}
        >
          {position && <MapController center={position} />}
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location marker */}
          {position && (
            <>
              <Circle
                center={[position.lat, position.lng]}
                radius={radius}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
              />
              <Marker
                position={[position.lat, position.lng]}
                icon={blueIcon}
                eventHandlers={{
                  click: () => {
                    toast.info(`Location: ${address || 'Current location'}`);
                  },
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">Your Location</p>
                    <p className="text-gray-600 text-xs">{address || 'Unknown'}</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Nearby places markers */}
          {nearbyPlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={defaultIcon}
              eventHandlers={{
                click: () => handlePlaceSelect(place),
              }}
            >
              <Popup>
                <div className="text-sm max-w-[200px]">
                  <p className="font-semibold">{place.name}</p>
                  <p className="text-gray-600 text-xs">{place.address}</p>
                  {place.rating && (
                    <p className="text-yellow-500 text-xs">⭐ {place.rating}</p>
                  )}
                  {place.distance && (
                    <p className="text-gray-500 text-xs">
                      📍 {(place.distance * 1000).toFixed(0)}m away
                    </p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaceSelect(place);
                    }}
                    className="mt-2 w-full bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Select
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Nearby Places List */}
      {searchingPlaces && (
        <div className="text-center py-4 text-gray-500">
          <FiRefreshCw className="animate-spin mx-auto mb-2" />
          Searching nearby service centers...
        </div>
      )}

      {!searchingPlaces && nearbyPlaces.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-2">Nearby Service Centers:</p>
          {nearbyPlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => handlePlaceSelect(place)}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-all border border-transparent hover:border-blue-200"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">{place.name}</p>
                <p className="text-xs text-gray-500">{place.address}</p>
                {place.distance && (
                  <p className="text-xs text-gray-400">{(place.distance * 1000).toFixed(0)}m away</p>
                )}
              </div>
              {place.rating && (
                <span className="text-sm text-yellow-500">⭐ {place.rating}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {!searchingPlaces && nearbyPlaces.length === 0 && position && (
        <div className="text-center py-4 text-gray-500 text-sm">
          <FiMapPin className="mx-auto mb-2 text-2xl" />
          No service centers found nearby. Try another location.
        </div>
      )}
    </div>
  );
};

export default LocationPicker;