import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import './RestaurantDetailPage.css';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Format image path correctly
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/restaurant-placeholder.jpg';
    
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

  // Check if current user is the owner
  const isOwner = restaurant && user && restaurant.ownerId === user.id;

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`${API_URL}/api/restaurants/${id}`);
        setRestaurant(res.data);
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        setError('Failed to fetch restaurant details. Please try again later.');
        toast.error('Error loading restaurant details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id, API_URL]);

  // Format day for display
  const formatDay = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return 'Closed';
    
    try {
      // Parse time string (assuming format like "09:00")
      const [hours, minutes] = timeStr.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      
      // Format time to 12-hour with AM/PM
      return time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return timeStr; // Return as-is if parsing fails
    }
  };

  // Get current day
  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    return days[today];
  };

  // Check if restaurant is open now
  const isOpenNow = () => {
    if (!restaurant || !restaurant.openingHours) return false;
    
    const currentDay = getCurrentDay();
    const hours = restaurant.openingHours[currentDay];
    
    if (!hours || !hours.open || !hours.close) return false;
    
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Parse opening hours
    const [openHour, openMinute] = hours.open.split(':').map(Number);
    const [closeHour, closeMinute] = hours.close.split(':').map(Number);
    
    // Convert to minutes since midnight for easier comparison
    const currentTime = currentHour * 60 + currentMinute;
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading restaurant details...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Restaurant not found'}</p>
          <Link to="/restaurants" className="btn btn-primary">
            <i className="fas fa-arrow-left"></i> Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  // Calculate average rating from reviews
  const avgRating = restaurant.reviews && restaurant.reviews.length > 0 
    ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / restaurant.reviews.length
    : 0;

  return (
    <div className="restaurant-detail-page">
      <div className="container">
        <div className="navigation-breadcrumb">
          <Link to="/restaurants">Restaurants</Link> / {restaurant.name}
        </div>
        
        {/* Action buttons for owner */}
        {isOwner && (
          <div className="owner-actions">
            <Link to={`/restaurants/edit/${restaurant._id}`} className="btn btn-secondary">
              <i className="fas fa-edit"></i> Edit Restaurant
            </Link>
            <button className="btn btn-danger">
              <i className="fas fa-trash"></i> Delete Restaurant
            </button>
          </div>
        )}
        
        <div className="restaurant-hero">
          <div className="restaurant-gallery">
            <div className="main-image">
              {restaurant.images && restaurant.images.length > 0 ? (
                <img 
                  src={getImageUrl(restaurant.images[activeImageIndex])} 
                  alt={`${restaurant.name} - Main view`}
                  onError={(e) => {
                    e.target.src = '/images/restaurant-placeholder.jpg';
                  }}
                />
              ) : (
                <img 
                  src="/images/restaurant-placeholder.jpg" 
                  alt={`${restaurant.name} - No image available`}
                />
              )}
              <div className="restaurant-status">
                <span className={`status-indicator ${isOpenNow() ? 'open' : 'closed'}`}>
                  {isOpenNow() ? 'Open Now' : 'Closed'}
                </span>
                <span className="price-range">{restaurant.priceRange}</span>
              </div>
            </div>
            
            {restaurant.images && restaurant.images.length > 1 && (
              <div className="thumbnail-gallery">
                {restaurant.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={getImageUrl(image)} 
                      alt={`${restaurant.name} - View ${index + 1}`}
                      onError={(e) => {
                        e.target.src = '/images/restaurant-placeholder.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="restaurant-header">
            <h1>{restaurant.name}</h1>
            
            <div className="restaurant-meta">
              <div className="cuisine-tags">
                {Array.isArray(restaurant.cuisine) ? (
                  restaurant.cuisine.map((cuisine, index) => (
                    <span key={index} className="cuisine-tag">{cuisine}</span>
                  ))
                ) : (
                  <span className="cuisine-tag">{restaurant.cuisine}</span>
                )}
              </div>
              
              {avgRating > 0 && (
                <div className="rating-display">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(avgRating) ? "star filled" : "star"}>★</span>
                  ))}
                  <span className="rating-value">{avgRating.toFixed(1)}</span>
                  <span className="review-count">({restaurant.reviews ? restaurant.reviews.length : 0} reviews)</span>
                </div>
              )}
            </div>
            
            <div className="restaurant-location">
              <i className="fas fa-map-marker-alt"></i>
              <p>{restaurant.location.address}, {restaurant.location.city}</p>
            </div>
          </div>
        </div>
        
        <div className="restaurant-content">
          <div className="restaurant-main">
            <section className="description-section">
              <h2>About</h2>
              <p>{restaurant.description}</p>
            </section>
            
            {restaurant.cuisine && restaurant.cuisine.length > 0 && (
              <section className="cuisine-section">
                <h2>Cuisine</h2>
                <div className="cuisine-tags large">
                  {Array.isArray(restaurant.cuisine) ? (
                    restaurant.cuisine.map((cuisine, index) => (
                      <span key={index} className="cuisine-tag">{cuisine}</span>
                    ))
                  ) : (
                    <span className="cuisine-tag">{restaurant.cuisine}</span>
                  )}
                </div>
              </section>
            )}
            
            {restaurant.reviews && restaurant.reviews.length > 0 && (
              <section className="reviews-section">
                <h2>Customer Reviews</h2>
                <div className="reviews-list">
                  {restaurant.reviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.userId.name || 'Anonymous'}</span>
                          <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "star filled" : "star"}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          <div className="restaurant-sidebar">
            <div className="sidebar-section contact-section">
              <h3>Contact Information</h3>
              <ul className="contact-list">
                <li>
                  <i className="fas fa-phone"></i>
                  <span>{restaurant.contactInfo.phone}</span>
                </li>
                <li>
                  <i className="fas fa-envelope"></i>
                  <span>{restaurant.contactInfo.email}</span>
                </li>
                {restaurant.contactInfo.website && (
                  <li>
                    <i className="fas fa-globe"></i>
                    <a href={restaurant.contactInfo.website} target="_blank" rel="noopener noreferrer">
                      {restaurant.contactInfo.website.replace(/^https?:\/\//, '')}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="sidebar-section hours-section">
              <h3>Opening Hours</h3>
              <ul className="hours-list">
                                {restaurant.openingHours && Object.keys(restaurant.openingHours).map(day => {
                  const hours = restaurant.openingHours[day];
                  const isToday = day === getCurrentDay();
                  
                  return (
                    <li key={day} className={isToday ? 'today' : ''}>
                      <span className="day">{formatDay(day)}{isToday ? ' (Today)' : ''}</span>
                      <span className="hours">
                        {hours && hours.open && hours.close ? 
                          `${formatTime(hours.open)} - ${formatTime(hours.close)}` : 
                          'Closed'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {restaurant.location && restaurant.location.coordinates && 
             restaurant.location.coordinates.lat && restaurant.location.coordinates.lng && (
              <div className="sidebar-section map-section">
                <h3>Location</h3>
                <div className="map-container">
                  <iframe
                    title={`${restaurant.name} location`}
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${restaurant.location.coordinates.lat},${restaurant.location.coordinates.lng}`}
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="back-button-container">
          <Link to="/restaurants" className="btn btn-secondary back-button">
            <i className="fas fa-arrow-left"></i> Back to Restaurants
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
                  