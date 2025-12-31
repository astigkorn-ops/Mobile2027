import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Shield, AlertTriangle, Phone, Cloud, Map, Users, Database, Settings, Plus, Edit, Trash2, Eye, Check, X } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

const getCategoryColor = (category) => {
  const colors = {
    emergency: 'bg-red-500',
    local: 'bg-blue-500',
    police: 'bg-blue-700',
    fire: 'bg-orange-500',
    medical: 'bg-green-500',
    weather: 'bg-cyan-500',
    social: 'bg-purple-500',
  };
  return colors[category] || 'bg-slate-500';
};

// Static hotlines
const STATIC_HOTLINES = [
  { label: 'MDRMMO', numbers: ['0917-772-5016'], category: 'emergency' },
  // Add more as needed
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incidents');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [typhoons, setTyphoons] = useState([]);
  const [mapLayers, setMapLayers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard');
      return;
    }

    if (activeTab === 'incidents') {
      fetchIncidents();
    } else if (activeTab === 'typhoons') {
      fetchTyphoons();
    } else if (activeTab === 'map-layers') {
      fetchMapLayers();
    }
  }, [user, navigate, activeTab]);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTyphoons = async () => {
    try {
      const { data, error } = await supabase
        .from('typhoons')
        .select(`
          *,
          typhoon_data_points!inner(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTyphoons(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMapLayers = async () => {
    try {
      const { data, error } = await supabase
        .from('map_layers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMapLayers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTyphoon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this typhoon?')) return;
    
    try {
      const { error } = await supabase
        .from('typhoons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchTyphoons();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveLayer = async (id) => {
    try {
      const { error } = await supabase
        .from('map_layers')
        .update({ is_approved: true })
        .eq('id', id);
      
      if (error) throw error;
      fetchMapLayers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteLayer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this map layer?')) return;
    
    try {
      const { error } = await supabase
        .from('map_layers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchMapLayers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteIncident = async (id) => {
    if (!window.confirm('Delete this incident report? This cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);
      if (error) throw error;
      // Refresh list and clear selection if needed
      if (selectedIncident?.id === id) setSelectedIncident(null);
      fetchIncidents();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white mb-16">
      <Header title="ADMIN DASHBOARD" showBack icon={Shield} />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            {[
              { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
              { id: 'typhoons', label: 'Typhoons', icon: Cloud },
              { id: 'map-layers', label: 'Map Layers', icon: Map },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'database', label: 'Database', icon: Database }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-950 text-blue-950'
                    : 'border-transparent text-blue-950/60 hover:text-blue-950'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-950/10">
            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
              <div>
                <div className="px-6 py-4 border-b border-blue-950/10">
                  <h2 className="text-lg font-semibold text-blue-950">Reported Incidents</h2>
                </div>
                
                {incidents.length === 0 ? (
                  <div className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-blue-950/40 mx-auto mb-4" />
                    <p className="text-blue-950/60">No incidents reported yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-blue-950/10">
                    {incidents.map((incident) => (
                      <div key={incident.id} className="p-6 hover:bg-blue-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-blue-950 text-lg mb-2">{incident.incident_type}</h3>
                            <p className="text-blue-950/80 mb-3 line-clamp-3">{incident.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-950/60">
                              {incident.latitude && incident.longitude && (
                                <span>Coords: {incident.latitude.toFixed ? incident.latitude.toFixed(4) : incident.latitude}, {incident.longitude.toFixed ? incident.longitude.toFixed(4) : incident.longitude}</span>
                              )}
                              {incident.date && incident.time && (
                                <span>When: {incident.date} {incident.time}</span>
                              )}
                              <span>Submitted: {new Date(incident.created_at).toLocaleString()}</span>
                              {incident.reporter_name && (
                                <span>By: {incident.reporter_name}</span>
                              )}
                            </div>
                            {selectedIncident?.id === incident.id && (
                              <div className="mt-4 bg-blue-50 rounded-lg p-4 text-sm text-blue-950/80">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <span className="font-semibold">Description:</span>
                                    <p className="mt-1 whitespace-pre-wrap">{incident.description || '—'}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Reporter:</span>
                                    <p className="mt-1">{incident.reporter_name || '—'} {incident.reporter_phone ? `(${incident.reporter_phone})` : ''}</p>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Images:</span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {(incident.images || []).map((img, idx) => (
                                        <img key={idx} src={img.data || img.url} alt={`evidence-${idx}`} className="w-20 h-20 object-cover rounded" />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => setSelectedIncident(selectedIncident?.id === incident.id ? null : incident)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteIncident(incident.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Typhoons Tab */}
            {activeTab === 'typhoons' && (
              <div>
                <div className="px-6 py-4 border-b border-blue-950/10 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-blue-950">Typhoon Management</h2>
                  <button
                    onClick={() => navigate('/admin/typhoons/new')}
                    className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Typhoon
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-blue-950/10">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Season</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Last Updated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-950/10">
                      {typhoons.map((typhoon) => (
                        <tr key={typhoon.id} className="hover:bg-blue-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-950">
                              {typhoon.name} ({typhoon.local_name})
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-950/80">
                            {typhoon.season}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              typhoon.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {typhoon.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-950/80">
                            {new Date(typhoon.updated_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => navigate(`/admin/typhoons/${typhoon.id}`)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/typhoons/${typhoon.id}/edit`)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTyphoon(typhoon.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Map Layers Tab */}
            {activeTab === 'map-layers' && (
              <div>
                <div className="px-6 py-4 border-b border-blue-950/10 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-blue-950">Map Layer Management</h2>
                  <button
                    onClick={() => navigate('/admin/map-layers/new')}
                    className="bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Layer
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-blue-950/10">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-950 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-950/10">
                      {mapLayers.map((layer) => (
                        <tr key={layer.id} className="hover:bg-blue-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-950">
                              {layer.name}
                            </div>
                            <div className="text-sm text-blue-950/60">{layer.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-950/80">
                            {layer.layer_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {layer.is_approved ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Approved
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-950/80">
                            {new Date(layer.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {!layer.is_approved && (
                              <>
                                <button
                                  onClick={() => handleApproveLayer(layer.id)}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLayer(layer.id)}
                                  className="text-red-600 hover:text-red-900 mr-3"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => navigate(`/admin/map-layers/${layer.id}`)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/map-layers/${layer.id}/edit`)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-blue-950 mb-4">User Management</h2>
                <p className="text-blue-950/80">User management interface coming soon.</p>
              </div>
            )}

            {/* Database Tab */}
            {activeTab === 'database' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-blue-950 mb-4">Database Management</h2>
                <p className="text-blue-950/80">Database tools and utilities coming soon.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}