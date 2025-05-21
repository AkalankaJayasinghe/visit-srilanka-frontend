import api from './api';

export const getAllCabServices = async (params = {}) => {
  const response = await api.get('/cabs', { params });
  return response.data;
};

export const getCabServiceById = async (id) => {
  const response = await api.get(`/cabs/${id}`);
  return response.data;
};

export const createCabService = async (cabData) => {
  const formData = new FormData();
  
  // Handle basic fields
  Object.keys(cabData).forEach(key => {
    if (key !== 'images' && key !== 'contactInfo' && key !== 'operatingAreas' && cabData[key] !== undefined) {
      formData.append(key, cabData[key]);
    }
  });
  
  // Handle contact info
  if (cabData.contactInfo) {
    Object.keys(cabData.contactInfo).forEach(key => {
      if (cabData.contactInfo[key] !== undefined) {
        formData.append(`contactInfo.${key}`, cabData.contactInfo[key]);
      }
    });
  }
  
  // Handle operating areas (array)
  if (cabData.operatingAreas && Array.isArray(cabData.operatingAreas)) {
    cabData.operatingAreas.forEach(area => {
      formData.append('operatingAreas', area);
    });
  }
  
  // Add images
  if (cabData.images && Array.isArray(cabData.images)) {
    cabData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await api.post('/cabs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateCabService = async (id, cabData) => {
  const formData = new FormData();
  
  // Handle basic fields
  Object.keys(cabData).forEach(key => {
    if (key !== 'images' && key !== 'contactInfo' && key !== 'operatingAreas' && cabData[key] !== undefined) {
      formData.append(key, cabData[key]);
    }
  });
  
  // Handle contact info
  if (cabData.contactInfo) {
    Object.keys(cabData.contactInfo).forEach(key => {
      if (cabData.contactInfo[key] !== undefined) {
        formData.append(`contactInfo.${key}`, cabData.contactInfo[key]);
      }
    });
  }
  
  // Handle operating areas (array)
  if (cabData.operatingAreas && Array.isArray(cabData.operatingAreas)) {
    cabData.operatingAreas.forEach(area => {
      formData.append('operatingAreas', area);
    });
  }
  
  // Add images
  if (cabData.images && Array.isArray(cabData.images)) {
    cabData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  // Flag to replace all images if needed
  if (cabData.replace_images) {
    formData.append('replace_images', cabData.replace_images);
  }
  
  const response = await api.put(`/cabs/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteCabService = async (id) => {
  const response = await api.delete(`/cabs/${id}`);
  return response.data;
};

export const deleteCabServiceImage = async (cabId, imageIndex) => {
  const response = await api.delete(`/cabs/${cabId}/images/${imageIndex}`);
  return response.data;
};

export const searchCabServicesByArea = async (area) => {
  const response = await api.get(`/cabs/search`, {
    params: { area }
  });
  return response.data;
};