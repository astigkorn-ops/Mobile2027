import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Shield, AlertTriangle, Phone } from 'lucide-react';
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

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard');
      return;
    }

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
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, [user, navigate]);

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-white mb-16">
      <div className="relative z-10">
        <Header title="ADMIN DASHBOARD" showBack icon={Shield} />

        <main className="px-4 py-6 max-w-2xl mx-auto">
          <h2 className="text-blue-950 font-bold text-lg mb-4">Reported Incidents</h2>
          {loading ? (
            <p className="text-blue-950/70">Loading incidents...</p>
          ) : incidents.length === 0 ? (
            <p>No incidents.</p>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="p-4 border rounded">
                  <h3>{incident.incident_type}</h3>
                  <p>{incident.description}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}