import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './assets/styles/main.css';
import './components/common/Spinner.css';
import './index.css';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from '../src/components/auth/Login';
import RegisterPage from '../src/components/auth/Register';
import HomePage from './pages/HomePage';

// Hotel Pages
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';

// Restaurant Pages
import RestaurantsPage from '../src/pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import AddEditRestaurantPage from './pages/AddEditRestaurantPage';

// Cab Service Pages
import CabsPage from './pages/CabsPage';
import CabDetailPage from './pages/CabDetailPage';
import AddEditCabPage from './pages/AddEditCabPage';

// Guide Pages
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import AddEditGuidePage from './pages/AddEditGuidePage';

// Trip Plan Pages
import TripPlansPage from './pages/TripPlansPage';
import TripPlanDetailPage from './pages/TripPlanDetailPage';
import AddEditTripPlanPage from './pages/AddEditTripPlanPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />

              {/* Hotel Routes */}
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/:id" element={<HotelDetailPage />} />

              {/* Restaurant Routes - More specific routes first */}
              <Route path="/restaurants/add" element={
                <ProtectedRoute roles={['restaurant_owner']}>
                  <AddEditRestaurantPage />
                </ProtectedRoute>
              } />
              <Route path="/restaurants/edit/:id" element={
                <ProtectedRoute roles={['restaurant_owner']}>
                  <AddEditRestaurantPage isEdit={true} />
                </ProtectedRoute>
              } />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />

              {/* Cab Service Routes */}
              <Route path="/cabs/add" element={
                <ProtectedRoute roles={['cab_driver']}>
                  <AddEditCabPage />
                </ProtectedRoute>
              } />
              <Route path="/cabs/edit/:id" element={
                <ProtectedRoute roles={['cab_driver']}>
                  <AddEditCabPage isEdit={true} />
                </ProtectedRoute>
              } />
              <Route path="/cabs/:id" element={<CabDetailPage />} />
              <Route path="/cabs" element={<CabsPage />} />

              {/* Guide Routes */}
              <Route path="/guides/add" element={
                <ProtectedRoute roles={['guide']}>
                  <AddEditGuidePage />
                </ProtectedRoute>
              } />
              <Route path="/guides/edit/:id" element={
                <ProtectedRoute roles={['guide']}>
                  <AddEditGuidePage isEdit={true} />
                </ProtectedRoute>
              } />
              <Route path="/guides/:id" element={<GuideDetailPage />} />
              <Route path="/guides" element={<GuidesPage />} />

              {/* Trip Plan Routes */}
              <Route path="/trip-plans" element={
                <ProtectedRoute roles={['tourist']}>
                  <TripPlansPage />
                </ProtectedRoute>
              } />
              <Route path="/trip-plans/add" element={
                <ProtectedRoute roles={['tourist']}>
                  <AddEditTripPlanPage />
                </ProtectedRoute>
              } />
              <Route path="/trip-plans/edit/:id" element={
                <ProtectedRoute roles={['tourist']}>
                  <AddEditTripPlanPage isEdit={true} />
                </ProtectedRoute>
              } />
              <Route path="/trip-plans/:id" element={
                <ProtectedRoute roles={['tourist']}>
                  <TripPlanDetailPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="bottom-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;