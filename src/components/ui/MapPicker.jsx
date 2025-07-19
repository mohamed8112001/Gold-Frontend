import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card.jsx';
import { Button } from './button.jsx';
import { MapPin, Locate, Search } from 'lucide-react';
import { Input } from './input.jsx';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ latitude: lat, longitude: lng });
    },
  });
  return null;
};

const MapPicker = ({
  latitude = 30.0444, // Default to Cairo, Egypt
  longitude = 31.2357,
  onLocationChange,
  height = '400px',
  showSearch = true,
  showCurrentLocation = true,
  disabled = false,
  className = ''
}) => {
  const [position, setPosition] = useState([latitude, longitude]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const handleLocationSelect = ({ latitude: lat, longitude: lng }) => {
    if (disabled) return;

    const newPosition = [lat, lng];
    setPosition(newPosition);

    if (onLocationChange) {
      onLocationChange({ latitude: lat, longitude: lng });
    }
  };

  const getCurrentLocation = () => {
    if (disabled || !navigator.geolocation) return;

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        handleLocationSelect({ latitude: lat, longitude: lng });

        // Center map on current location
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Cannot get your current location. Please allow location access.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim() || disabled) return;

    setIsSearching(true);
    try {
      // Using Nominatim API for geocoding (free alternative to Google Maps)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=eg`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        handleLocationSelect({ latitude, longitude });

        // Center map on searched location
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
        }
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching for location');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Choose Location on Map
        </CardTitle>
        <CardDescription>
          Click on the map to select shop location or use search tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Location Controls */}
        {(showSearch || showCurrentLocation) && (
          <div className="flex gap-2">
            {showSearch && (
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search for location (e.g: Cairo, Alexandria)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={disabled || isSearching}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={searchLocation}
                  disabled={disabled || isSearching || !searchQuery.trim()}
                >
                  <Search className="w-4 h-4" />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            )}

            {showCurrentLocation && (
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={disabled || isGettingLocation}
              >
                <Locate className="w-4 h-4 mr-2" />
                {isGettingLocation ? 'Locating...' : 'Current Location'}
              </Button>
            )}
          </div>
        )}

        {/* Map Container */}
        <div
          style={{ height }}
          className={`rounded-lg overflow-hidden border ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {!disabled && (
              <MapClickHandler onLocationSelect={handleLocationSelect} />
            )}

            <Marker position={position} icon={customIcon} />
          </MapContainer>
        </div>

        {/* Location Info */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Selected Location:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Latitude: {position[0].toFixed(6)}</div>
            <div>Longitude: {position[1].toFixed(6)}</div>
          </div>
        </div>

        {!disabled && (
          <p className="text-xs text-gray-500 text-center">
            💡 Tip: Click anywhere on the map to select shop location
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MapPicker;
