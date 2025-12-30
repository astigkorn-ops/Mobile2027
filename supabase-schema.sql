-- Supabase Database Schema for Mobile2027
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables
CREATE TABLE IF NOT EXISTS public.emergency_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    checklist_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_type TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT,
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Emergency Plans: Users can only access their own data
CREATE POLICY "Users can view own emergency plans" ON public.emergency_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency plans" ON public.emergency_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency plans" ON public.emergency_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency plans" ON public.emergency_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Checklists: Users can only access their own data
CREATE POLICY "Users can view own checklists" ON public.checklists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists" ON public.checklists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists" ON public.checklists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists" ON public.checklists
    FOR DELETE USING (auth.uid() = user_id);

-- Incidents: Anyone can create incidents, but only authenticated users can view them
CREATE POLICY "Anyone can create incidents" ON public.incidents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view incidents" ON public.incidents
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_emergency_plans_updated_at
    BEFORE UPDATE ON public.emergency_plans
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_checklists_updated_at
    BEFORE UPDATE ON public.checklists
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();