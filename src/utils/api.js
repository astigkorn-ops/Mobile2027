import { supabase } from './supabase';
import axios from 'axios';

// Keep axios instance for external APIs (typhoon data, etc.)
const externalApi = axios.create({
  baseURL: '' // No base URL for external APIs
});

// API methods using Supabase
export const authAPI = {
  register: async (data) => {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone
        }
      }
    });
    if (error) throw error;
    return result;
  },
  login: async (data) => {
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });
    if (error) throw error;
    return result;
  },
  getMe: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

export const userAPI = {
  saveEmergencyPlan: async (plan_data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('emergency_plans')
      .upsert({
        user_id: user.id,
        plan_data,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  },

  getEmergencyPlan: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('emergency_plans')
      .select('plan_data')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data?.plan_data || null;
  },

  saveChecklist: async (checklist_data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('checklists')
      .upsert({
        user_id: user.id,
        checklist_data,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  },

  getChecklist: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('checklists')
      .select('checklist_data')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data?.checklist_data || null;
  }
};

// Default export for backward compatibility with external APIs
export default externalApi;
