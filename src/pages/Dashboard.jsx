import { useNavigate } from 'react-router-dom';
import { TopNav } from '../components/Header';
import { 
  Phone, 
  AlertTriangle, 
  Cloud, 
  Map, 
  Briefcase, 
  BookOpen, 
  FileText,
  Shield,
  Zap,
  Wind,
  Users,
  Heart,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const modules = [
  {
    title: 'Report an Incident',
    icon: AlertTriangle,
    route: '/report-incident',
    description: 'Submit incident report',
    color: 'from-red-500 to-red-600',
    animationDelay: '0.1s'
  },
  {
    title: 'Typhoon Dashboard',
    icon: Cloud,
    route: '/typhoon-dashboard',
    description: 'Live monitoring',
    color: 'from-blue-500 to-cyan-600',
    animationDelay: '0.2s'
  },
  {
    title: 'Interactive Map',
    icon: Map,
    route: '/interactive-map',
    description: 'Evacuation centers',
    color: 'from-green-500 to-emerald-600',
    animationDelay: '0.3s'
  },
  {
    title: 'Disaster Guidelines',
    icon: Briefcase,
    route: '/disaster-guidelines',
    description: 'before, during, and after',
    color: 'from-yellow-500 to-orange-600',
    animationDelay: '0.4s'
  },
  {
    title: 'Support Resources',
    icon: BookOpen,
    route: '/support-resources',
    description: 'Help & information',
    color: 'from-purple-500 to-pink-600',
    animationDelay: '0.5s'
  },
  {
    title: 'Emergency Plan',
    icon: FileText,
    route: '/emergency-plan',
    description: 'Family safety plan',
    color: 'from-indigo-500 to-purple-600',
    animationDelay: '0.6s'
  },
];

const adminModule = {
  title: 'Admin Dashboard',
  icon: Shield,
  route: '/admin',
  description: 'Manage incidents & hotlines',
  color: 'from-gray-600 to-slate-700',
  animationDelay: '0.7s'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-white">
      {/* Animated pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Animated elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-950/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-500/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-950/5 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 pb-20">
        <TopNav subtitle="Public Preparedness for Disaster" />
        
        <main className="px-6 py-8 max-w-4xl mx-auto">

            {/* Welcome Message */}
          <div className="mb-8 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-950/20 to-blue-800/20 rounded-full border border-blue-950/20 backdrop-blur-sm mb-2">
              <Zap className="w-4 h-4 text-blue-950" />
              <span className="text-blue-950 text-sm font-medium">Welcome to MDRRMO Dashboard</span>
            </div>

          </div>

          {/* 24/7 Hotline Numbers Banner */}
          <button
            onClick={() => navigate('/hotlines')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl p-6 mb-8 flex items-center justify-center gap-4 transition-all shadow-xl transform hover:scale-105 animate-fade-in"
            data-testid="hotline-banner"
          >
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-left">
                <h2 className="font-bold text-2xl tracking-wide text-blue-950" data-testid="hotline-title">
                  HOTLINE NUMBERS
                </h2>
                </div>
            </div>
          </button>

        

          {/* Module Grid */}
          <div className="grid grid-cols-2 gap-5" data-testid="modules-grid">
            {[...modules, ...(user?.is_admin ? [adminModule] : [])].map((module, index) => {
              const IconComponent = module.icon;
              return (
                <button
                  key={module.title}
                  onClick={() => navigate(module.route)}
                  className={`w-full bg-white border-2 border-blue-950/20 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[160px] hover:bg-blue-50 transition-all shadow-lg transform hover:scale-105 hover:shadow-xl group animate-slide-up`}
                  style={{ animationDelay: module.animationDelay }}
                  data-testid={`module-${module.route.slice(1)}`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${module.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl transition-all`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-blue-950 font-bold text-base text-center leading-tight mb-2">
                    {module.title}
                  </h3>
                  <p className="text-blue-950/70 text-sm text-center">
                    {module.description}
                  </p>
                </button>
              );
            })}
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
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
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