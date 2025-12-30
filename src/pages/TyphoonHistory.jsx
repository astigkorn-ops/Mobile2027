import { useState } from 'react';
import { Header } from '../components/Header';
import { AlertTriangle, BarChart3, Calendar, TrendingUp, Wind } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const mockTyphoons = [
  {
    id: 1,
    local_name: 'Odette',
    name: 'Rai',
    signal_level: 4,
    created_at: '2021-12-16',
    intensity: 'Super Typhoon',
    max_wind_speed: '195 km/h',
    pressure: '955 hPa',
    position: '10.1°N 124.6°E'
  },
  {
    id: 2,
    local_name: 'Rolly',
    name: 'Goni',
    signal_level: 5,
    created_at: '2020-11-01',
    intensity: 'Super Typhoon',
    max_wind_speed: '225 km/h',
    pressure: '920 hPa',
    position: '13.4°N 123.8°E'
  },
  {
    id: 3,
    local_name: 'Ulysses',
    name: 'Vamco',
    signal_level: 3,
    created_at: '2020-11-11',
    intensity: 'Typhoon',
    max_wind_speed: '140 km/h',
    pressure: '975 hPa',
    position: '15.2°N 121.4°E'
  },
  {
    id: 4,
    local_name: 'Yolanda',
    name: 'Haiyan',
    signal_level: 4,
    created_at: '2013-11-08',
    intensity: 'Super Typhoon',
    max_wind_speed: '315 km/h',
    pressure: '895 hPa',
    position: '11.3°N 124.1°E'
  },
  {
    id: 5,
    local_name: 'Milenyo',
    name: 'Typhoon Xangsane',
    signal_level: 3,
    created_at: '2006-09-28',
    intensity: 'Typhoon',
    max_wind_speed: '165 km/h',
    pressure: '945 hPa',
    position: '14.8°N 121.5°E'
  }
];

const mockAnalytics = {
  total_typhoons: 5,
  average_per_month: 0.4,
  monthly_distribution: [
    { month: 'Jan', count: 0 },
    { month: 'Feb', count: 0 },
    { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 },
    { month: 'Jun', count: 1 },
    { month: 'Jul', count: 0 },
    { month: 'Aug', count: 0 },
    { month: 'Sep', count: 1 },
    { month: 'Oct', count: 1 },
    { month: 'Nov', count: 2 },
    { month: 'Dec', count: 0 }
  ],
  signal_level_distribution: [
    { signal_level: 3, count: 2 },
    { signal_level: 4, count: 2 },
    { signal_level: 5, count: 1 }
  ],
  intensity_distribution: [
    { intensity: 'Super Typhoon', count: 3 },
    { intensity: 'Typhoon', count: 2 }
  ]
};

