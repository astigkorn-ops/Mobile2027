import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Wind, TrendingUp, Calendar, AlertTriangle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function TyphoonHistory() {
  const [typhoons, setTyphoons] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(12); // months
  const [view, setView] = useState('list'); // 'list' or 'analytics'

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyResponse, analyticsResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/typhoon/history?months=${selectedPeriod}&limit=50`),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/typhoon/analytics?months=${selectedPeriod}`)
      ]);

      setTyphoons(historyResponse.data.typhoons || []);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Failed to load typhoon data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-slate-100" data-testid="typhoon-history-page">
      <Header title="TYPHOON HISTORY" showBack icon={Wind} />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* View Toggle */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setView('list')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-950 border-2 border-slate-200'
            }`}
            data-testid="list-view-btn"
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            History
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
              view === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-950 border-2 border-slate-200'
            }`}
            data-testid="analytics-view-btn"
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Analytics
          </button>
        </div>

        {/* Period Selector */}
        <div className="mb-6 bg-white rounded-xl p-4 border-2 border-slate-200">
          <label className="block text-blue-950 font-semibold text-sm mb-3">
            TIME PERIOD
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[3, 6, 12, 24].map((months) => (
              <button
                key={months}
                onClick={() => setSelectedPeriod(months)}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                  selectedPeriod === months
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                data-testid={`period-${months}-btn`}
              >
                {months}m
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading typhoon data...</p>
            </div>
          </div>
        ) : (
          <>
            {view === 'list' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-950 font-semibold text-sm mb-1">
                      {typhoons.length} typhoon{typhoons.length !== 1 ? 's' : ''} recorded
                    </p>
                    <p className="text-blue-800 text-xs">
                      Showing data from the last {selectedPeriod} months
                    </p>
                  </div>
                </div>

                {typhoons.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border-2 border-slate-200">
                    <Wind className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No typhoon data available</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Try selecting a different time period
                    </p>
                  </div>
                ) : (
                  typhoons.map((typhoon) => (
                    <div
                      key={typhoon.id}
                      className="bg-white rounded-xl p-4 border-2 border-slate-200 hover:border-yellow-400 transition-colors"
                      data-testid="typhoon-history-item"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-blue-950 font-bold text-lg">
                            {typhoon.local_name}
                          </h3>
                          <p className="text-slate-600 text-sm">
                            International name: {typhoon.name}
                          </p>
                        </div>
                        <div className={`${getSignalColor(typhoon.signal_level)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                          Signal #{typhoon.signal_level || 0}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Date</p>
                          <p className="text-slate-700 font-medium">
                            {formatDate(typhoon.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Intensity</p>
                          <p className="text-slate-700 font-medium">{typhoon.intensity}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Wind Speed</p>
                          <p className="text-slate-700 font-medium">{typhoon.max_wind_speed}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Pressure</p>
                          <p className="text-slate-700 font-medium">{typhoon.pressure}</p>
                        </div>
                      </div>

                      {typhoon.position && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-slate-500 text-xs mb-1">Position</p>
                          <p className="text-slate-700 text-sm">{typhoon.position}</p>
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
                  <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Wind className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Total Typhoons</p>
                        <p className="text-blue-950 font-bold text-2xl">{analytics.total_typhoons}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Avg per Month</p>
                        <p className="text-blue-950 font-bold text-2xl">{analytics.average_per_month}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Distribution Chart */}
                {analytics.monthly_distribution && analytics.monthly_distribution.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                    <h3 className="text-blue-950 font-bold text-sm mb-4">MONTHLY DISTRIBUTION</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.monthly_distribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Signal Level Distribution */}
                {analytics.signal_level_distribution && analytics.signal_level_distribution.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Intensity Distribution */}
                {analytics.intensity_distribution && analytics.intensity_distribution.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                    <h3 className="text-blue-950 font-bold text-sm mb-4">INTENSITY BREAKDOWN</h3>
                    <div className="space-y-2">
                      {analytics.intensity_distribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-slate-700 text-sm">{item.intensity}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / analytics.total_typhoons) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-slate-700 font-semibold text-sm w-8 text-right">
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
        )}
      </main>
    </div>
  );
}
