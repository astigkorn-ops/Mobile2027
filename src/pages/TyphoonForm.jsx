// src/pages/TyphoonForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { getSupabaseClient } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TyphoonForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: typhoonId } = useParams();
  
  // 获取 Supabase 客户端实例
  const supabase = getSupabaseClient();
  
  const [formData, setFormData] = useState({
    name: '',
    local_name: '',
    season: '',
    is_active: true,
    current_location: '',
    signal_number: '',
    intensity: '',
    description: '',
    wind_speed: '',
    pressure: '',
    forecast_movement: '',
    estimated_landfall: '',
    advisory_text: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard');
      return;
    }

    if (typhoonId) {
      setIsEditing(true);
      fetchTyphoon();
    }
  }, [user, navigate, typhoonId]);

  const fetchTyphoon = async () => {
    try {
      setLoading(true);
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await supabase
        .from('typhoons')
        .select('*')
        .eq('id', typhoonId)
        .single();

      if (error) throw error;
      setFormData({
        name: data.name || '',
        local_name: data.local_name || '',
        season: data.season || '',
        is_active: data.is_active,
        current_location: data.current_location || '',
        signal_number: data.signal_number || '',
        intensity: data.intensity || '',
        description: data.description || '',
        wind_speed: data.wind_speed || '',
        pressure: data.pressure || '',
        forecast_movement: data.forecast_movement || '',
        estimated_landfall: data.estimated_landfall || '',
        advisory_text: data.advisory_text || '',
      });
    } catch (error) {
      setError(error.message);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      let result;
      if (isEditing) {
        result = await supabase
          .from('typhoons')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', typhoonId);
      } else {
        result = await supabase
          .from('typhoons')
          .insert([{
            ...formData,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
      }

      if (result.error) throw result.error;

      // Navigate back to admin dashboard
      navigate('/admin');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        title={isEditing ? "EDIT TYPHOON" : "ADD NEW TYPHOON"} 
        showBack 
        onBack={() => navigate('/admin')}
      />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Typhoon Name (International)</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="International name"
              />
            </div>
            
            <div>
              <Label htmlFor="local_name">Local Name</Label>
              <Input
                id="local_name"
                name="local_name"
                value={formData.local_name}
                onChange={handleChange}
                placeholder="Local name (if applicable)"
              />
            </div>
            
            <div>
              <Label htmlFor="season">Season</Label>
              <Input
                id="season"
                name="season"
                value={formData.season}
                onChange={handleChange}
                required
                placeholder="e.g., 2025"
              />
            </div>
            
            <div>
              <Label htmlFor="signal_number">Signal Number</Label>
              <Input
                id="signal_number"
                name="signal_number"
                type="number"
                min="1"
                max="5"
                value={formData.signal_number}
                onChange={handleChange}
                placeholder="1-5"
              />
            </div>
            
            <div>
              <Label htmlFor="current_location">Current Location</Label>
              <Input
                id="current_location"
                name="current_location"
                value={formData.current_location}
                onChange={handleChange}
                placeholder="e.g., 300km East of Manila"
              />
            </div>
            
            <div>
              <Label htmlFor="intensity">Intensity</Label>
              <select
                id="intensity"
                name="intensity"
                value={formData.intensity}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select intensity</option>
                <option value="tropical depression">Tropical Depression</option>
                <option value="tropical storm">Tropical Storm</option>
                <option value="severe tropical storm">Severe Tropical Storm</option>
                <option value="typhoon">Typhoon</option>
                <option value="super typhoon">Super Typhoon</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="wind_speed">Wind Speed (km/h)</Label>
              <Input
                id="wind_speed"
                name="wind_speed"
                type="number"
                value={formData.wind_speed}
                onChange={handleChange}
                placeholder="Maximum sustained winds"
              />
            </div>
            
            <div>
              <Label htmlFor="pressure">Pressure (hPa)</Label>
              <Input
                id="pressure"
                name="pressure"
                type="number"
                step="0.1"
                value={formData.pressure}
                onChange={handleChange}
                placeholder="Central pressure"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="forecast_movement">Forecast Movement</Label>
              <Input
                id="forecast_movement"
                name="forecast_movement"
                value={formData.forecast_movement}
                onChange={handleChange}
                placeholder="e.g., West at 15 km/h"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="estimated_landfall">Estimated Landfall</Label>
              <Input
                id="estimated_landfall"
                name="estimated_landfall"
                type="datetime-local"
                value={formData.estimated_landfall}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the typhoon"
              rows={4}
            />
          </div>
          
          <div>
            <Label htmlFor="advisory_text">Advisory Text</Label>
            <Textarea
              id="advisory_text"
              name="advisory_text"
              value={formData.advisory_text}
              onChange={handleChange}
              placeholder="Official advisory text for the public"
              rows={6}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-950 rounded border-gray-300 focus:ring-blue-950"
            />
            <Label htmlFor="is_active" className="ml-2">
              Typhoon is currently active
            </Label>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-950 hover:bg-blue-800 text-white"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Typhoon' : 'Create Typhoon'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}