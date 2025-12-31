// src/pages/TyphoonForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';

export default function TyphoonForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    local_name: '',
    international_name: '',
    season: new Date().getFullYear(),
    is_active: true,
    as_of: '',
    coordinates: '',
    current_location: '',
    signal_number: '',
    max_wind_speed: '',
    movement: '',
    intensity: '',
    central_pressure: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTyphoon();
    }
  }, [id]);

  const fetchTyphoon = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('typhoons')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setFormData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let result;
      
      if (id) {
        // Update existing typhoon
        result = await supabase
          .from('typhoons')
          .update(formData)
          .eq('id', id);
      } else {
        // Create new typhoon
        result = await supabase
          .from('typhoons')
          .insert([formData]);
      }
      
      if (result.error) throw result.error;
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={id ? "EDIT TYPHOON" : "CREATE NEW TYPHOON"} 
        showBack={true} 
        onBack={() => navigate('/admin')} 
      />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Operational fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              International Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter international name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local Name
            </label>
            <input
              type="text"
              name="local_name"
              value={formData.local_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter local name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season *
            </label>
            <input
              type="number"
              name="season"
              value={formData.season}
              onChange={handleChange}
              required
              min="1900"
              max="2100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter season year"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active Typhoon
            </label>
          </div>

          {/* New fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">As of</label>
            <input
              type="text"
              name="as_of"
              value={formData.as_of}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2025-01-05 14:00 PHT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coordinates</label>
            <input
              type="text"
              name="coordinates"
              value={formData.coordinates}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 14.6N, 122.3E"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
            <input
              type="text"
              name="current_location"
              value={formData.current_location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 230 km East of Virac, Catanduanes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Typhoon Signal #</label>
            <input
              type="text"
              name="signal_number"
              value={formData.signal_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Wind Speed</label>
            <input
              type="text"
              name="max_wind_speed"
              value={formData.max_wind_speed}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 120 km/h"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Movement</label>
            <input
              type="text"
              name="movement"
              value={formData.movement}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., WNW at 15 km/h"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
            <input
              type="text"
              name="intensity"
              value={formData.intensity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Maintaining strength / Weakening / Intensifying"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Central Pressure</label>
            <input
              type="text"
              name="central_pressure"
              value={formData.central_pressure}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 960 hPa"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (id ? 'Update Typhoon' : 'Create Typhoon')}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}