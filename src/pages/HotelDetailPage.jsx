import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';
import './HotelDetailPage.css';

const HotelDetailPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Format image path correctly
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/hotel-placeholder.jpg';
    
    // Check if the path is already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Check if path is relative to server root
    if (imagePath.startsWith('/')) {
      return `${API_URL}${imagePath}`;
    }
    
    // Otherwise, assume it's a relative path
    return `${API_URL}/${imagePath}`;
  };

  useEffect(() => {
    const fetchHotelDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`${API_URL}/api/hotels/${id}`);
        console.log('Hotel details:', res.data);
        
        // Process image URLs
        if (res.data.images && res.data.images.length > 0) {
          res.data.images.forEach((imgPath, index) => {
            console.log(`Image ${index} path:`, imgPath);
          });
        }
        
        setHotel(res.data);
      } catch (err) {
        console.error('Error fetching hotel details:', err);
        setError('Failed to fetch hotel details. Please try again later.');
        toast.error('Error loading hotel details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id, API_URL]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error || !hotel) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Hotel not found'}</p>
          <Link to="/hotels" className="btn btn-primary">Back to Hotels</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-detail-page">
      <div className="container">
        <div className="hotel-detail-breadcrumb">
          <Link to="/hotels">Hotels</Link> / {hotel.name}
        </div>
        
        <div className="hotel-detail-container">
          <div className="hotel-detail-gallery">
            <div className="main-image">
              {hotel.images && hotel.images.length > 0 ? (
                <img 
                  src={getImageUrl(hotel.images[activeImageIndex])} 
                  alt={`${hotel.name} - Main view`}
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.src = '/images/hotel-placeholder.jpg';
                  }}
                />
              ) : (
                <img 
                  src="/images/hotel-placeholder.jpg" 
                  alt={`${hotel.name} - No image available`}
                />
              )}
            </div>
            
            {hotel.images && hotel.images.length > 1 && (
              <div className="thumbnail-list">
                {hotel.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={getImageUrl(image)} 
                      alt={`${hotel.name} - View ${index + 1}`}
                      onError={(e) => {
                        e.target.src = '/images/hotel-placeholder.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="hotel-detail-info">
            <div className="hotel-detail-header">
              <h1>{hotel.name}</h1>
              <div className="hotel-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < hotel.starRating ? "star filled" : "star"}>★</span>
                ))}
              </div>
            </div>
            
            <div className="hotel-detail-location">
              <i className="fas fa-map-marker-alt"></i> {hotel.location.address}, {hotel.location.city}
            </div>
            
            <div className="hotel-detail-description">
              <h2>Description</h2>
              <p>{hotel.description}</p>
            </div>
            
            <div className="hotel-detail-amenities">
              <h2>Amenities</h2>
              <ul>
                {hotel.amenities && hotel.amenities.map((amenity, index) => (
                  <li key={index}><i className="fas fa-check"></i> {amenity}</li>
                ))}
              </ul>
            </div>
            
            <div className="hotel-detail-contact">
              <h2>Contact Information</h2>
              <p><i className="fas fa-phone"></i> {hotel.contactInfo.phone}</p>
              <p><i className="fas fa-envelope"></i> {hotel.contactInfo.email}</p>
              {hotel.contactInfo.website && (
                <p>
                  <i className="fas fa-globe"></i> 
                  <a href={hotel.contactInfo.website} target="_blank" rel="noopener noreferrer">
                    {hotel.contactInfo.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="hotel-rooms-section">
          <h2>Available Rooms</h2>
          <div className="hotel-rooms-list">
            {hotel.rooms && hotel.rooms.map((room, index) => (
              <div key={index} className={`room-card ${!room.available ? 'unavailable' : ''}`}>
                <div className="room-info">
                  <h3>{room.type}</h3>
                  <div className="room-capacity">
                    <i className="fas fa-user"></i> {room.capacity} {room.capacity > 1 ? 'people' : 'person'}
                  </div>
                  <div className="room-price">${room.pricePerNight} / night</div>
                </div>
                <div className="room-actions">
                  <button 
                    className="btn btn-primary"
                    disabled={!room.available}
                  >
                    {room.available ? 'Book Now' : 'Not Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="back-to-hotels">
          <Link to="/hotels" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Hotels
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;