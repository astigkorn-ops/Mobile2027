import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import '@/App.css';
import { Toaster } from 'sonner';
import toast, { Toaster as HotToaster } from 'react-hot-toast';
import { TyphoonAlertWatcher } from './components/TyphoonAlertWatcher';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import GeotagCamera from './pages/GeotagCamera';
import HotlineNumbers from './pages/HotlineNumbers';
import ReportIncident from './pages/ReportIncident';
import TyphoonDashboard from './pages/TyphoonDashboard';
import TyphoonHistory from './pages/TyphoonHistory';
import InteractiveMap from './pages/InteractiveMap';
import DisasterGuidelines from './pages/DisasterGuidelines';
import SupportResources from './pages/SupportResources';
import EmergencyPlan from './pages/EmergencyPlan';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TyphoonForm from './pages/TyphoonForm';
import MapLayerForm from './pages/MapLayerForm';

import { OfflineIndicator } from './components/OfflineIndicator';
import BottomNavBar from './components/BottomNavBar';

function AppContent() {
  const location = useLocation();
  
  // Show bottom nav bar on main tabs except Interactive Map and Disaster Guidelines
  const showBottomNav = ['/', '/dashboard', '/hotlines'].includes(location.pathname);

  return (
    <div className="App min-h-screen bg-blue-950 mx-auto" style={{ maxWidth: '430px' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/typhoons/new" element={<TyphoonForm />} />
        <Route path="/admin/typhoons/:id" element={<TyphoonForm />} />
        <Route path="/admin/typhoons/:id/edit" element={<TyphoonForm />} />
        <Route path="/admin/locations/new" element={<MapLayerForm />} />
        <Route path="/admin/locations/:id" element={<MapLayerForm />} />
        <Route path="/admin/locations/:id/edit" element={<MapLayerForm />} />
        <Route path="/geotag-camera" element={<GeotagCamera />} />
        <Route path="/hotlines" element={<HotlineNumbers />} />
        <Route path="/report-incident" element={<ReportIncident />} />
        <Route path="/typhoon-dashboard" element={<TyphoonDashboard />} />
        <Route path="/typhoon-history" element={<TyphoonHistory />} />
        <Route path="/interactive-map" element={<InteractiveMap />} />
        <Route path="/disaster-guidelines" element={<DisasterGuidelines />} />
        <Route path="/support-resources" element={<SupportResources />} />
        <Route path="/emergency-plan" element={<EmergencyPlan />} />
      </Routes>
      
      {showBottomNav && <BottomNavBar />}
      <OfflineIndicator />
    </div>
  );
}

function App() {
  // Handle messages from service worker
  React.useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        const { synced, failed } = event.data;
        if (synced > 0) {
          toast.success(`Synced ${synced} offline reports successfully!`);
        }
        if (failed > 0) {
          toast.error(`Failed to sync ${failed} reports. They remain in the queue.`);
        }
      }
    };

    // Add message listener
    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Cleanup listener on unmount
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <BrowserRouter>
        <TyphoonAlertWatcher />
        <Toaster position="top-center" expand={true} richColors />
        <HotToaster position="top-center" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;