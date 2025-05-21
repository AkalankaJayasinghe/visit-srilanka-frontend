import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Using Bearer token format
      config.headers.Authorization = `Bearer ${token}`;
      
      // Also include x-auth-token for compatibility with trip-plans API
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        
        // Only redirect if not already on login page (to avoid redirect loops)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (error.response.status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Permission denied:', error.response.data.message || 'You do not have permission to perform this action');
      } else if (error.response.status === 404) {
        // Not found
        console.error('Resource not found:', error.response.data.message || 'The requested resource was not found');
      } else if (error.response.status >= 500) {
        // Server error
        console.error('Server error:', error.response.data.message || 'An unexpected server error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error - no response received');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle file uploads and multipart/form-data requests
api.uploadFile = async (url, formData, config = {}) => {
  const token = localStorage.getItem('token');
  
  // Set proper headers for file upload
  const uploadConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } : {})
    },
    ...config
  };
  
  return axios.post(`${API_URL}${url}`, formData, uploadConfig);
};

export default api;