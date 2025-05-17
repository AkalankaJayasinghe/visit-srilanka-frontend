import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import HotelsPage from './pages/HotelsPage';
import RestaurantsPage from './pages/RestaurantsPage';
import CabsPage from './pages/CabsPage';
import GuidesPage from './pages/GuidesPage';
import TripPlanPage from './pages/TripPlanPage';
import ManageBusinessPage from './pages/ManageBusinessPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route path="/home" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      
      <Route path="/hotels" element={<HotelsPage />} />
      <Route path="/restaurants" element={<RestaurantsPage />} />
      <Route path="/cabs" element={<CabsPage />} />
      <Route path="/guides" element={<GuidesPage />} />
      
      <Route path="/trip-plan" element={
        <ProtectedRoute>
          <TripPlanPage />
        </ProtectedRoute>
      } />
      
      <Route path="/manage-business" element={
        <ProtectedRoute>
          <ManageBusinessPage />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;