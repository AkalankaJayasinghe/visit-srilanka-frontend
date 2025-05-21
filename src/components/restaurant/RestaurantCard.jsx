import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [imageError, setImageError] = useState(false);
  
  // Format image path correctly
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/restaurant-placeholder.jpg';
    
    // Check if the path is already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Combine the API URL with the image path
    // Make sure we don't double up on slashes
    const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const imgPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${apiUrl}${imgPath}`;
  };
  
  // Use a default image if none is available or if loading fails
  const displayImage = !imageError && restaurant.images && restaurant.images.length > 0 
    ? getImageUrl(restaurant.images[0])
    : '/images/restaurant-placeholder.jpg';
  
  // Show first cuisine in the list if it's an array
  const primaryCuisine = Array.isArray(restaurant.cuisine) && restaurant.cuisine.length > 0
    ? restaurant.cuisine[0]
    : restaurant.cuisine || 'Various Cuisines';

  return (
    <div className="restaurant-card">
      <div className="restaurant-card-image">
        <img 
          src={displayImage} 
          alt={restaurant.name} 
          onError={(e) => {
            console.error('Image failed to load:', displayImage);
            setImageError(true);
          }}
        />
        <div className="restaurant-price-badge">{restaurant.priceRange}</div>
      </div>
      <div className="restaurant-card-content">
        <h3>{restaurant.name}</h3>
        <p className="restaurant-location">
          <i className="fas fa-map-marker-alt"></i> {restaurant.location.city}, {restaurant.location.address}
        </p>
        <div className="restaurant-cuisine-tags">
          {Array.isArray(restaurant.cuisine) ? (
            restaurant.cuisine.slice(0, 3).map((cuisine, index) => (
              <span key={index} className="cuisine-tag">{cuisine}</span>
            ))
          ) : (
            <span className="cuisine-tag">{restaurant.cuisine}</span>
          )}
        </div>
        <p className="restaurant-description">{restaurant.description.substring(0, 100)}...</p>
        
        {/* Calculate average rating from reviews */}
        {restaurant.reviews && restaurant.reviews.length > 0 && (
          <div className="restaurant-rating">
            {(() => {
              const avgRating = restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / 
                               restaurant.reviews.length;
              return (
                <>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(avgRating) ? "star filled" : "star"}>★</span>
                  ))}
                  <span className="rating-count">({restaurant.reviews.length})</span>
                </>
              );
            })()}
          </div>
        )}
        
        <Link to={`/restaurants/${restaurant._id}`} className="btn btn-primary">View Details</Link>
      </div>
    </div>
  );
};

export default RestaurantCard;