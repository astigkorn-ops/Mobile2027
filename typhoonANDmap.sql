-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Typhoons table - stores basic information about each typhoon
CREATE TABLE typhoons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  local_name TEXT,
  international_name TEXT,
  season INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  as_of TEXT,
  coordinates TEXT,
  current_location TEXT,
  signal_number TEXT,
  max_wind_speed TEXT,
  movement TEXT,
  intensity TEXT,
  central_pressure TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Typhoon data points - stores tracking data for each typhoon at different timestamps
CREATE TABLE typhoon_data_points (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  typhoon_id UUID REFERENCES typhoons(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  latitude DECIMAL(8, 6) NOT NULL,
  longitude DECIMAL(9, 6) NOT NULL,
  max_wind_speed_kmh INTEGER, -- in kilometers per hour
  movement_direction TEXT, -- e.g., "West", "Northwest"
  movement_speed_kmh INTEGER, -- in kilometers per hour
  intensity TEXT, -- e.g., "Tropical Depression", "Severe Tropical Storm", "Typhoon"
  pressure_hpa INTEGER, -- central pressure in hectopascals
  location_description TEXT, -- e.g., "East of Luzon"
  is_forecast BOOLEAN DEFAULT FALSE, -- indicates if this is a forecast data point
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactive map layers - stores different map layer data
CREATE TABLE map_layers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  layer_type TEXT NOT NULL, -- e.g., "rainfall", "wind", "satellite"
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Locations table - stores emergency locations like evacuation centers, hospitals, etc.
CREATE TABLE locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL, -- e.g., evacuation_center, hospital, police_station
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(8, 6),
  lng DECIMAL(9, 6),
  capacity INTEGER,
  hotline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Map layer data - stores the actual data for each map layer at different times
CREATE TABLE map_layer_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  layer_id UUID REFERENCES map_layers(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  data_url TEXT NOT NULL, -- URL to the image or data file
  coordinates_geojson JSONB, -- GeoJSON representation of the data area
  is_latest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences - stores user-specific settings for the dashboard
CREATE TABLE user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL, -- Assuming you have an auth.users table
  preferred_units TEXT DEFAULT 'metric', -- 'metric' or 'imperial'
  notification_settings JSONB, -- Store notification preferences
  map_preferences JSONB, -- Store map view preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Typhoon alerts - stores alerts and warnings for typhoons
CREATE TABLE typhoon_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  typhoon_id UUID REFERENCES typhoons(id) ON DELETE CASCADE,
  alert_level INTEGER NOT NULL, -- 1-5 scale for alert severity
  alert_type TEXT NOT NULL, -- e.g., "typhoon", "flood", "landslide"
  area_affected TEXT NOT NULL, -- Area that is affected
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical statistics - stores aggregated historical data for analytics
CREATE TABLE historical_statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  season INTEGER NOT NULL,
  total_typhoons INTEGER,
  total_landfalls INTEGER,
  max_wind_speed_record_kmh INTEGER,
  min_pressure_record_hpa INTEGER,
  total_damage_usd BIGINT, -- Estimated damage in USD
  total_fatalities INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) policies if needed
ALTER TABLE typhoons ENABLE ROW LEVEL SECURITY;
ALTER TABLE typhoon_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_layer_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE typhoon_alerts ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_typhoon_data_points_typhoon_id ON typhoon_data_points(typhoon_id);
CREATE INDEX idx_typhoon_data_points_timestamp ON typhoon_data_points(timestamp);
CREATE INDEX idx_typhoon_data_points_is_forecast ON typhoon_data_points(is_forecast);
CREATE INDEX idx_map_layer_data_layer_id ON map_layer_data(layer_id);
CREATE INDEX idx_map_layer_data_timestamp ON map_layer_data(timestamp);
CREATE INDEX idx_typhoon_alerts_typhoon_id ON typhoon_alerts(typhoon_id);
CREATE INDEX idx_typhoon_alerts_active ON typhoon_alerts(is_active, expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_typhoons_updated_at 
    BEFORE UPDATE ON typhoons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_typhoon_data_points_updated_at 
    BEFORE UPDATE ON typhoon_data_points 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_map_layers_updated_at 
    BEFORE UPDATE ON map_layers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_map_layer_data_updated_at 
    BEFORE UPDATE ON map_layer_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_typhoon_alerts_updated_at 
    BEFORE UPDATE ON typhoon_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_historical_statistics_updated_at 
    BEFORE UPDATE ON historical_statistics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();