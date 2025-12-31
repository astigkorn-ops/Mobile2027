// src/pages/MapLayerForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { getSupabaseClient } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function MapLayerForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: locationId } = useParams();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'evacuation center',
    address: '',
    lat: '',
    lng: '',
    hotline: '',
    description: '',
    capacity: '',
    is_operational: true,
    contact_person: '',
    contact_phone: '',
    is_approved: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard');
      return;
    }

    if (locationId) {
      setIsEditing(true);
      fetchLocation();
    }
  }, [user, navigate, locationId]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locationId)
        .single();

      if (error) throw error;
      setFormData({
        name: data.name || '',
        type: data.type || 'evacuation center',
        address: data.address || '',
        lat: data.lat || '',
        lng: data.lng || '',
        hotline: data.hotline || '',
        description: data.description || '',
        capacity: data.capacity || '',
        is_operational: data.is_operational !== undefined ? data.is_operational : true,
        contact_person: data.contact_person || '',
        contact_phone: data.contact_phone || '',
        is_approved: data.is_approved !== undefined ? data.is_approved : true,
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
      // Validate coordinates
      if (!formData.lat || !formData.lng) {
        setError('Latitude and longitude are required');
        return;
      }

      const coordinates = {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      };

      if (isNaN(coordinates.lat) || isNaN(coordinates.lng)) {
        setError('Latitude and longitude must be valid numbers');
        return;
      }

      let result;
      if (isEditing) {
        result = await supabase
          .from('locations')
          .update({
            ...formData,
            lat: coordinates.lat,
            lng: coordinates.lng,
            updated_at: new Date().toISOString()
          })
          .eq('id', locationId);
      } else {
        result = await supabase
          .from('locations')
          .insert([{
            ...formData,
            lat: coordinates.lat,
            lng: coordinates.lng,
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
        title={isEditing ? "EDIT LOCATION" : "ADD NEW LOCATION"} 
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
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Name of the facility"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Location Type</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="evacuation center">Evacuation Center</option>
                <option value="health facility">Health Facility</option>
                <option value="fire station">Fire Station</option>
                <option value="police station">Police Station</option>
                <option value="school">School</option>
                <option value="barangay hall">Barangay Hall</option>
                <option value="market">Market</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address of the location"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                name="lat"
                type="text"
                value={formData.lat}
                onChange={handleChange}
                required
                placeholder="e.g., 14.5995"
              />
            </div>
            
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                name="lng"
                type="text"
                value={formData.lng}
                onChange={handleChange}
                required
                placeholder="e.g., 120.9842"
              />
            </div>
            
            <div>
              <Label htmlFor="hotline">Hotline</Label>
              <Input
                id="hotline"
                name="hotline"
                type="tel"
                value={formData.hotline}
                onChange={handleChange}
                placeholder="Emergency contact number"
              />
            </div>
            
            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Person in charge"
              />
            </div>
            
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="Contact number"
              />
            </div>
            
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Capacity (if applicable)"
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
              placeholder="Additional information about this location"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_operational"
                name="is_operational"
                checked={formData.is_operational}
                onChange={handleChange}
                className="h-4 w-4 text-blue-950 rounded border-gray-300 focus:ring-blue-950"
              />
              <Label htmlFor="is_operational" className="ml-2">
                Is operational
              </Label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_approved"
                name="is_approved"
                checked={formData.is_approved}
                onChange={handleChange}
                className="h-4 w-4 text-blue-950 rounded border-gray-300 focus:ring-blue-950"
              />
              <Label htmlFor="is_approved" className="ml-2">
                Is approved
              </Label>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-950 hover:bg-blue-800 text-white"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Location' : 'Add Location'}
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