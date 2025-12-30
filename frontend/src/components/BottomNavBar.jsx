import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Camera } from 'lucide-react';

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { id: 'camera', label: 'Camera', icon: Camera, path: '/geotag-camera' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-blue-950 border-t-2 border-white z-50"
      data-testid="bottom-nav-bar"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900"></div>
      
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-10 w-20 h-20 bg-yellow-400/5 rounded-full animate-pulse"></div>
        <div className="absolute -top-8 right-16 w-16 h-16 bg-indigo-400/5 rounded-full animate-bounce"></div>
      </div>

      <div className="relative flex items-center h-16 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 transform hover:scale-105 ${
              isActive(tab.path)
                ? 'text-yellow-400 bg-gradient-to-t from-yellow-400/20 to-yellow-400/10'
                : 'text-white/60 hover:text-white/80'
            }`}
            data-testid={`nav-tab-${tab.id}`}
            type="button"
          >
            <tab.icon className={`w-6 h-6 mb-1 ${isActive(tab.path) ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-medium">{tab.label}</span>
            {isActive(tab.path) && (
              <div className="absolute top-0 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}