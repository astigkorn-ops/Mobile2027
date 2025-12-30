import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Map as MapIcon, Building2, Hospital, Shield, Landmark, Home, Search, Layers, X, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// api removed; using static facilities

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different facility types
const createCustomIcon = (color) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const facilityTypes = [
  { id: 'evacuation', label: 'Evacuation Centers', icon: Home, color: '#22c55e' },
  { id: 'hospital', label: 'Hospitals', icon: Hospital, color: '#ef4444' },
  { id: 'police', label: 'Police Stations', icon: Shield, color: '#3b82f6' },
  { id: 'government', label: 'Government Facilities', icon: Landmark, color: '#8b5cf6' },
];

function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function InteractiveMap() {
  const [activeFilters, setActiveFilters] = useState(['evacuation', 'hospital', 'police', 'government']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [mapCenter, setMapCenter] = useState([13.0547, 123.5214]);
  const [facilities, setFacilities] = useState([]);

  // Initialize static facilities (unlinked from database)
  const initFacilities = () => {
    const staticData = [
      // Evacuation Centers
      { id: 'evac-1', type: 'evacuation', name: 'Pio Duran Evacuation Center', address: 'Brgy. Poblacion, Pio Duran, Albay', lat: 13.0565, lng: 123.5123, capacity: 'Capacity: 300 persons', hotline: '0917-772-5016' },
      { id: 'evac-2', type: 'evacuation', name: 'Community Hall Evac Center', address: 'Brgy. Malipo, Pio Duran, Albay', lat: 13.0471, lng: 123.5302, capacity: 'Capacity: 200 persons' },

      // Hospitals
      { id: 'hosp-1', type: 'hospital', name: 'Pio Duran Memorial District Hospital', address: 'Brgy. Banawan, Pio Duran, Albay', lat: 13.0602, lng: 123.5209, hotline: '0985-317-1769' },
      { id: 'hosp-2', type: 'hospital', name: 'Rural Health Unit Pio Duran', address: 'Brgy. Centro, Pio Duran, Albay', lat: 13.0522, lng: 123.5238, hotline: '0927-943-4663' },

      // Police Stations
      { id: 'pol-1', type: 'police', name: 'PNP - Pio Duran MPS', address: 'Brgy. Centro, Pio Duran, Albay', lat: 13.0538, lng: 123.5201, hotline: '0998-598-5946' },
      { id: 'pol-2', type: 'police', name: 'Maritime Police Substation', address: 'Coastal Area, Pio Duran, Albay', lat: 13.0421, lng: 123.5159, hotline: '0917-500-2325' },

      // Government Facilities
      { id: 'gov-1', type: 'government', name: "Mayor's Office", address: 'Municipal Hall, Pio Duran, Albay', lat: 13.0549, lng: 123.5218, hotline: '0961-690-2026' },
      { id: 'gov-2', type: 'government', name: 'MDRRMO Office', address: 'Municipal Hall Annex, Pio Duran, Albay', lat: 13.0552, lng: 123.5222, hotline: '0917-772-5016' },
      { id: 'gov-3', type: 'government', name: 'BFP - Pio Duran Fire Station', address: 'Brgy. Centro, Pio Duran, Albay', lat: 13.0519, lng: 123.5197, hotline: '0949-889-7134' },
      { id: 'gov-4', type: 'government', name: 'PCG - Pio Duran Sub Station', address: 'Port Area, Pio Duran, Albay', lat: 13.0399, lng: 123.5143, hotline: '0970-667-5457' },
    ];
    setFacilities(staticData);
  };

  useEffect(() => {
    initFacilities();
  }, []);

/**
   * @example
   * toggleFilter('hospital')
   * undefined
   * @param {string} filterId - ID of the filter to toggle (e.g. 'evacuation', 'hospital').
   * @returns {void} Updates the activeFilters React state; no direct return value.
   * @description
   *   - Uses the functional form of the state setter (prev => ...) to avoid stale closures.
   *   - Removes the id when present, otherwise appends it (immutably) to the end of the array.
   *   - Expects filterId to match one of the known facility type ids; triggers a re-render when state changes.
   */
//Loading..
  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesFilter = activeFilters.includes(facility.type);
    const matchesSearch = searchQuery === '' || 
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleFacilityClick = (facility) => {
    setSelectedFacility(facility);
    setMapCenter([facility.lat, facility.lng]);
  };

  const getIconColor = (type) => {
    const facility = facilityTypes.find(f => f.id === type);
    return facility?.color || '#6b7280';
  };

  return (
    <div className="min-h-screen bg-slate-100" data-testid="interactive-map-page">
      <Header title="INTERACTIVE MAP" showBack icon={MapIcon} />
      
      <main className="px-4 py-4 max-w-4xl mx-auto space-y-4">
        {/* Search Bar */}
        <div className="relative" data-testid="search-container">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-700 focus:border-yellow-500 transition-colors"
            data-testid="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              data-testid="clear-search-btn"
            >
              <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2" data-testid="filter-buttons">
          {facilityTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => toggleFilter(type.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilters.includes(type.id)
                  ? 'bg-blue-950 text-white'
                  : 'bg-white text-slate-600 border-2 border-slate-200'
              }`}
              data-testid={`filter-${type.id}`}
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: type.color }}
              />
              <span className="hidden sm:inline">{type.label}</span>
              <type.icon className="w-4 h-4 sm:hidden" />
            </button>
          ))}
        </div>

        {/* Map Container */}
        <div className="map-container h-[350px] md:h-[450px]" data-testid="map-container">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={true}
            attributionControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              minZoom={3}
              tileSize={256}
              detectRetina={true}
            />
            <FlyToLocation center={mapCenter} />
            {filteredFacilities.map((facility) => (
              <Marker
                key={facility.id}
                position={[facility.lat, facility.lng]}
                icon={createCustomIcon(getIconColor(facility.type))}
                eventHandlers={{
                  click: () => handleFacilityClick(facility),
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-blue-950">{facility.name}</h3>
                    <p className="text-slate-600 text-sm">{facility.address}</p>
                    {facility.capacity && (
                      <p className="text-green-600 text-sm mt-1">Capacity: {facility.capacity}</p>
                    )}
                    {facility.services && (
                      <p className="text-blue-600 text-sm mt-1">{facility.services}</p>
                    )}
                    {facility.hotline && (
                      <p className="text-red-600 text-sm mt-1">Hotline: {facility.hotline}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Facilities List */}
        <div className="bg-white rounded-xl overflow-hidden" data-testid="facilities-list">
          <div className="p-4 bg-blue-950 flex items-center justify-between">
            <h3 className="text-yellow-500 font-bold">Nearby Facilities</h3>
            <span className="text-white text-sm">{filteredFacilities.length} found</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
            {filteredFacilities.map((facility) => {
              const typeInfo = facilityTypes.find(t => t.id === facility.type);
              return (
                <button
                  key={facility.id}
                  onClick={() => handleFacilityClick(facility)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left ${
                    selectedFacility?.id === facility.id ? 'bg-yellow-50' : ''
                  }`}
                  data-testid={`facility-item-${facility.id}`}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: typeInfo?.color + '20' }}
                  >
                    {typeInfo && <typeInfo.icon className="w-5 h-5" style={{ color: typeInfo.color }} />}
                  </div>
                  <div>
                    <h4 className="text-blue-950 font-semibold text-sm">{facility.name}</h4>
                    <p className="text-slate-500 text-xs mt-0.5">{facility.address}</p>
                    {facility.capacity && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        {facility.capacity}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl p-4" data-testid="map-legend">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-blue-950" />
            <h4 className="text-blue-950 font-semibold text-sm">Map Legend</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {facilityTypes.map((type) => (
              <div key={type.id} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-slate-600 text-xs">{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