export default function TyphoonHistory() {
  const [typhoons, setTyphoons] = useState(mockTyphoons);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [selectedPeriod, setSelectedPeriod] = useState(12); // months
  const [view, setView] = useState('list'); // 'list' or 'analytics'

  
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSignalColor = (signal) => {
    switch (signal) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-orange-500';
      case 4: return 'bg-red-500';
      case 5: return 'bg-purple-600';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div 
      className="min-h-screen bg-white"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(12, 74, 110, 0.03) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(12, 74, 110, 0.03) 0%, transparent 20%),
          linear-gradient(45deg, rgba(234, 179, 8, 0.02) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(234, 179, 8, 0.02) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(12, 74, 110, 0.02) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(12, 74, 110, 0.02) 75%)
        `,
        backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px, 20px 20px, 20px 20px',
        backgroundPosition: '0 0, 0 0, 0 0, 10px 0, 0 10px, 10px 10px'
      }}
    >
      <Header title="TYPHOON HISTORY" showBack icon={Wind} />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* View Toggle */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setView('list')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              view === 'list'
                ? 'bg-blue-950 text-white shadow-lg'
                : 'bg-white text-blue-950 border-2 border-blue-950 hover:bg-blue-50'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            History
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              view === 'analytics'
                ? 'bg-blue-950 text-white shadow-lg'
                : 'bg-white text-blue-950 border-2 border-blue-950 hover:bg-blue-50'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Analytics
          </button>
        </div>

        {/* Period Selector */}
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
          <label className="block text-blue-950 font-semibold text-sm mb-3">
            TIME PERIOD
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[3, 6, 12, 24].map((months) => (
              <button
                key={months}
                onClick={() => setSelectedPeriod(months)}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                  selectedPeriod === months
                    ? 'bg-blue-950 text-white shadow-lg'
                    : 'bg-white text-blue-950 border-2 border-blue-950 hover:bg-yellow-500 hover:text-white'
                }`}
              >
                {months}m
              </button>
            ))}
          </div>
        </div>

        <>
            {view === 'list' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-950 to-blue-800 border-2 border-blue-700 rounded-xl p-4 flex items-start gap-3 text-white shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">
                      {typhoons.length} typhoon{typhoons.length !== 1 ? 's' : ''} recorded
                    </p>
                    <p className="text-blue-200 text-xs">
                      Showing data from the last {selectedPeriod} months
                    </p>
                  </div>
                </div>

                {typhoons.length === 0 ? (
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-8 text-center border-2 border-blue-200 shadow-lg">
                    <Wind className="w-12 h-12 text-blue-950 mx-auto mb-3" />
                    <p className="text-blue-950 font-medium">No typhoon data available</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Try selecting a different time period
                    </p>
                  </div>
                ) : (
                  typhoons.map((typhoon, index) => (
                    <div
                      key={typhoon.id}
                      className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 border-2 border-blue-200 hover:border-yellow-500 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                      style={{
                        animation: `slideIn 0.5s ease-out ${index * 100}ms forwards`,
                        opacity: 0
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-blue-950 font-bold text-lg">
                            {typhoon.local_name}
                          </h3>
                          <p className="text-blue-700 text-sm">
                            International name: {typhoon.name}
                          </p>
                        </div>
                        <div className={`${getSignalColor(typhoon.signal_level)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
                          Signal #{typhoon.signal_level || 0}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-blue-600 text-xs mb-1">Date</p>
                          <p className="text-blue-950 font-medium">
                            {formatDate(typhoon.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600 text-xs mb-1">Intensity</p>
                          <p className="text-blue-950 font-medium">{typhoon.intensity}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 text-xs mb-1">Wind Speed</p>
                          <p className="text-blue-950 font-medium">{typhoon.max_wind_speed}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 text-xs mb-1">Pressure</p>
                          <p className="text-blue-950 font-medium">{typhoon.pressure}</p>
                        </div>
                      </div>

                      {typhoon.position && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-blue-600 text-xs mb-1">Position</p>
                          <p className="text-blue-950 text-sm">{typhoon.position}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {view === 'analytics' && analytics && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Wind className="w-5 h-5 text-blue-950" />
                      </div>
                      <div>
                        <p className="text-blue-600 text-xs">Total Typhoons</p>
                        <p className="text-blue-950 font-bold text-2xl">{analytics.total_typhoons}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-blue-600 text-xs">Avg per Month</p>
                        <p className="text-blue-950 font-bold text-2xl">{analytics.average_per_month}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Distribution Chart */}
                {analytics.monthly_distribution && analytics.monthly_distribution.length > 0 && (
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-lg">
                    <h3 className="text-blue-950 font-bold text-sm mb-4">MONTHLY DISTRIBUTION</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.monthly_distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#0c4a6e' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#0c4a6e' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #0c4a6e', 
                            borderRadius: '8px',
                            color: '#0c4a6e'
                          }} 
                        />
                        <Bar dataKey="count" fill="#0c4a6e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Signal Level Distribution */}
                {analytics.signal_level_distribution && analytics.signal_level_distribution.length > 0 && (
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-lg">
                    <h3 className="text-blue-950 font-bold text-sm mb-4">SIGNAL LEVEL DISTRIBUTION</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analytics.signal_level_distribution}
                          dataKey="count"
                          nameKey="signal_level"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) => `Signal ${entry.signal_level}: ${entry.count}`}
                        >
                          {analytics.signal_level_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #0c4a6e', 
                            borderRadius: '8px',
                            color: '#0c4a6e'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Intensity Distribution */}
                {analytics.intensity_distribution && analytics.intensity_distribution.length > 0 && (
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-lg">
                    <h3 className="text-blue-950 font-bold text-sm mb-4">INTENSITY BREAKDOWN</h3>
                    <div className="space-y-2">
                      {analytics.intensity_distribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-blue-950 text-sm">{item.intensity}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-blue-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-950 to-yellow-500 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / analytics.total_typhoons) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-blue-950 font-semibold text-sm w-8 text-right">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}