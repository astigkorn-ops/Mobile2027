import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TyphoonDashboard from './pages/TyphoonDashboard';
import TyphoonHistory from './pages/TyphoonHistory';
import InteractiveMap from './pages/InteractiveMap';
import HotlineNumbers from './pages/HotlineNumbers';
import DisasterGuidelines from './pages/DisasterGuidelines';
import EmergencyPlan from './pages/EmergencyPlan';
import SupportResources from './pages/SupportResources';
import ReportIncident from './pages/ReportIncident';
import GeotagCamera from './pages/GeotagCamera';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TyphoonForm from './pages/TyphoonForm';
import MapLayerForm from './pages/MapLayerForm';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/typhoon" element={<TyphoonDashboard />} />
      <Route path="/typhoon-history" element={<TyphoonHistory />} />
      <Route path="/map" element={<InteractiveMap />} />
      <Route path="/hotlines" element={<HotlineNumbers />} />
      <Route path="/guidelines" element={<DisasterGuidelines />} />
      <Route path="/emergency-plan" element={<EmergencyPlan />} />
      <Route path="/resources" element={<SupportResources />} />
      <Route path="/report-incident" element={
        <ProtectedRoute>
          <ReportIncident />
        </ProtectedRoute>
      } />
      <Route path="/geotag-camera" element={
        <ProtectedRoute>
          <GeotagCamera />
        </ProtectedRoute>
      } />
      <Route path="/login" element={<Login />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/typhoons/new" element={
        <ProtectedRoute requiredRole="admin">
          <TyphoonForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/typhoons/:typhoonId" element={
        <ProtectedRoute requiredRole="admin">
          <TyphoonForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/typhoons/:typhoonId/edit" element={
        <ProtectedRoute requiredRole="admin">
          <TyphoonForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/locations/new" element={
        <ProtectedRoute requiredRole="admin">
          <MapLayerForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/locations/:locationId" element={
        <ProtectedRoute requiredRole="admin">
          <MapLayerForm />
        </ProtectedRoute>
      } />
      <Route path="/admin/locations/:locationId/edit" element={
        <ProtectedRoute requiredRole="admin">
          <MapLayerForm />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppContent;