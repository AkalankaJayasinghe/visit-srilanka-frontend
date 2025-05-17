import api from './api';

export const getAllHotels = async (params = {}) => {
  const response = await api.get('/hotels', { params });
  return response.data;
};

export const getHotelById = async (id) => {
  const response = await api.get(`/hotels/${id}`);
  return response.data;
};

export const createHotel = async (hotelData) => {
  const formData = new FormData();
  
  // Convert regular fields
  Object.keys(hotelData).forEach(key => {
    if (key !== 'images' && hotelData[key] !== undefined) {
      formData.append(key, hotelData[key]);
    }
  });
  
  // Add images
  if (hotelData.images) {
    hotelData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await api.post('/hotels', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateHotel = async (id, hotelData) => {
  const formData = new FormData();
  
  // Convert regular fields
  Object.keys(hotelData).forEach(key => {
    if (key !== 'images' && hotelData[key] !== undefined) {
      formData.append(key, hotelData[key]);
    }
  });
  
  // Add images
  if (hotelData.images) {
    hotelData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await api.put(`/hotels/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteHotel = async (id) => {
  const response = await api.delete(`/hotels/${id}`);
  return response.data;
};