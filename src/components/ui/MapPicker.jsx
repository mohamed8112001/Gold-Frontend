import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card.jsx';
import { Button } from './button.jsx';
import { MapPin, Locate, Search } from 'lucide-react';
import { Input } from './input.jsx';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
  latitude = 30.0444,
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
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('خطأ في الحصول على الموقع:', error);
        alert('تعذر تحديد موقعك الحالي. يرجى السماح بالوصول إلى الموقع.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim() || disabled) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=eg`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        handleLocationSelect({ latitude, longitude });
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
        }
      } else {
        alert('لم يتم العثور على الموقع المطلوب');
      }
    } catch (error) {
      console.error('خطأ أثناء البحث:', error);
      alert('حدث خطأ أثناء البحث عن الموقع');
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
          اختر الموقع على الخريطة
        </CardTitle>
        <CardDescription>
          انقر على الخريطة لتحديد موقع المتجر أو استخدم أدوات البحث
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(showSearch || showCurrentLocation) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {showSearch && (
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="ابحث عن الموقع (مثال: القاهرة، الإسكندرية)"
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
                  {isSearching ? 'جارٍ البحث...' : 'بحث'}
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
                {isGettingLocation ? 'جارٍ التحديد...' : 'موقعي الحالي'}
              </Button>
            )}
          </div>
        )}

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
            {!disabled && <MapClickHandler onLocationSelect={handleLocationSelect} />}
            <Marker position={position} icon={customIcon} />
          </MapContainer>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">الموقع المحدد:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>خط العرض: {position[0].toFixed(6)}</div>
            <div>خط الطول: {position[1].toFixed(6)}</div>
          </div>
        </div>

        {!disabled && (
          <p className="text-xs text-gray-500 text-center">
            💡 نصيحة: انقر في أي مكان على الخريطة لاختيار موقع المتجر
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MapPicker;
