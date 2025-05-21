import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import './GuideForm.css';

const GuideForm = ({ onGuideAdded, editMode = false, guideId = null, onGuideUpdated = null, initialData = null }) => {
  const { user } = useAuth();
  const [isFormVisible, setIsFormVisible] = useState(editMode);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingGuide, setLoadingGuide] = useState(editMode);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const fileInputRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Common languages spoken in Sri Lanka
  const commonLanguages = [
    'English', 'Sinhala', 'Tamil', 'Hindi', 'French', 'German', 
    'Spanish', 'Chinese', 'Japanese', 'Russian', 'Italian', 'Arabic'
  ];
  
  // Common specializations for guides
  const commonSpecializations = [
    'Cultural Heritage', 'Wildlife & Nature', 'Adventure', 'Historical Sites', 
    'Culinary Tours', 'Photography Tours', 'Hiking & Trekking', 'Religious Sites',
    'City Tours', 'Beach & Coastal Tours', 'Ayurveda & Wellness'
  ];
  
  // Common areas in Sri Lanka for suggestions
  const commonAreas = [
    'Colombo', 'Kandy', 'Galle', 'Negombo', 'Nuwara Eliya', 'Anuradhapura',
    'Jaffna', 'Trincomalee', 'Batticaloa', 'Matara', 'Ella', 'Dambulla',
    'Sigiriya', 'Polonnaruwa', 'Yala', 'Udawalawe', 'Bentota', 'Mirissa'
  ];
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    experience: '',
    languages: [],
    specializations: [],
    areasOfOperation: [],
    contactInfo: {
      phone: '',
      email: ''
    },
    pricePerDay: '',
    availability: true
  });

  // Add new fields
  const [newLanguage, setNewLanguage] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newArea, setNewArea] = useState('');
  
  // UseEffect for initial data or fetching guide
  useEffect(() => {
    // If initialData is provided directly, use that
    if (editMode && initialData) {
      populateFormWithGuideData(initialData);
      setLoadingGuide(false);
    }
    // Otherwise fetch from API if we have a guide ID
    else if (editMode && guideId) {
      const fetchGuideData = async () => {
        setLoadingGuide(true);
        try {
          const response = await axios.get(`${API_URL}/api/guides/${guideId}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          populateFormWithGuideData(response.data);
        } catch (error) {
          console.error('Error fetching guide:', error);
          toast.error('Failed to load guide data');
        } finally {
          setLoadingGuide(false);
        }
      };
      
      fetchGuideData();
    }
  }, [editMode, initialData, guideId, API_URL]);

  // Helper function to populate form with guide data
  const populateFormWithGuideData = (guideData) => {
    if (!guideData) return;
    
    setFormData({
      name: guideData.name || '',
      bio: guideData.bio || '',
      experience: guideData.experience || '',
      languages: guideData.languages || [],
      specializations: guideData.specializations || [],
      areasOfOperation: guideData.areasOfOperation || [],
      contactInfo: {
        phone: guideData.contactInfo?.phone || '',
        email: guideData.contactInfo?.email || '',
      },
      pricePerDay: guideData.pricePerDay || '',
      availability: guideData.availability !== undefined ? guideData.availability : true
    });
    
    // Set existing images
    if (guideData.images && guideData.images.length > 0) {
      setExistingImages(guideData.images);
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

  const handleLanguageSelect = (e) => {
    const selectedLanguage = e.target.value;
    if (selectedLanguage && !formData.languages.includes(selectedLanguage)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, selectedLanguage]
      });
    }
  };

  const handleSpecializationSelect = (e) => {
    const selectedSpecialization = e.target.value;
    if (selectedSpecialization && !formData.specializations.includes(selectedSpecialization)) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, selectedSpecialization]
      });
    }
  };

  const handleAreaSelect = (e) => {
    const selectedArea = e.target.value;
    if (selectedArea && !formData.areasOfOperation.includes(selectedArea)) {
      setFormData({
        ...formData,
        areasOfOperation: [...formData.areasOfOperation, selectedArea]
      });
    }
  };

  const handleAddNewLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const handleAddNewSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, newSpecialization.trim()]
      });
      setNewSpecialization('');
    }
  };

  const handleAddNewArea = () => {
    if (newArea.trim() && !formData.areasOfOperation.includes(newArea.trim())) {
      setFormData({
        ...formData,
        areasOfOperation: [...formData.areasOfOperation, newArea.trim()]
      });
      setNewArea('');
    }
  };

  const handleRemoveLanguage = (languageToRemove) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(language => language !== languageToRemove)
    });
  };

  const handleRemoveSpecialization = (specializationToRemove) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter(specialization => specialization !== specializationToRemove)
    });
  };

  const handleRemoveArea = (areaToRemove) => {
    setFormData({
      ...formData,
      areasOfOperation: formData.areasOfOperation.filter(area => area !== areaToRemove)
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
    if (editMode && guideId) {
      try {
        await axios.delete(`${API_URL}/api/guides/${guideId}/images/${index}`, {
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
      bio: '',
      experience: '',
      languages: [],
      specializations: [],
      areasOfOperation: [],
      contactInfo: {
        phone: '',
        email: ''
      },
      pricePerDay: '',
      availability: true
    });
    
    // Reset images
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreview([]);
    setExistingImages([]);
    setNewLanguage('');
    setNewSpecialization('');
    setNewArea('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format image path correctly for display
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/guide-placeholder.jpg';
    
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
      if (formData.languages.length === 0) {
        toast.error('Please add at least one language');
        setIsLoading(false);
        return;
      }
      
      if (formData.specializations.length === 0) {
        toast.error('Please add at least one specialization');
        setIsLoading(false);
        return;
      }
      
      if (formData.areasOfOperation.length === 0) {
        toast.error('Please add at least one area of operation');
        setIsLoading(false);
        return;
      }
      
      // Create FormData for file uploads
      const guideData = new FormData();
      
      // Add basic fields
      guideData.append('name', formData.name);
      guideData.append('bio', formData.bio);
      guideData.append('experience', formData.experience);
      guideData.append('pricePerDay', formData.pricePerDay);
      guideData.append('availability', formData.availability);
      
      // Add contact info
      guideData.append('contactInfo.phone', formData.contactInfo.phone);
      guideData.append('contactInfo.email', formData.contactInfo.email);
      
      // Add arrays
      formData.languages.forEach(lang => {
        guideData.append('languages', lang);
      });
      
      formData.specializations.forEach(spec => {
        guideData.append('specializations', spec);
      });
      
      formData.areasOfOperation.forEach(area => {
        guideData.append('areasOfOperation', area);
      });
      
      // Add images
      images.forEach(image => {
        guideData.append('images', image);
      });
      
      let response;
      
      if (editMode && guideId) {
        // Update existing guide
        response = await axios.put(`${API_URL}/api/guides/${guideId}`, guideData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        toast.success('Guide profile updated successfully!');
        if (onGuideUpdated) {
          onGuideUpdated(response.data);
        }
      } else {
        // Create new guide
        response = await axios.post(`${API_URL}/api/guides`, guideData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        toast.success('Guide profile added successfully!');
        if (onGuideAdded) {
          onGuideAdded(response.data);
        }
      }
      
      // Reset form and close it if not editing
      resetForm();
      if (!editMode) {
        setIsFormVisible(false);
      }
      
    } catch (err) {
      console.error('Error with guide profile:', err);
      console.error('Error details:', err.response?.data);
      toast.error(err.response?.data?.message || `Error ${editMode ? 'updating' : 'adding'} guide profile`);
    } finally {
      setIsLoading(false);
    }
  };

  // Only guides should see this form
  if (user?.role !== 'guide') {
    return null;
  }

  // Show loading state when fetching data in edit mode
  if (loadingGuide) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading guide data...</p>
      </div>
    );
  }

  return (
    <div className="guide-form-container">
      {!isFormVisible ? (
        <button 
          className="btn btn-primary add-guide-btn"
          onClick={() => setIsFormVisible(true)}
        >
          <i className="fas fa-plus"></i> Create Guide Profile
        </button>
      ) : (
        <div className="guide-form-card">
          <h2>{editMode ? 'Edit Guide Profile' : 'Create Guide Profile'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label htmlFor="name">Full Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Professional Bio*</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  placeholder="Tell visitors about yourself, your experience, and what makes you a great guide..."
                  rows="5"
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="experience">Years of Experience*</label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Number of years"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="pricePerDay">Price per Day (USD)*</label>
                  <input
                    type="number"
                    id="pricePerDay"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 50.00"
                  />
                </div>
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="availability"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                />
                <label htmlFor="availability">Currently available for bookings</label>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Languages</h3>
              <p className="section-note">Add languages you can communicate fluently in</p>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="commonLanguages">Common Languages</label>
                  <select
                    id="commonLanguages"
                    onChange={handleLanguageSelect}
                    value=""
                  >
                    <option value="">Select language to add</option>
                    {commonLanguages.map((language, index) => (
                      <option key={index} value={language}>{language}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="newLanguage">Add Custom Language</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="newLanguage"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Enter language name"
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleAddNewLanguage}
                    >
                      <i className="fas fa-plus"></i> Add
                    </button>
                  </div>
                </div>
              </div>
              
              {formData.languages.length > 0 ? (
                <div className="selected-items">
                  <label>Selected Languages:</label>
                  <div className="items-tags">
                    {formData.languages.map((language, index) => (
                      <div key={index} className="item-tag">
                        <span>{language}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLanguage(language)}
                          className="remove-tag"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="no-items">No languages added yet</p>
              )}
            </div>
            
            <div className="form-section">
              <h3>Specializations</h3>
              <p className="section-note">Add areas you specialize in as a guide</p>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="commonSpecializations">Common Specializations</label>
                  <select
                    id="commonSpecializations"
                    onChange={handleSpecializationSelect}
                    value=""
                  >
                    <option value="">Select specialization to add</option>
                    {commonSpecializations.map((specialization, index) => (
                      <option key={index} value={specialization}>{specialization}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group half">
                  <label htmlFor="newSpecialization">Add Custom Specialization</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="newSpecialization"
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      placeholder="Enter specialization"
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleAddNewSpecialization}
                    >
                      <i className="fas fa-plus"></i> Add
                    </button>
                  </div>
                </div>
              </div>
              
              {formData.specializations.length > 0 ? (
                <div className="selected-items">
                  <label>Selected Specializations:</label>
                  <div className="items-tags">
                    {formData.specializations.map((specialization, index) => (
                      <div key={index} className="item-tag">
                        <span>{specialization}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSpecialization(specialization)}
                          className="remove-tag"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="no-items">No specializations added yet</p>
              )}
            </div>
            
            <div className="form-section">
              <h3>Areas of Operation</h3>
              <p className="section-note">Add areas in Sri Lanka where you can provide guide services</p>
              
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
              
              {formData.areasOfOperation.length > 0 ? (
                <div className="selected-items">
                  <label>Selected Areas:</label>
                  <div className="items-tags">
                    {formData.areasOfOperation.map((area, index) => (
                      <div key={index} className="item-tag">
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
                <p className="no-items">No areas added yet</p>
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
              <h3>Profile Images</h3>
              <p className="section-note">Upload up to 5 professional images of yourself or the locations you guide in (max 5MB each)</p>
              
              {/* Existing Images (Edit Mode) */}
              {existingImages.length > 0 && (
                <>
                  <h4>Current Images</h4>
                  <div className="image-preview-container">
                    {existingImages.map((src, index) => (
                      <div key={`existing-${index}`} className="image-preview">
                        <img src={getImageUrl(src)} alt={`Guide ${index + 1}`} />
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
                  ? (editMode ? 'Updating...' : 'Creating...') 
                  : (editMode ? 'Update Profile' : 'Create Profile')
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GuideForm;