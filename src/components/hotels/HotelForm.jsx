import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import './HotelForm.css';

const HotelForm = ({ onHotelAdded }) => {
  const { user } = useAuth();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const fileInputRef = useRef(null);
  
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
    amenities: [],
    rooms: [
      {
        type: '',
        pricePerNight: '',
        capacity: '',
        available: true
      }
    ],
    starRating: 1
  });

  // Common amenities list for checkboxes
  const commonAmenities = [
    'Free WiFi', 'Swimming Pool', 'Restaurant', 'Bar', 'Fitness Center',
    'Spa', 'Free Parking', 'Room Service', 'Air Conditioning', 'TV',
    'Laundry Service', 'Airport Shuttle', 'Breakfast Included'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
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

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, value]
      });
    } else {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(amenity => amenity !== value)
      });
    }
  };

  const handleRoomChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedRooms = [...formData.rooms];
    
    if (type === 'checkbox') {
      updatedRooms[index][name] = checked;
    } else {
      updatedRooms[index][name] = value;
    }
    
    setFormData({
      ...formData,
      rooms: updatedRooms
    });
  };

  const addRoom = () => {
    setFormData({
      ...formData,
      rooms: [
        ...formData.rooms,
        {
          type: '',
          pricePerNight: '',
          capacity: '',
          available: true
        }
      ]
    });
  };

  const removeRoom = (index) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms.splice(index, 1);
    setFormData({
      ...formData,
      rooms: updatedRooms
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 5 images
    if (files.length + images.length > 5) {
      toast.error('You can only upload up to 5 images');
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

  const resetForm = () => {
    // Reset text inputs
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
      amenities: [],
      rooms: [
        {
          type: '',
          pricePerNight: '',
          capacity: '',
          available: true
        }
      ],
      starRating: 1
    });
    
    // Reset images
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreview([]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Preparing to submit hotel data...");
      console.log("Images to upload:", images.length);
      
      // Create FormData for file uploads
      const hotelData = new FormData();
      
      // Add basic fields
      hotelData.append('name', formData.name);
      hotelData.append('description', formData.description);
      hotelData.append('starRating', formData.starRating);
      
      // Add location fields
      hotelData.append('location.address', formData.location.address);
      hotelData.append('location.city', formData.location.city);
      if (formData.location.coordinates.lat) {
        hotelData.append('location.coordinates.lat', formData.location.coordinates.lat);
      }
      if (formData.location.coordinates.lng) {
        hotelData.append('location.coordinates.lng', formData.location.coordinates.lng);
      }
      
      // Add contact info
      hotelData.append('contactInfo.phone', formData.contactInfo.phone);
      hotelData.append('contactInfo.email', formData.contactInfo.email);
      if (formData.contactInfo.website) {
        hotelData.append('contactInfo.website', formData.contactInfo.website);
      }
      
      // Add amenities
      formData.amenities.forEach(amenity => {
        hotelData.append('amenities', amenity);
      });
      
      // Add rooms
      formData.rooms.forEach((room, index) => {
        hotelData.append(`rooms[${index}][type]`, room.type);
        hotelData.append(`rooms[${index}][pricePerNight]`, room.pricePerNight);
        hotelData.append(`rooms[${index}][capacity]`, room.capacity);
        hotelData.append(`rooms[${index}][available]`, room.available);
      });
      
      // Add images to FormData
      images.forEach(image => {
        console.log("Appending image:", image.name);
        hotelData.append('images', image);
      });
      
      // Debug: Log FormData entries
      for (let pair of hotelData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      // API_URL from environment or default
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log("Sending request to:", `${API_URL}/api/hotels`);
      
      const res = await axios.post(`${API_URL}/api/hotels`, hotelData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      console.log("Hotel added successfully:", res.data);
      toast.success('Hotel added successfully!');
      
      // Reset form and close it
      resetForm();
      setIsFormVisible(false);
      
      // Notify parent component
      if (onHotelAdded) {
        onHotelAdded(res.data);
      }
    } catch (err) {
      console.error('Error adding hotel:', err);
      console.error('Error details:', err.response?.data);
      toast.error(err.response?.data?.message || 'Error adding hotel');
    } finally {
      setIsLoading(false);
    }
  };

  // Only hotel owners should see this form
  if (user?.role !== 'hotel_owner') {
    return null;
  }

  return (
    <div className="hotel-form-container">
      {!isFormVisible ? (
        <button 
          className="btn btn-primary add-hotel-btn"
          onClick={() => setIsFormVisible(true)}
        >
          <i className="fas fa-plus"></i> Add New Hotel
        </button>
      ) : (
        <div className="hotel-form-card">
          <h2>Add New Hotel</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label htmlFor="name">Hotel Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter hotel name"
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
                  placeholder="Describe your hotel"
                  rows="4"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="starRating">Star Rating*</label>
                <select
                  id="starRating"
                  name="starRating"
                  value={formData.starRating}
                  onChange={handleChange}
                  required
                >
                  <option value="1">1 Star</option>
                  <option value="2">2 Star</option>
                  <option value="3">3 Star</option>
                  <option value="4">4 Star</option>
                  <option value="5">5 Star</option>
                </select>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Location Information</h3>
              <div className="form-group">
                <label htmlFor="location.address">Address*</label>
                <input
                  type="text"
                  id="location.address"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter street address"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location.city">City*</label>
                <input
                  type="text"
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  required
                  placeholder="Enter city"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="location.coordinates.lat">Latitude</label>
                  <input
                    type="text"
                    id="location.coordinates.lat"
                    name="location.coordinates.lat"
                    value={formData.location.coordinates.lat}
                    onChange={handleChange}
                    placeholder="Latitude (optional)"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="location.coordinates.lng">Longitude</label>
                  <input
                    type="text"
                    id="location.coordinates.lng"
                    name="location.coordinates.lng"
                    value={formData.location.coordinates.lng}
                    onChange={handleChange}
                    placeholder="Longitude (optional)"
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
                <label htmlFor="contactInfo.website">Website</label>
                <input
                  type="url"
                  id="contactInfo.website"
                  name="contactInfo.website"
                  value={formData.contactInfo.website}
                  onChange={handleChange}
                  placeholder="Enter website URL (optional)"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Amenities</h3>
              <div className="amenities-list">
                {commonAmenities.map((amenity, index) => (
                  <div key={index} className="amenity-checkbox">
                    <input
                      type="checkbox"
                      id={`amenity-${index}`}
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleAmenityChange}
                    />
                    <label htmlFor={`amenity-${index}`}>{amenity}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-section">
              <h3>Room Information</h3>
              {formData.rooms.map((room, index) => (
                <div key={index} className="room-item">
                  <h4>Room {index + 1}</h4>
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor={`rooms.${index}.type`}>Room Type*</label>
                      <input
                        type="text"
                        id={`rooms.${index}.type`}
                        name="type"
                        value={room.type}
                        onChange={(e) => handleRoomChange(index, e)}
                        required
                        placeholder="e.g. Standard, Deluxe, Suite"
                      />
                    </div>
                    
                    <div className="form-group half">
                      <label htmlFor={`rooms.${index}.pricePerNight`}>Price per Night*</label>
                      <input
                        type="number"
                        id={`rooms.${index}.pricePerNight`}
                        name="pricePerNight"
                        value={room.pricePerNight}
                        onChange={(e) => handleRoomChange(index, e)}
                        required
                        min="0"
                        placeholder="Price in USD"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor={`rooms.${index}.capacity`}>Capacity*</label>
                      <input
                        type="number"
                        id={`rooms.${index}.capacity`}
                        name="capacity"
                        value={room.capacity}
                        onChange={(e) => handleRoomChange(index, e)}
                        required
                        min="1"
                        placeholder="Number of people"
                      />
                    </div>
                    
                    <div className="form-group half checkbox-group">
                      <input
                        type="checkbox"
                        id={`rooms.${index}.available`}
                        name="available"
                        checked={room.available}
                        onChange={(e) => handleRoomChange(index, e)}
                      />
                      <label htmlFor={`rooms.${index}.available`}>Available for booking</label>
                    </div>
                  </div>
                  
                  {formData.rooms.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-danger btn-sm remove-room"
                      onClick={() => removeRoom(index)}
                    >
                      Remove Room
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                type="button" 
                className="btn btn-secondary add-room-btn"
                onClick={addRoom}
              >
                <i className="fas fa-plus"></i> Add Another Room
              </button>
            </div>
            
            <div className="form-section">
              <h3>Hotel Images</h3>
              <div className="form-group">
                <label htmlFor="hotel-images" className="file-label">Upload Images (max 5)</label>
                <div className="upload-btn-wrapper">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => fileInputRef.current.click()}
                  >
                    <i className="fas fa-cloud-upload-alt"></i> Select Images
                  </button>
                  <span className="file-info">{images.length} of 5 images selected</span>
                </div>
                
                <input
                  type="file"
                  id="hotel-images"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  className="file-input"
                  style={{ display: 'none' }}
                />
              </div>
              
              {imagePreview.length > 0 && (
                <div className="image-preview-container">
                  {imagePreview.map((src, index) => (
                    <div key={index} className="image-preview">
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
              )}
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  resetForm();
                  setIsFormVisible(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Adding Hotel...' : 'Add Hotel'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HotelForm;