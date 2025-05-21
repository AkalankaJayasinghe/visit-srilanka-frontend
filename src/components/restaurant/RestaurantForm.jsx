import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import './RestaurantForm.css';

const RestaurantForm = ({ onRestaurantAdded, editMode = false, restaurantId = null, onRestaurantUpdated = null }) => {
  const { user } = useAuth();
  const [isFormVisible, setIsFormVisible] = useState(editMode);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRestaurant, setLoadingRestaurant] = useState(editMode);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const fileInputRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      coordinates: {
        lat: '',
        lng: ''
      }
    },
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    cuisine: [],
    priceRange: '',
    openingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '22:00' }
    }
  });

  // Cuisine types list
  const cuisineTypes = [
    'Sri Lankan', 'Indian', 'Chinese', 'Italian', 'Japanese', 
    'Thai', 'Mexican', 'French', 'American', 'Other'
  ];

  // Fetch restaurant data if in edit mode
  useEffect(() => {
    if (editMode && restaurantId) {
      const fetchRestaurantData = async () => {
        setLoadingRestaurant(true);
        try {
          const response = await axios.get(`${API_URL}/api/restaurants/${restaurantId}`);
          const restaurant = response.data;
          
          // Set form data
          setFormData({
            name: restaurant.name,
            description: restaurant.description,
            location: restaurant.location,
            contactInfo: restaurant.contactInfo,
            cuisine: restaurant.cuisine,
            priceRange: restaurant.priceRange,
            openingHours: restaurant.openingHours || {
              monday: { open: '09:00', close: '22:00' },
              tuesday: { open: '09:00', close: '22:00' },
              wednesday: { open: '09:00', close: '22:00' },
              thursday: { open: '09:00', close: '22:00' },
              friday: { open: '09:00', close: '22:00' },
              saturday: { open: '09:00', close: '22:00' },
              sunday: { open: '09:00', close: '22:00' }
            }
          });
          
          // Set existing images
          if (restaurant.images && restaurant.images.length > 0) {
            setExistingImages(restaurant.images);
          }
          
        } catch (error) {
          console.error('Error fetching restaurant:', error);
          toast.error('Failed to load restaurant data');
        } finally {
          setLoadingRestaurant(false);
        }
      };
      
      fetchRestaurantData();
    }
  }, [editMode, restaurantId, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const fields = name.split('.');
      if (fields.length === 2) {
        setFormData({
          ...formData,
          [fields[0]]: {
            ...formData[fields[0]],
            [fields[1]]: value
          }
        });
      } else if (fields.length === 3) {
        setFormData({
          ...formData,
          [fields[0]]: {
            ...formData[fields[0]],
            [fields[1]]: {
              ...formData[fields[0]][fields[1]],
              [fields[2]]: value
            }
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCuisineChange = (e) => {
    const options = e.target.options;
    const selectedCuisines = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCuisines.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      cuisine: selectedCuisines
    });
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          [field]: value
        }
      }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 5 images total (existing + new)
    if (files.length + images.length + existingImages.length > 5) {
      toast.error('You can only upload up to 5 images in total');
      return;
    }
    
    setImages([...images, ...files]);
    
    // Create preview URLs
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newImagePreviews]);
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    const updatedPreviews = [...imagePreview];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviews[index]);
    
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setImages(updatedImages);
    setImagePreview(updatedPreviews);
  };

  const removeExistingImage = async (index) => {
    if (editMode && restaurantId) {
      try {
        await axios.delete(`${API_URL}/api/restaurants/${restaurantId}/images/${index}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        // Update local state
        const updatedImages = [...existingImages];
        updatedImages.splice(index, 1);
        setExistingImages(updatedImages);
        toast.success('Image removed successfully');
      } catch (error) {
        console.error('Error removing image:', error);
        toast.error('Failed to remove image');
      }
    }
  };

  const resetForm = () => {
    // Reset form data
    setFormData({
      name: '',
      description: '',
      location: {
        address: '',
        city: '',
        coordinates: {
          lat: '',
          lng: ''
        }
      },
      contactInfo: {
        phone: '',
        email: '',
        website: ''
      },
      cuisine: [],
      priceRange: '',
      openingHours: {
        monday: { open: '09:00', close: '22:00' },
        tuesday: { open: '09:00', close: '22:00' },
        wednesday: { open: '09:00', close: '22:00' },
        thursday: { open: '09:00', close: '22:00' },
        friday: { open: '09:00', close: '22:00' },
        saturday: { open: '09:00', close: '22:00' },
        sunday: { open: '09:00', close: '22:00' }
      }
    });
    
    // Reset images
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreview([]);
    setExistingImages([]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format image path correctly for display
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/restaurant-placeholder.jpg';
    
    // Check if the path is already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Combine the API URL with the image path
    const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const imgPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${apiUrl}${imgPath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create FormData for file uploads
      const restaurantData = new FormData();
      
      // Add basic fields
      restaurantData.append('name', formData.name);
      restaurantData.append('description', formData.description);
      
      // Add location fields
      restaurantData.append('location.address', formData.location.address);
      restaurantData.append('location.city', formData.location.city);
      if (formData.location.coordinates.lat) {
        restaurantData.append('location.coordinates.lat', formData.location.coordinates.lat);
      }
      if (formData.location.coordinates.lng) {
        restaurantData.append('location.coordinates.lng', formData.location.coordinates.lng);
      }
      
      // Add contact info
      restaurantData.append('contactInfo.phone', formData.contactInfo.phone);
      restaurantData.append('contactInfo.email', formData.contactInfo.email);
      if (formData.contactInfo.website) {
        restaurantData.append('contactInfo.website', formData.contactInfo.website);
      }
      
      // Add cuisine (multiple values)
      formData.cuisine.forEach(cuisine => {
        restaurantData.append('cuisine', cuisine);
      });
      
      // Add price range
      restaurantData.append('priceRange', formData.priceRange);
      
      // Add opening hours
      for (const day in formData.openingHours) {
        restaurantData.append(`openingHours.${day}.open`, formData.openingHours[day].open);
        restaurantData.append(`openingHours.${day}.close`, formData.openingHours[day].close);
      }
      
      // Add new images
      images.forEach(image => {
        restaurantData.append('images', image);
      });
      
      let response;
      
      if (editMode && restaurantId) {
        // Update existing restaurant
        response = await axios.put(`${API_URL}/api/restaurants/${restaurantId}`, restaurantData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        toast.success('Restaurant updated successfully!');
        if (onRestaurantUpdated) {
          onRestaurantUpdated(response.data);
        }
      } else {
        // Create new restaurant
        response = await axios.post(`${API_URL}/api/restaurants`, restaurantData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        toast.success('Restaurant added successfully!');
        if (onRestaurantAdded) {
          onRestaurantAdded(response.data);
        }
      }
      
      // Reset form and close it if not editing
      resetForm();
      if (!editMode) {
        setIsFormVisible(false);
      }
      
    } catch (err) {
      console.error('Error with restaurant:', err);
      console.error('Error details:', err.response?.data);
      toast.error(err.response?.data?.message || `Error ${editMode ? 'updating' : 'adding'} restaurant`);
    } finally {
      setIsLoading(false);
    }
  };

  // Only restaurant owners should see this form
  if (user?.role !== 'restaurant_owner') {
    return null;
  }

  // Show loading state when fetching data in edit mode
  if (loadingRestaurant) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading restaurant data...</p>
      </div>
    );
  }

  return (
    <div className="restaurant-form-container">
      {!isFormVisible ? (
        <button 
          className="btn btn-primary add-restaurant-btn"
          onClick={() => setIsFormVisible(true)}
        >
          <i className="fas fa-plus"></i> Add New Restaurant
        </button>
      ) : (
        <div className="restaurant-form-card">
          <h2>{editMode ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label htmlFor="name">Restaurant Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter restaurant name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your restaurant"
                  rows="4"
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="cuisine">Cuisine Type(s)*</label>
                  <select
                    id="cuisine"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleCuisineChange}
                    required
                    multiple
                    size="5"
                  >
                    {cuisineTypes.map((cuisine, index) => (
                      <option key={index} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                  <small className="form-text">Hold Ctrl (or Cmd) to select multiple cuisines</small>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="priceRange">Price Range*</label>
                  <select
                    id="priceRange"
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select price range</option>
                    <option value="$">$ (Budget)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Expensive)</option>
                    <option value="$$$$">$$$$ (Very Expensive)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Location</h3>
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="location.address">Address*</label>
                  <input
                    type="text"
                    id="location.address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    required
                    placeholder="Street address"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="location.city">City*</label>
                  <input
                    type="text"
                    id="location.city"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    required
                    placeholder="City"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="location.coordinates.lat">Latitude (Optional)</label>
                  <input
                    type="text"
                    id="location.coordinates.lat"
                    name="location.coordinates.lat"
                    value={formData.location.coordinates.lat}
                    onChange={handleChange}
                    placeholder="e.g. 7.8731"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="location.coordinates.lng">Longitude (Optional)</label>
                  <input
                    type="text"
                    id="location.coordinates.lng"
                    name="location.coordinates.lng"
                    value={formData.location.coordinates.lng}
                    onChange={handleChange}
                    placeholder="e.g. 80.7718"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-group">
                <label htmlFor="contactInfo.phone">Phone Number*</label>
                <input
                  type="tel"
                  id="contactInfo.phone"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contactInfo.email">Email*</label>
                <input
                  type="email"
                  id="contactInfo.email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="contactInfo.website">Website (Optional)</label>
                <input
                  type="url"
                  id="contactInfo.website"
                  name="contactInfo.website"
                  value={formData.contactInfo.website}
                  onChange={handleChange}
                  placeholder="e.g. https://www.myrestaurant.com"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Opening Hours</h3>
              <div className="opening-hours-container">
                {Object.keys(formData.openingHours).map((day) => (
                  <div key={day} className="opening-hours-row">
                    <div className="day-name">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </div>
                    <div className="hours-inputs">
                      <div className="time-input">
                        <label>Opens:</label>
                        <input
                          type="time"
                          value={formData.openingHours[day].open}
                          onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        />
                      </div>
                      <div className="time-separator">to</div>
                      <div className="time-input">
                        <label>Closes:</label>
                        <input
                          type="time"
                          value={formData.openingHours[day].close}
                          onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-section">
              <h3>Restaurant Images</h3>
              <p className="section-note">Upload up to 5 images of your restaurant (max 5MB each)</p>
              
              {/* Existing Images (Edit Mode) */}
              {existingImages.length > 0 && (
                <>
                  <h4>Current Images</h4>
                  <div className="image-preview-container">
                    {existingImages.map((src, index) => (
                      <div key={`existing-${index}`} className="image-preview">
                        <img src={getImageUrl(src)} alt={`Restaurant ${index + 1}`} />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => removeExistingImage(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* New Images */}
              <div className="upload-container">
                <div className="upload-btn-wrapper">
                  <button 
                    type="button" 
                    className="btn btn-secondary upload-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <i className="fas fa-cloud-upload-alt"></i> {existingImages.length > 0 ? 'Add More Images' : 'Upload Images'}
                  </button>
                  <span className="upload-info">
                    {images.length + existingImages.length} of 5 images
                  </span>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              
              {/* Preview of new images */}
              {imagePreview.length > 0 && (
                <>
                  <h4>New Images</h4>
                  <div className="image-preview-container">
                    {imagePreview.map((src, index) => (
                      <div key={`new-${index}`} className="image-preview">
                        <img src={src} alt={`Preview ${index + 1}`} />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  resetForm();
                  if (!editMode) setIsFormVisible(false);
                }}
                disabled={isLoading}
              >
                {editMode ? 'Cancel Changes' : 'Cancel'}
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading 
                  ? (editMode ? 'Updating...' : 'Adding...') 
                  : (editMode ? 'Update Restaurant' : 'Add Restaurant')
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RestaurantForm;