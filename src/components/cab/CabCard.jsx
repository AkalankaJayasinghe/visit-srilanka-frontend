import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CabCard.css';

const CabCard = ({ cab }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [imageError, setImageError] = useState(false);
  
  // Safety check for undefined cab
  if (!cab) {
    return (
      <div className="cab-card error-card">
        <p>Error: Cab data is unavailable</p>
      </div>
    );
  }
  
  // Format image path correctly
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
  
  // Use a default image if none is available or if loading fails
  const displayImage = !imageError && cab.images && cab.images.length > 0 
    ? getImageUrl(cab.images[0])
    : '/images/cab-placeholder.jpg';

  // Function to safely format price
  const formatPrice = (price) => {
    // Check if price is undefined
    if (price === undefined || price === null) {
      return 'Price not available';
    }
    // Check if price is a number
    if (isNaN(parseFloat(price))) {
      return 'Price not available';
    }
    return `$${parseFloat(price).toFixed(2)}/km`;
  };

  // Function to safely get value or return fallback
  const safeValue = (value, fallback, formatFn = null) => {
    if (value === undefined || value === null) {
      return fallback;
    }
    return formatFn ? formatFn(value) : value;
  };

  return (
    <div className="cab-card">
      <div className="cab-card-image">
        <img 
          src={displayImage} 
          alt={cab.name || 'Cab'} 
          onError={(e) => {
            console.error('Image failed to load:', displayImage);
            setImageError(true);
          }}
        />
        <div className="cab-card-badge">
          <span className={`availability ${cab.availability ? 'available' : 'unavailable'}`}>
            {cab.availability ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
      <div className="cab-card-content">
        <h3>{safeValue(cab.name, 'Unnamed Cab')}</h3>
        <div className="cab-info">
          <p className="cab-model">
            <span className="info-label">Vehicle:</span> {safeValue(cab.vehicleType, 'Type N/A')} {safeValue(cab.vehicleModel, 'Model N/A')}
          </p>
          <p className="cab-capacity">
            <i className="fas fa-user"></i> {safeValue(cab.capacity, '?')} {cab.capacity !== 1 ? 'persons' : 'person'}
          </p>
          <p className="cab-price">
            <span className="info-label">Price:</span> {formatPrice(cab.pricePerKm)}
          </p>
        </div>
        
        {cab.operatingAreas && Array.isArray(cab.operatingAreas) && (
          <div className="cab-areas">
            <span className="areas-label">Operating Areas:</span>
            <div className="areas-list">
              {cab.operatingAreas.slice(0, 3).map((area, index) => (
                <span key={index} className="area-tag">{area}</span>
              ))}
              {cab.operatingAreas.length > 3 && (
                <span className="more-tag">+{cab.operatingAreas.length - 3} more</span>
              )}
            </div>
          </div>
        )}
        
        <p className="cab-description">
          {cab.description ? (
            <>
              {cab.description.substring(0, 100)}
              {cab.description.length > 100 ? '...' : ''}
            </>
          ) : (
            'No description available'
          )}
        </p>
        
        {/* Rating display if reviews exist */}
        {cab.reviews && Array.isArray(cab.reviews) && cab.reviews.length > 0 && (
          <div className="cab-rating">
            {(() => {
              const avgRating = cab.reviews.reduce((sum, review) => sum + review.rating, 0) / 
                               cab.reviews.length;
              return (
                <>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(avgRating) ? "star filled" : "star"}>★</span>
                  ))}
                  <span className="rating-count">({cab.reviews.length})</span>
                </>
              );
            })()}
          </div>
        )}
        
        <Link to={`/cabs/${cab._id}`} className="btn btn-primary">View Details</Link>
      </div>
    </div>
  );
};

export default CabCard;