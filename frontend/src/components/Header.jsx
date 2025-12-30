import { User as UserIcon, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = ({
  title,
  subtitle,
  icon: Icon,
  showBack = false,
}) => {
  const navigate = useNavigate();
  return (
    <header
      className="relative overflow-hidden px-4 py-3 sticky top-0 z-50 border-b-2 border-white/20"
      data-testid="header"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900"></div>
      
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-400/10 rounded-full animate-pulse"></div>
        <div className="absolute top-10 -right-20 w-32 h-32 bg-indigo-400/10 rounded-full animate-ping"></div>
      </div>

      <div className="relative flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              data-testid="back-button"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <img
            src="/logome.webp"
            alt="MDRRMO"
            className="w-10 h-10 object-contain rounded-lg"
            data-testid="header-logo"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1
                className="text-yellow-400 font-bold text-lg md:text-xl tracking-wide truncate bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent"
                data-testid="header-title"
              >
                {title}
              </h1>
              {Icon ? <Icon className="w-6 h-6 text-yellow-400" /> : null}
            </div>
            {subtitle ? (
              <p className="text-white/90 text-xs md:text-sm mt-0.5 truncate animate-pulse" data-testid="header-subtitle">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Removed guest user section */}
        </div>
      </div>
    </header>
  );
};

export const TopNav = ({ subtitle }) => {
  return (
    <header className="bg-blue-950 px-4 py-3 sticky top-0 z-50 border-b-2 border-white">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900"></div>
      
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-5 left-10 w-24 h-24 bg-yellow-400/5 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-indigo-400/5 rounded-full animate-ping"></div>
      </div>

      <div className="relative flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src="/logome.webp" 
            alt="MDRRMO Logo" 
            className="w-12 h-12 object-contain rounded-lg"
            data-testid="top-nav-logo"
          />
          <div>
            <h1 className="text-yellow-400 font-bold text-xl md:text-2xl tracking-wide bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              MDRRMO PIO DURAN
            </h1>
            {subtitle && (
              <p className="text-white/80 text-xs md:text-sm mt-1 animate-pulse">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Removed guest user section */}
        </div>
      </div>
    </header>
  );
};