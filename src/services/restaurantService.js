import api from './api';

export const getAllRestaurants = async (params = {}) => {
  const response = await api.get('/restaurants', { params });
  return response.data;
};

export const getRestaurantById = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

export const createRestaurant = async (restaurantData) => {
  const formData = new FormData();
  
  // Handle nested objects like location, contactInfo and openingHours
  Object.keys(restaurantData).forEach(key => {
    if (key !== 'images' && key !== 'openingHours' && key !== 'location' && key !== 'contactInfo' && restaurantData[key] !== undefined) {
      // Handle arrays (like cuisine)
      if (Array.isArray(restaurantData[key])) {
        restaurantData[key].forEach(item => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, restaurantData[key]);
      }
    }
  });
  
  // Handle nested location object
  if (restaurantData.location) {
    Object.keys(restaurantData.location).forEach(key => {
      if (key !== 'coordinates' && restaurantData.location[key] !== undefined) {
        formData.append(`location.${key}`, restaurantData.location[key]);
      }
    });
    
    // Handle coordinates
    if (restaurantData.location.coordinates) {
      if (restaurantData.location.coordinates.lat) {
        formData.append('location.coordinates.lat', restaurantData.location.coordinates.lat);
      }
      if (restaurantData.location.coordinates.lng) {
        formData.append('location.coordinates.lng', restaurantData.location.coordinates.lng);
      }
    }
  }
  
  // Handle nested contactInfo object
  if (restaurantData.contactInfo) {
    Object.keys(restaurantData.contactInfo).forEach(key => {
      if (restaurantData.contactInfo[key] !== undefined) {
        formData.append(`contactInfo.${key}`, restaurantData.contactInfo[key]);
      }
    });
  }
  
  // Handle opening hours
  if (restaurantData.openingHours) {
    Object.keys(restaurantData.openingHours).forEach(day => {
      if (restaurantData.openingHours[day].open) {
        formData.append(`openingHours.${day}.open`, restaurantData.openingHours[day].open);
      }
      if (restaurantData.openingHours[day].close) {
        formData.append(`openingHours.${day}.close`, restaurantData.openingHours[day].close);
      }
    });
  }
  
  // Add images
  if (restaurantData.images && Array.isArray(restaurantData.images)) {
    restaurantData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await api.post('/restaurants', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateRestaurant = async (id, restaurantData) => {
  const formData = new FormData();
  
  // Handle basic fields
  Object.keys(restaurantData).forEach(key => {
    if (key !== 'images' && key !== 'openingHours' && key !== 'location' && key !== 'contactInfo' && restaurantData[key] !== undefined) {
      // Handle arrays (like cuisine)
      if (Array.isArray(restaurantData[key])) {
        restaurantData[key].forEach(item => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, restaurantData[key]);
      }
    }
  });
  
  // Handle nested location object
  if (restaurantData.location) {
    Object.keys(restaurantData.location).forEach(key => {
      if (key !== 'coordinates' && restaurantData.location[key] !== undefined) {
        formData.append(`location.${key}`, restaurantData.location[key]);
      }
    });
    
    // Handle coordinates
    if (restaurantData.location.coordinates) {
      if (restaurantData.location.coordinates.lat) {
        formData.append('location.coordinates.lat', restaurantData.location.coordinates.lat);
      }
      if (restaurantData.location.coordinates.lng) {
        formData.append('location.coordinates.lng', restaurantData.location.coordinates.lng);
      }
    }
  }
  
  // Handle nested contactInfo object
  if (restaurantData.contactInfo) {
    Object.keys(restaurantData.contactInfo).forEach(key => {
      if (restaurantData.contactInfo[key] !== undefined) {
        formData.append(`contactInfo.${key}`, restaurantData.contactInfo[key]);
      }
    });
  }
  
  // Handle opening hours
  if (restaurantData.openingHours) {
    Object.keys(restaurantData.openingHours).forEach(day => {
      if (restaurantData.openingHours[day].open) {
        formData.append(`openingHours.${day}.open`, restaurantData.openingHours[day].open);
      }
      if (restaurantData.openingHours[day].close) {
        formData.append(`openingHours.${day}.close`, restaurantData.openingHours[day].close);
      }
    });
  }
  
  // Add images
  if (restaurantData.images && Array.isArray(restaurantData.images)) {
    restaurantData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  // Flag to replace all images if needed
  if (restaurantData.replace_images) {
    formData.append('replace_images', restaurantData.replace_images);
  }
  
  const response = await api.put(`/restaurants/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteRestaurant = async (id) => {
  const response = await api.delete(`/restaurants/${id}`);
  return response.data;
};

export const deleteRestaurantImage = async (restaurantId, imageIndex) => {
  const response = await api.delete(`/restaurants/${restaurantId}/images/${imageIndex}`);
  return response.data;
};

export const searchRestaurantsByCuisine = async (cuisine) => {
  const response = await api.get(`/restaurants/search`, {
    params: { cuisine }
  });
  return response.data;
};