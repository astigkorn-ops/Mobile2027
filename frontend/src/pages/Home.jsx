import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, FileText, Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { Header } from '../components/Header';

export default function Home() {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('p3.jpeg');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time-based background image logic
  useEffect(() => {
    const updateBackground = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 5 && hour < 8) {
        setBackgroundImage('p1.jpeg');
      } else if (hour >= 8 && hour < 11) {
        setBackgroundImage('p2.jpeg');
      } else if (hour >= 11 && hour < 16) {
        setBackgroundImage('p3.jpeg');
      } else if (hour >= 16 && hour < 19) {
        setBackgroundImage('p4.jpeg');
      } else {
        setBackgroundImage('p5.jpeg');
      }
    };

    updateBackground();
    // Update every minute to check for time changes
    const interval = setInterval(updateBackground, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = 'bb0b8b639634c8a7a6c9faee7dca96e5';
        const LAT = 13.0293;
        const LON = 123.445;

        // Current weather
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();

        // 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        // Get one forecast per day (at 12:00)
        const dailyForecasts = forecastData.list
          .filter((item) => item.dt_txt.includes('12:00:00'))
          .slice(0, 5);

        setWeather(currentData);
        setForecast(dailyForecasts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (weatherCode) => {
    if (weatherCode >= 200 && weatherCode < 300) return CloudRain;
    if (weatherCode >= 300 && weatherCode < 600) return CloudRain;
    if (weatherCode >= 600 && weatherCode < 700) return CloudSnow;
    if (weatherCode >= 700 && weatherCode < 800) return Wind;
    if (weatherCode === 800) return Sun;
    return Cloud;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative pb-16"
      style={{ backgroundImage: `url(/${backgroundImage})` }}
      data-testid="home-page"
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="MDRRMO PIO DURAN"
          subtitle="Public Preparedness for Disaster"
        />

        {/* Weather Widget - Enhanced readability and spacing */}
        {!loading && weather && (
          <div className="px-4 pt-4 flex justify-end" data-testid="weather-widget-container">
            <div
              className="w-64 rounded-2xl border border-white/30 bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4"
              data-testid="weather-widget"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const WeatherIcon = getWeatherIcon(weather.weather[0].id);
                    return <WeatherIcon className="w-10 h-10 text-yellow-300 drop-shadow-lg" />;
                  })()}
                  <div className="leading-none">
                    <div className="text-white text-2xl font-bold tracking-tight">
                      {Math.round(weather.main.temp)}°C
                    </div>
                    <div className="text-white/85 text-xs mt-1">
                      {Math.round((weather.main.temp * 9/5) + 32)}°F
                    </div>
                  </div>
                </div>
                <div className="text-white/90 text-xs text-right max-w-[120px]">
                  <span className="capitalize">{weather.weather[0].description}</span>
                </div>
              </div>

              {/* 5-Day Forecast - Improved spacing and readability */}
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-white/20">
                {forecast.map((day, index) => {
                  const WeatherIcon = getWeatherIcon(day.weather[0].id);
                  return (
                    <div key={index} className="flex flex-col items-center min-w-[32px]">
                      <div className="text-white text-xs font-semibold mb-1">
                        {formatDate(day.dt)}
                      </div>
                      <WeatherIcon className="w-5 h-5 text-white/90 mb-1" />
                      <div className="text-white text-xs font-medium">
                        {Math.round(day.main.temp)}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Optimized spacing and typography */}
        <main className="flex-1 flex flex-col justify-center items-center px-6 text-center pt-2 pb-8">
          {/* Main Slogan - Enhanced typography and spacing */}
          <h2 
            className="text-2xl md:text-3xl font-bold leading-tight mb-4 max-w-md"
            style={{ 
              textShadow: '2px 2px 0px black, 3px 3px 6px rgba(0,0,0,0.9)',
            }}
            data-testid="main-slogan"
          >
            <span style={{ color: 'yellow', WebkitTextStroke: '1px black' }}>Resilient Pio Duran:</span><br />
            <span style={{ color: 'white', WebkitTextStroke: '1px black' }}>Prepared for Tomorrow</span>
          </h2>

          {/* Subtitle - Better spacing and readability */}
          <p className="text-white text-sm md:text-base mb-8 max-w-md font-medium leading-relaxed" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Enhancing disaster preparedness, strengthening community resilience and ensuring safety for all
          </p>

          {/* CTA Buttons - Enhanced spacing and visual hierarchy */}
          <div className="space-y-4 w-full max-w-xs">
            <button
              onClick={() => navigate('/hotlines')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-3 transition-all shadow-2xl transform hover:scale-105 text-base md:text-lg"
              data-testid="emergency-hotline-btn"
            >
              <Phone className="w-5 h-5" />
              Emergency Hotline!
            </button>

            <button
              onClick={() => navigate('/report-incident')}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-bold py-3 px-6 rounded-full flex items-center justify-center gap-3 transition-all shadow-2xl transform hover:scale-105 text-base md:text-lg"
              data-testid="report-incident-btn"
            >
              <FileText className="w-5 h-5" />
              Report an Incident
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
