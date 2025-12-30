import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { AlertTriangle, Cloud, Gauge, History, MapPin, Navigation, RefreshCw, Wind } from 'lucide-react';

const mockTyphoonData = {
  name: 'Typhoon CARINA',
  localName: 'Gaemi',
  position: '15.2°N, 120.5°E',
  maxWindSpeed: '185 km/h',
  movement: 'West at 15 km/h',
  intensity: 'Severe Tropical Storm',
  pressure: '960 hPa',
  lastUpdate: new Date().toLocaleString('en-PH', { 
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short'
  }),
  forecast: [
    { time: '24h', position: '16.0°N, 119.0°E', intensity: 'Typhoon' },
    { time: '48h', position: '17.5°N, 117.5°E', intensity: 'Typhoon' },
    { time: '72h', position: '19.0°N, 116.0°E', intensity: 'Severe Tropical Storm' },
  ],
};

export default function TyphoonDashboard() {
  const navigate = useNavigate();
  const [typhoonData, setTyphoonData] = useState(mockTyphoonData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTyphoonData({
        ...mockTyphoonData,
        lastUpdate: new Date().toLocaleString('en-PH', {
          timeZone: 'Asia/Manila',
          dateStyle: 'medium',
          timeStyle: 'short'
        }),
      });
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-950/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-500/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-950/5 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10">
        <Header title="TYPHOON DASHBOARD" showBack icon={Cloud} />
        
        <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
          {/* Monitoring Alert */}
          <div className="relative bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-lg" data-testid="typhoon-alert">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-100/10 rounded-xl"></div>
            <div className="relative z-10">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            </div>
            <div className="relative z-10">
              <h2 className="text-blue-950 font-bold text-lg">TYPHOON MONITORING</h2>
              <p className="text-blue-950/70 text-sm">Active weather disturbance detected</p>
            </div>
          </div>

          {/* Satellite Image */}
          <div className="satellite-container bg-white border-2 border-blue-950/20 rounded-xl overflow-hidden shadow-lg" data-testid="satellite-container">
            <div className="p-3 bg-gradient-to-r from-blue-950 to-blue-800 border-b flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Live Update Himawari-8 Satellite Image</span>
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-full hover:bg-blue-800 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                data-testid="refresh-btn"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="relative">
              <img
                src="https://src.meteopilipinas.gov.ph/repo/mtsat-colored/24hour/latest-him-colored.gif"
                alt="Himawari-8 Satellite Image"
                className="w-full h-auto"
                data-testid="satellite-image"
              />
              {/* Philippines boundary overlay indicator */}
              <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Philippine Area of Responsibility
              </div>
            </div>
          </div>

          {/* Typhoon Tracking */}
          <div className="bg-white border-2 border-blue-950/20 rounded-xl overflow-hidden shadow-lg" data-testid="typhoon-tracking">
            <div className="p-4 bg-gradient-to-r from-yellow-500 to-yellow-400 border-b border-yellow-200">
              <h3 className="text-blue-950 font-bold text-lg">Typhoon Tracking</h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-blue-950" />
                <span className="text-blue-950/80 text-xs">
                  As of: {new Date().toLocaleTimeString('en-PH', { 
                    timeZone: 'Asia/Manila',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}, {new Date().toLocaleDateString('en-PH', { 
                    timeZone: 'Asia/Manila',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} • Coordinates: {typhoonData.position}
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-blue-950/10">
              <InfoRow 
                label="Typhoon Name" 
                value={`${typhoonData.name} (${typhoonData.localName})`}
                highlight={true}
              />
              <InfoRow label="As of" value="03:00 AM, Dec 31, 2025" />
              <InfoRow label="Coordinates" value={typhoonData.position} />
              <InfoRow label="Current Location" value="East of Luzon" />
              <InfoRow label="Max Wind Speed" value={typhoonData.maxWindSpeed} icon={Wind} />
              <InfoRow label="Movement" value={typhoonData.movement} icon={Navigation} />
              <InfoRow label="Intensity" value={typhoonData.intensity} icon={Gauge} highlight={true} />
              <InfoRow label="Central Pressure" value={typhoonData.pressure} />
            </div>
          </div>

          {/* Forecast Track */}
          <div className="bg-white border-2 border-blue-950/20 rounded-xl overflow-hidden shadow-lg" data-testid="forecast-track">
            <div className="p-4 bg-gradient-to-r from-blue-950 to-blue-800 border-b border-blue-200">
              <h3 className="text-white font-bold text-lg">Forecast Track</h3>
            </div>
            
            <div className="p-4 space-y-3">
              {typhoonData.forecast.map((point, index) => (
                <div 
                  key={point.time}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-950/10"
                  data-testid={`forecast-${point.time}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}>
                      {point.time}
                    </div>
                    <span className="text-blue-950/70 text-sm">{point.position}</span>
                  </div>
                  <span className="text-blue-950 font-medium text-sm">{point.intensity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Last Update */}
          <p className="text-center text-blue-950/60 text-xs" data-testid="last-update">
            Last updated: {typhoonData.lastUpdate}
          </p>

          {/* Historical Data Link */}
          <button
            onClick={() => navigate('/typhoon-history')}
            className="w-full bg-gradient-to-r from-blue-950 to-blue-800 text-white font-semibold py-4 rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            data-testid="view-history-btn"
          >
            <History className="w-5 h-5" />
            <span>View Typhoon History & Analytics</span>
          </button>
        </main>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, highlight }) {
  return (
    <div className="flex items-center justify-between p-4 typhoon-info-card hover:bg-blue-50 transition-colors">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-blue-950" />}
        <span className="text-blue-950/70 text-sm">{label}</span>
      </div>
      <span className={`font-semibold text-sm ${highlight ? 'text-red-600' : 'text-blue-950'}`}>
        {value}
      </span>
    </div>
  );
}