import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, FileText, Cloud, Sun, CloudRain, CloudSnow, Wind, AlertTriangle, Zap, Shield, Waves, Thermometer, Droplets, Eye } from 'lucide-react';
import { Header } from '../components/Header';

export default function Home() {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('p3.jpeg');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Update current time every minute
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
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

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateFull = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center mb-16 bg-no-repeat relative"
      style={{ backgroundImage: `url(/${backgroundImage})` }}
      data-testid="home-page"
    >
      {/* Animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="MDRRMO PIO DURAN"
          subtitle="Public Preparedness for Disaster"
        />

        {/* Weather Widget - Enhanced readability and spacing */}
        {!loading && weather && (
          <div className="px-4 pt-4 flex justify-center" data-testid="weather-widget-container">
            <div
              className="w-80 rounded-2xl border border-white/30 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 animate-slide-down"
              data-testid="weather-widget"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const WeatherIcon = getWeatherIcon(weather.weather[0].id);
                    return <WeatherIcon className="w-12 h-12 text-yellow-300 drop-shadow-lg animate-pulse" />;
                  })()}
                  <div className="leading-none">
                    <div className="text-white text-3xl font-bold tracking-tight">
                      {Math.round(weather.main.temp)}°C
                    </div>
                    <div className="text-white/85 text-sm mt-1">
                      {Math.round((weather.main.temp * 9/5) + 32)}°F
                    </div>
                  </div>
                </div>
                <div className="text-white/90 text-sm text-right max-w-[120px]">
                  <span className="capitalize block font-semibold">{weather.weather[0].main}</span>
                  <span className="text-xs opacity-80">{weather.name}</span>
                </div>
              </div>

              {/* Weather details */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div className="flex items-center gap-2 text-white/80">
                  <Droplets className="w-4 h-4" />
                  <span>Humidity: {weather.main.humidity}%</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Waves className="w-4 h-4" />
                  <span>Wind: {weather.wind.speed} m/s</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Thermometer className="w-4 h-4" />
                  <span>Feels like: {Math.round(weather.main.feels_like)}°C</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Eye className="w-4 h-4" />
                  <span>Visibility: {weather.visibility / 1000} km</span>
                </div>
              </div>

              {/* 5-Day Forecast - Improved spacing and readability */}
              <div className="grid grid-cols-5 gap-2 pt-3 border-t border-white/20">
                {forecast.map((day, index) => {
                  const WeatherIcon = getWeatherIcon(day.weather[0].id);
                  return (
                    <div key={index} className="flex flex-col items-center min-w-[32px]">
                      <div className="text-white text-xs font-semibold mb-1">
                        {formatDate(day.dt)}
                      </div>
                      <WeatherIcon className="w-5 h-5 text-white/90 mb-1 animate-bounce" style={{ animationDelay: `${index * 0.2}s` }} />
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

        {/* Time display */}
        <div className="px-6 py-4 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
            <div className="text-white text-sm font-mono">
              {formatTime(currentTime)}
            </div>
            <div className="text-slate-300 text-xs">
              {formatDateFull(currentTime)}
            </div>
          </div>
        </div>

        {/* Main Content - Optimized spacing and typography */}
        <main className="flex flex-col justify-center items-center px-6 text-center flex-1">
          {/* Main Slogan - Enhanced typography and spacing */}
          <div className="animate-fade-in">
            <h2 
              className="text-3xl md:text-4xl font-bold leading-tight mb-2 max-w-md"
              data-testid="main-slogan"
            >
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Resilient Pio Duran:
              </span>
              <br />
              <span className="text-white">
                Prepared for Tomorrow
              </span>
            </h2>

            {/* Subtitle - Better spacing and readability */}
            <p className="text-slate-200 text-base md:text-lg mb-2 max-w-lg font-medium leading-relaxed">
              Enhancing disaster preparedness, strengthening community resilience and ensuring safety for all
            </p>
          </div>

          {/* CTA Buttons - Enhanced spacing and visual hierarchy */}
          <div className="space-y-4 w-full max-w-xs animate-slide-up">
            <button
              onClick={() => navigate('/hotlines')}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl transform hover:scale-105 hover:shadow-2xl text-lg"
              data-testid="emergency-hotline-btn"
            >
              <Phone className="w-6 h-6 animate-pulse" />
              Emergency Hotline
            </button>

            <button
              onClick={() => navigate('/report-incident')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl transform hover:scale-105 hover:shadow-2xl text-lg"
              data-testid="report-incident-btn"
            >
              <FileText className="w-6 h-6" />
              Report an Incident
            </button>
          </div>
        </main>

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out forwards;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}