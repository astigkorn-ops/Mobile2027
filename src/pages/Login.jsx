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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
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
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-blue-950/10">
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-blue-950 mb-2">Welcome Back</h2>
              <p className="text-blue-950/70 text-sm">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
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

              <div>
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
                className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
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

            <div className="mt-4 text-center">
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
        <div className="mt-4 text-center">
          <p className="text-blue-950/60 text-xs">
            Securely access your emergency plans and stay prepared
          </p>
        </div>
      </div>
    </div>
  );
}