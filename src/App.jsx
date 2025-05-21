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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

// Hotel Pages
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';

// Restaurant Pages
import RestaurantsPage from '../src/pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import AddEditRestaurantPage from './pages/AddEditRestaurantPage';

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
              
              {/* Restaurant Routes */}
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
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