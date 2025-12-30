import { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate login process
    setTimeout(() => {
      setLoading(false);
      // Mock successful login
      console.log('Login attempt with:', formData);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-950/5 via-transparent to-yellow-500/5"></div>
        
        {/* Floating animated elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-950/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-sm mx-auto relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-950 to-blue-800 flex items-center justify-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <LogIn className="w-6 h-6 text-blue-950" />
            </div>
          </div>
          <h1 className="text-blue-950 font-bold text-xl mb-2 tracking-tight">
            MDRRMO PIO DURAN
          </h1>
          <p className="text-blue-950/80 text-sm font-medium">
            Emergency Preparedness App
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-950/10 relative overflow-hidden">
          {/* Animated border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-950 via-yellow-500 to-blue-950 opacity-20 blur-sm"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-blue-950 mb-2">Welcome Back</h2>
              <p className="text-blue-950/70 text-sm">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm animate-slide-down">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="animate-fade-in-up delay-100">
                <label className="block text-blue-950 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-950/60" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-blue-50/50 border-2 border-blue-950/20 rounded-xl focus:border-yellow-500 focus:outline-none transition-all duration-300 text-blue-950 placeholder-blue-950/50"
                  />
                </div>
              </div>

              <div className="animate-fade-in-up delay-200">
                <label className="block text-blue-950 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-950/60" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-blue-50/50 border-2 border-blue-950/20 rounded-xl focus:border-yellow-500 focus:outline-none transition-all duration-300 text-blue-950 placeholder-blue-950/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group animate-fade-in-up delay-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    Login
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center animate-fade-in-up delay-400">
              <button
                onClick={() => console.log('Skip to dashboard')}
                className="text-blue-950 text-sm hover:text-yellow-500 hover:underline transition-colors font-medium"
              >
                Skip for now →
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 text-center animate-fade-in delay-500">
          <p className="text-blue-950/60 text-xs">
            Securely access your emergency plans and stay prepared
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}