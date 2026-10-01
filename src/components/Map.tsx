// components/Map.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import  'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers using CDN URLs
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = () => {
  const patnaCoordinates = {
    lat: 25.5941,
    lng: 85.1376
  };

  return (
    <div className="rounded-lg overflow-hidden h-64 -z-10">
      <MapContainer
        center={[patnaCoordinates.lat, patnaCoordinates.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[patnaCoordinates.lat, patnaCoordinates.lng]}>
          <Popup>
            <div className="text-center">
              <strong>Vereda Digital Technologies</strong><br />
              Sinha Library Road, Venture Park<br />
              Patna, Bihar 800001
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;