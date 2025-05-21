import api from './api';
import { format, addDays } from 'date-fns';

// Get all trip plans for the logged-in user
export const getUserTripPlans = async () => {
  const response = await api.get('/trip-plans');
  return response.data;
};

// Get a specific trip plan by ID
export const getTripPlanById = async (id) => {
  const response = await api.get(`/trip-plans/${id}`);
  return response.data;
};

// Create a new trip plan
export const createTripPlan = async (tripPlanData) => {
  const response = await api.post('/trip-plans', tripPlanData);
  return response.data;
};

// Update an existing trip plan
export const updateTripPlan = async (id, tripPlanData) => {
  const response = await api.put(`/trip-plans/${id}`, tripPlanData);
  return response.data;
};

// Delete a trip plan
export const deleteTripPlan = async (id) => {
  const response = await api.delete(`/trip-plans/${id}`);
  return response.data;
};

// Get all hotels for selection
export const getHotels = async () => {
  const response = await api.get('/hotels');
  return response.data;
};

// Get all restaurants for selection
export const getRestaurants = async () => {
  const response = await api.get('/restaurants');
  return response.data;
};

// Get all cab services for selection
export const getCabServices = async () => {
  const response = await api.get('/cabs');
  return response.data;
};

// Get all guides for selection
export const getGuides = async () => {
  const response = await api.get('/guides');
  return response.data;
};

// Helper function to format location data safely
export const formatLocation = (location) => {
  if (!location) return 'Location not available';
  
  if (typeof location === 'string') return location;
  
  if (typeof location === 'object') {
    // Return the most specific location info available
    if (location.address) return location.address;
    if (location.city) return location.city;
    if (location.coordinates && Array.isArray(location.coordinates)) 
      return `${location.coordinates[0]}, ${location.coordinates[1]}`;
    
    // Generic object stringification as fallback
    try {
      return JSON.stringify(location);
    } catch (e) {
      return 'Complex location';
    }
  }
  
  return String(location);
};

// Helper function to create calendar events from trip plan data
export const createEventsFromTripPlan = (plan) => {
  if (!plan) return [];
  
  let allEvents = [];
  
  // Add hotel events
  if (plan.hotels && plan.hotels.length > 0) {
    plan.hotels.forEach(hotel => {
      const hotelName = hotel.hotelId?.name || 'Hotel';
      let locationInfo = '';
      
      // Handle location object if exists
      if (hotel.hotelId?.location) {
        const location = formatLocation(hotel.hotelId.location);
        if (location !== 'Location not available') {
          locationInfo = ` (${location})`;
        }
      }
      
      allEvents.push({
        title: `Check-in: ${hotelName}${locationInfo}`,
        date: format(new Date(hotel.checkIn), 'yyyy-MM-dd'),
        type: 'hotel',
        icon: 'fas fa-door-open',
        color: '#319795'
      });
      
      allEvents.push({
        title: `Check-out: ${hotelName}${locationInfo}`,
        date: format(new Date(hotel.checkOut), 'yyyy-MM-dd'),
        type: 'hotel',
        icon: 'fas fa-door-closed',
        color: '#319795'
      });
    });
  }
  
  // Add restaurant events
  if (plan.restaurants && plan.restaurants.length > 0) {
    plan.restaurants.forEach(restaurant => {
      const restaurantName = restaurant.restaurantId?.name || 'Restaurant';
      let locationInfo = '';
      
      // Handle location object if exists
      if (restaurant.restaurantId?.location) {
        const location = formatLocation(restaurant.restaurantId.location);
        if (location !== 'Location not available') {
          locationInfo = ` (${location})`;
        }
      }
      
      allEvents.push({
        title: `Meal at ${restaurantName}${locationInfo}`,
        date: format(new Date(restaurant.date), 'yyyy-MM-dd'),
        time: restaurant.time,
        type: 'restaurant',
        icon: 'fas fa-utensils',
        color: '#C05621'
      });
    });
  }
  
  // Add cab service events
  if (plan.cabServices && plan.cabServices.length > 0) {
    plan.cabServices.forEach(cab => {
      const cabName = cab.cabServiceId?.name || 'Cab Service';
      
      allEvents.push({
        title: `${cabName}: ${cab.pickup} to ${cab.dropoff}`,
        date: format(new Date(cab.date), 'yyyy-MM-dd'),
        type: 'cab',
        icon: 'fas fa-car',
        color: '#6B46C1'
      });
    });
  }
  
  // Add guide events (add for each day in range)
  if (plan.guides && plan.guides.length > 0) {
    plan.guides.forEach(guide => {
      const guideName = guide.guideId?.name || 'Tour Guide';
      const startDate = new Date(guide.startDate);
      const endDate = new Date(guide.endDate);
      
      // Add for each day in the range
      let currentDate = startDate;
      while (currentDate <= endDate) {
        allEvents.push({
          title: `Guide: ${guideName}`,
          date: format(currentDate, 'yyyy-MM-dd'),
          type: 'guide',
          icon: 'fas fa-user-tie',
          color: '#D69E2E'
        });
        
        currentDate = addDays(currentDate, 1);
      }
    });
  }
  
  // Sort events by date
  allEvents.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  
  return allEvents;
};

// Function to calculate trip duration in days
export const calculateTripDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

// Format date helper
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMM d, yyyy');
};

// Format time helper
export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const amPm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${amPm}`;
};

// Helper to get correct image URL
export const getImageUrl = (service, type, API_URL) => {
  if (!service) return `/images/${type}-placeholder.jpg`;
  
  // If service has no images array or it's empty
  if (!service.images || !Array.isArray(service.images) || service.images.length === 0) {
    return `/images/${type}-placeholder.jpg`;
  }
  
  let imagePath = service.images[0];
  
  // If imagePath is an object (could happen in some cases)
  if (typeof imagePath === 'object') {
    // Try to get url or path property
    imagePath = imagePath.url || imagePath.path || imagePath.src || '';
    if (!imagePath) return `/images/${type}-placeholder.jpg`;
  }
  
  // Check if the path is already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Combine the API URL with the image path
  const apiUrl = API_URL?.endsWith('/') ? API_URL.slice(0, -1) : API_URL || '';
  const imgPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${apiUrl}${imgPath}`;
};

export default {
  getUserTripPlans,
  getTripPlanById,
  createTripPlan,
  updateTripPlan,
  deleteTripPlan,
  getHotels,
  getRestaurants,
  getCabServices,
  getGuides,
  createEventsFromTripPlan,
  calculateTripDuration,
  formatDate,
  formatTime,
  getImageUrl,
  formatLocation
};