import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Set auth token header
          axios.defaults.headers.common['x-auth-token'] = token;
          
          // Get user data
          const res = await axios.get(`${API_URL}/api/auth/me`);
          setUser(res.data);
        }
      } catch (err) {
        // Clear token on error
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        console.error('Authentication error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, [API_URL]);

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);
      
      // Set token in storage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Fetch user data after registration
      const userRes = await axios.get(`${API_URL}/api/auth/me`);
      setUser(userRes.data);
      
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      
      // Set token in storage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Fetch user data after login
      const userRes = await axios.get(`${API_URL}/api/auth/me`);
      setUser(userRes.data);
      
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token
    localStorage.removeItem('token');
    
    // Remove auth header
    delete axios.defaults.headers.common['x-auth-token'];
    
    // Clear user
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};