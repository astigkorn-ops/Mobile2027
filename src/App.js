import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import '@/App.css';
import { Toaster } from 'sonner';
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
import AdminSetup from './pages/AdminSetup';
import BottomNavBar from './components/BottomNavBar';
import { OfflineIndicator } from './components/OfflineIndicator';

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
        <Route path="/geotag-camera" element={<GeotagCamera />} />
        <Route path="/hotlines" element={<HotlineNumbers />} />
        <Route path="/report-incident" element={<ReportIncident />} />
        <Route path="/typhoon-dashboard" element={<TyphoonDashboard />} />
        <Route path="/typhoon-history" element={<TyphoonHistory />} />
        <Route path="/interactive-map" element={<InteractiveMap />} />
        <Route path="/disaster-guidelines" element={<DisasterGuidelines />} />
        <Route path="/support-resources" element={<SupportResources />} />
        <Route path="/emergency-plan" element={<EmergencyPlan />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
      </Routes>
      
      {showBottomNav && <BottomNavBar />}
      <OfflineIndicator />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
        <TyphoonAlertWatcher />
        <Toaster position="top-center" expand={true} richColors />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
