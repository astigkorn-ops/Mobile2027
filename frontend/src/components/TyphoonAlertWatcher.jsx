import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AlertTriangle, X } from 'lucide-react';

export function TyphoonAlertWatcher() {
  const navigate = useNavigate();
  const lastSignalRef = useRef(parseInt(localStorage.getItem('last_typhoon_signal') || '0'));

  useEffect(() => {
    const checkTyphoonStatus = async () => {
      try {
        const res = await api.get('/api/typhoon/current');
        const data = res.data;
        const currentSignal = data.signal_level || 0;
        const lastSignal = lastSignalRef.current;

        // If signal level increased or is high and we haven't acknowledged it
        if (currentSignal > 0 && currentSignal > lastSignal) {
          
          toast.custom((t) => (
            <div className="w-full max-w-md bg-red-600 border border-red-700 text-white p-4 rounded-xl shadow-2xl flex gap-3 relative animate-in slide-in-from-top-2">
              <AlertTriangle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-base leading-tight">TYPHOON SIGNAL NO. {currentSignal} RAISED!</span>
                  <button 
                    onClick={() => toast.dismiss(t)}
                    className="text-white/80 hover:text-white -mt-1 -mr-1 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <span className="text-sm text-white/90">{data.name} is intensifying. Check dashboard for details.</span>
                
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => {
                      navigate('/typhoon-dashboard');
                      toast.dismiss(t);
                    }}
                    className="bg-white text-red-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-red-50 transition-colors"
                  >
                    VIEW DASHBOARD
                  </button>
                  <button 
                    onClick={() => toast.dismiss(t)}
                    className="bg-red-700 text-white border border-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-800 transition-colors"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          ), {
            duration: Infinity,
            position: 'top-center',
          });
          
          localStorage.setItem('last_typhoon_signal', currentSignal.toString());
          lastSignalRef.current = currentSignal;
        } else if (currentSignal > 0 && currentSignal === lastSignal) {
             // Reminder toast if signal is still active (optional)
        } else if (currentSignal < lastSignal) {
            // Signal lowered
            localStorage.setItem('last_typhoon_signal', currentSignal.toString());
            lastSignalRef.current = currentSignal;
        }

      } catch (error) {
        console.error('Failed to check typhoon status', error);
      }
    };

    // Check immediately on mount
    checkTyphoonStatus();

    // Check every 5 minutes
    const interval = setInterval(checkTyphoonStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return null;
}
