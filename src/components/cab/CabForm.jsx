import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import './CabForm.css';

const CabForm = ({ onCabServiceAdded, editMode = false, cabServiceId = null, onCabServiceUpdated = null, initialData = null }) => {
  const { user } = useAuth();
  const [isFormVisible, setIsFormVisible] = useState(editMode);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCab, setLoadingCab] = useState(editMode);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const fileInputRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Common operating areas in Sri Lanka for suggestions
  const commonAreas = [
    'Colombo', 'Kandy', 'Galle', 'Negombo', 'Nuwara Eliya', 'Anuradhapura',
    'Jaffna', 'Trincomalee', 'Batticaloa', 'Matara', 'Ella', 'Dambulla'
  ];
  
  // Common vehicle types for dropdown
  const vehicleTypes = [
    'Sedan', 'SUV', 'Van', 'Mini-Bus', 'Luxury Car', 'Tuk-Tuk', 'Motorcycle'
  ];
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vehicleType: '',
    vehicleModel: '',
    licensePlate: '',
    capacity: '',
    pricePerKm: '',
    operatingAreas: [],
    contactInfo: {
      phone: '',
      email: ''
    },
    availability: true
  });

  // Add new area field
  const [newArea, setNewArea] = useState('');
  
  // UseEffect for initial data or fetching cab service
  useEffect(() => {
    // If initialData is provided directly, use that
    if (editMode && initialData) {
      populateFormWithCabData(initialData);
      setLoadingCab(false);
    }
    // Otherwise fetch from API if we have a cab ID
    else if (editMode && cabServiceId) {
      const fetchCabData = async () => {
        setLoadingCab(true);
        try {
          const response = await axios.get(`${API_URL}/api/cabs/${cabServiceId}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          populateFormWithCabData(response.data);
        } catch (error) {
          console.error('Error fetching cab service:', error);
          toast.error('Failed to load cab service data');
        } finally {
          setLoadingCab(false);
        }
      };
      
      fetchCabData();
    }
  }, [editMode, initialData, cabServiceId, API_URL]);

  // Helper function to populate form with cab data
  const populateFormWithCabData = (cabData) => {
    if (!cabData) return;
    
    setFormData({
      name: cabData.name || '',
      description: cabData.description || '',
      vehicleType: cabData.vehicleType || '',
      vehicleModel: cabData.vehicleModel || '',
      licensePlate: cabData.licensePlate || '',
      capacity: cabData.capacity || '',
      pricePerKm: cabData.pricePerKm || '',
      operatingAreas: cabData.operatingAreas || [],
      contactInfo: {
        phone: cabData.contactInfo?.phone || '',
        email: cabData.contactInfo?.email || '',
      },
      availability: cabData.availability !== undefined ? cabData.availability : true
    });
    
    // Set existing images
    if (cabData.images && cabData.images.length > 0) {
      setExistingImages(cabData.images);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAreaSelect = (e) => {
    const selectedArea = e.target.value;
    if (selectedArea && !formData.operatingAreas.includes(selectedArea)) {
      setFormData({
        ...formData,
        operatingAreas: [...formData.operatingAreas, selectedArea]
      });
    }
  };

  const handleAddNewArea = () => {
    if (newArea.trim() && !formData.operatingAreas.includes(newArea.trim())) {
      setFormData({
        ...formData,
        operatingAreas: [...formData.operatingAreas, newArea.trim()]
      });
      setNewArea('');
    }
  };

  const handleRemoveArea = (areaToRemove) => {
    setFormData({
      ...formData,
      operatingAreas: formData.operatingAreas.filter(area => area !== areaToRemove)
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
    if (editMode && cabServiceId) {
      try {
        await axios.delete(`${API_URL}/api/cabs/${cabServiceId}/images/${index}`, {
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
      vehicleType: '',
      vehicleModel: '',
      licensePlate: '',
      capacity: '',
      pricePerKm: '',
      operatingAreas: [],
      contactInfo: {
        phone: '',
        email: ''
      },
      availability: true
    });
    
    // Reset images
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreview([]);
    setExistingImages([]);
    setNewArea('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format image path correctly for display
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/cab-placeholder.jpg';
    
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
      // Validate form data
      if (formData.operatingAreas.length === 0) {
        toast.error('Please add at least one operating area');
        setIsLoading(false);
        return;
      }
      
      // Create FormData for file uploads
      const cabData = new FormData();
      
      // Add basic fields
      cabData.append('name', formData.name);
      cabData.append('description', formData.description);
      cabData.append('vehicleType', formData.vehicleType);
      cabData.append('vehicleModel', formData.vehicleModel);
      cabData.append('licensePlate', formData.licensePlate);
      cabData.append('capacity', formData.capacity);
      cabData.append('pricePerKm', formData.pricePerKm);
      cabData.append('availability', formData.availability);
      
      // Add contact info
      cabData.append('contactInfo.phone', formData.contactInfo.phone);
      cabData.append('contactInfo.email', formData.contactInfo.email);
      
      // Add operating areas
      formData.operatingAreas.forEach(area => {
        cabData.append('operatingAreas', area);
      });
      
      // Add new images
      images.forEach(image => {
        cabData.append('images', image);
      });
      
      let response;
      
      if (editMode && cabServiceId) {
        // Update existing cab service
        response = await axios.put(`${API_URL}/api/cabs/${cabServiceId}`, cabData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        toast.success('Cab service updated successfully!');
        if (onCabServiceUpdated) {
          onCabServiceUpdated(response.data);
        }
      } else {
        // Create new cab service
        response = await axios.post(`${API_URL}/api/cabs`, cabData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        toast.success('Cab service added successfully!');
        if (onCabServiceAdded) {
          onCabServiceAdded(response.data);
        }
      }
      
      // Reset form and close it if not editing
      resetForm();
      if (!editMode) {
        setIsFormVisible(false);
      }
      
    } catch (err) {
      console.error('Error with cab service:', err);
      console.error('Error details:', err.response?.data);
      toast.error(err.response?.data?.message || `Error ${editMode ? 'updating' : 'adding'} cab service`);
    } finally {
      setIsLoading(false);
    }
  };

  // Only cab drivers should see this form
  if (user?.role !== 'cab_driver') {
    return null;
  }

  // Show loading state when fetching data in edit mode
  if (loadingCab) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading cab service data...</p>
      </div>
    );
  }

  return (
    <div className="cab-form-container">
      {!isFormVisible ? (
        <button 
          className="btn btn-primary add-cab-btn"
          onClick={() => setIsFormVisible(true)}
        >
          <i className="fas fa-plus"></i> Add New Cab Service
        </button>
      ) : (
        <div className="cab-form-card">
          <h2>{editMode ? 'Edit Cab Service' : 'Add New Cab Service'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label htmlFor="name">Service Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter cab service name"
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
                  placeholder="Describe your cab service"
                  rows="4"
                ></textarea>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Vehicle Information</h3>
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="vehicleType">Vehicle Type*</label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select vehicle type</option>
                    {vehicleTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="vehicleModel">Vehicle Model*</label>
                  <input
                    type="text"
                    id="vehicleModel"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Toyota Corolla"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="licensePlate">License Plate Number*</label>
                  <input
                    type="text"
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    required
                    placeholder="e.g. ABC-1234"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="capacity">Passenger Capacity*</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="Number of passengers"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="pricePerKm">Price per Kilometer (USD)*</label>
                <input
                  type="number"
                  id="pricePerKm"
                  name="pricePerKm"
                  value={formData.pricePerKm}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 0.50"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="availability"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                />
                <label htmlFor="availability">Currently available for booking</label>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Operating Areas</h3>
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="commonAreas">Common Areas</label>
                  <select
                    id="commonAreas"
                    onChange={handleAreaSelect}
                    value=""
                  >
                    <option value="">Select area to add</option>
                    {commonAreas.map((area, index) => (
                      <option key={index} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="newArea">Add Custom Area</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="newArea"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      placeholder="Enter area name"
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleAddNewArea}
                    >
                      <i className="fas fa-plus"></i> Add
                    </button>
                  </div>
                </div>
              </div>
              
              {formData.operatingAreas.length > 0 ? (
                <div className="selected-areas">
                  <label>Selected Operating Areas:</label>
                  <div className="areas-tags">
                    {formData.operatingAreas.map((area, index) => (
                      <div key={index} className="area-tag">
                        <span>{area}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveArea(area)}
                          className="remove-tag"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="no-areas">No operating areas added yet</p>
              )}
            </div>
            
            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-row">
                <div className="form-group half">
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
                
                <div className="form-group half">
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
              </div>
            </div>
            
            <div className="form-section">
              <h3>Vehicle Images</h3>
              <p className="section-note">Upload up to 5 images of your vehicle (max 5MB each)</p>
              
              {/* Existing Images (Edit Mode) */}
              {existingImages.length > 0 && (
                <>
                  <h4>Current Images</h4>
                  <div className="image-preview-container">
                    {existingImages.map((src, index) => (
                      <div key={`existing-${index}`} className="image-preview">
                        <img src={getImageUrl(src)} alt={`Vehicle ${index + 1}`} />
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
                  : (editMode ? 'Update Cab Service' : 'Add Cab Service')
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CabForm;