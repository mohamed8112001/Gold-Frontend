import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card.jsx';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from './button.jsx';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for shops
const shopIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapDisplay = ({ 
  latitude,
  longitude,
  shopName = 'المتجر',
  shopAddress = '',
  height = '300px',
  zoom = 15,
  showDirections = true,
  showHeader = true,
  className = ''
}) => {
  // Default to Cairo if no coordinates provided
  const lat = latitude || 30.0444;
  const lng = longitude || 31.2357;
  const position = [lat, lng];

  const openDirections = () => {
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const openInMaps = () => {
    // Open location in Google Maps
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Don't render if no valid coordinates
  if (!latitude || !longitude) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              موقع المتجر
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>لم يتم تحديد موقع للمتجر</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            موقع المتجر
          </CardTitle>
          {shopAddress && (
            <CardDescription>{shopAddress}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div 
          style={{ height }} 
          className="rounded-lg overflow-hidden border"
        >
          <MapContainer
            center={position}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
            dragging={true}
            touchZoom={true}
            doubleClickZoom={true}
            boxZoom={true}
            keyboard={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker position={position} icon={shopIcon}>
              <Popup>
                <div className="text-center">
                  <div className="font-semibold mb-1">{shopName}</div>
                  {shopAddress && (
                    <div className="text-sm text-gray-600 mb-2">{shopAddress}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Action Buttons */}
        {showDirections && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openDirections}
              className="flex-1"
            >
              <Navigation className="w-4 h-4 mr-2" />
              الحصول على الاتجاهات
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openInMaps}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              فتح في الخرائط
            </Button>
          </div>
        )}

        {/* Location Info */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">الإحداثيات:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>خط العرض: {lat.toFixed(6)}</div>
            <div>خط الطول: {lng.toFixed(6)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapDisplay;
