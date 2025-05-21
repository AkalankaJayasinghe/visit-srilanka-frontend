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
          
          // Debug: Log the user data received from API
          console.log('User data from API:', res.data);
          
          // Process user data to ensure role is accessible
          const userData = processUserData(res.data);
          
          setUser(userData);
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

  // Process user data to ensure role property exists
  const processUserData = (userData) => {
    if (!userData) return null;
    
    // Clone the user data
    const processedUser = { ...userData };
    
    // Make sure role is at the top level for easy access
    const rolePropertyNames = ['role', 'userRole', 'user_role', 'userType', 'type', 'role_id'];
    
    // Find the first property that contains role information
    let foundRoleProperty = false;
    
    for (const propName of rolePropertyNames) {
      if (processedUser[propName]) {
        // If role property exists, ensure it's normalized
        processedUser.role = processedUser[propName];
        foundRoleProperty = true;
        console.log(`Found role as ${propName}:`, processedUser.role);
        break;
      }
    }
    
    // If no role property found at top level, try to find it in nested objects
    if (!foundRoleProperty) {
      // Check if user data might be nested
      if (processedUser.user && typeof processedUser.user === 'object') {
        console.log('Looking for role in nested user object');
        for (const propName of rolePropertyNames) {
          if (processedUser.user[propName]) {
            processedUser.role = processedUser.user[propName];
            foundRoleProperty = true;
            console.log(`Found role in nested object as ${propName}:`, processedUser.role);
            break;
          }
        }
      }
    }
    
    // If we still don't have a role, log a warning
    if (!foundRoleProperty) {
      console.warn('Could not find role property in user data:', processedUser);
    }
    
    return processedUser;
  };

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
      
      // Process user data
      const userData = processUserData(userRes.data);
      setUser(userData);
      
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      
      // Debug: Log the login response
      console.log('Login response:', res.data);
      
      // Set token in storage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token header
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Fetch user data after login
      const userRes = await axios.get(`${API_URL}/api/auth/me`);
      
      // Debug: Log the user data
      console.log('User data after login:', userRes.data);
      
      // Process user data
      const userData = processUserData(userRes.data);
      setUser(userData);
      
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