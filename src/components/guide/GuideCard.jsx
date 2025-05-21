import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GuideCard.css';

const GuideCard = ({ guide }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [imageError, setImageError] = useState(false);
  
  // Safety check for undefined guide
  if (!guide) {
    return (
      <div className="guide-card error-card">
        <p>Error: Guide data is unavailable</p>
      </div>
    );
  }
  
  // Format image path correctly
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
  
  // Use a default image if none is available or if loading fails
  const displayImage = !imageError && guide.images && guide.images.length > 0 
    ? getImageUrl(guide.images[0])
    : '/images/guide-placeholder.jpg';

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
    return `$${parseFloat(price).toFixed(2)}/day`;
  };

  // Function to safely get value or return fallback
  const safeValue = (value, fallback, formatFn = null) => {
    if (value === undefined || value === null) {
      return fallback;
    }
    return formatFn ? formatFn(value) : value;
  };

  return (
    <div className="guide-card">
      <div className="guide-card-image">
        <img 
          src={displayImage} 
          alt={guide.name || 'Guide'} 
          onError={(e) => {
            console.error('Image failed to load:', displayImage);
            setImageError(true);
          }}
        />
        <div className="guide-card-badge">
          <span className={`availability ${guide.availability ? 'available' : 'unavailable'}`}>
            {guide.availability ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
      <div className="guide-card-content">
        <h3>{safeValue(guide.name, 'Unnamed Guide')}</h3>
        
        <div className="guide-experience">
          <span className="experience-badge">{safeValue(guide.experience, '?')} {guide.experience === 1 ? 'year' : 'years'} experience</span>
        </div>
        
        <div className="guide-languages">
          <span className="info-label">Languages:</span>
          <div className="languages-list">
            {guide.languages && Array.isArray(guide.languages) && guide.languages.map((language, index) => (
              <span key={index} className="language-tag">{language}</span>
            ))}
          </div>
        </div>
        
        <div className="guide-specializations">
          <span className="info-label">Specializes in:</span>
          <div className="specializations-list">
            {guide.specializations && Array.isArray(guide.specializations) ? 
              guide.specializations.map((specialization, index) => (
                <span key={index} className="specialization-tag">{specialization}</span>
              )) : 
              <span className="no-specializations">No specializations listed</span>
            }
          </div>
        </div>
        
        <p className="guide-bio">
          {guide.bio ? (
            <>
              {guide.bio.substring(0, 120)}
              {guide.bio.length > 120 ? '...' : ''}
            </>
          ) : (
            'No bio available'
          )}
        </p>
        
        <div className="guide-price-area">
          <div className="guide-price">
            <span className="info-label">Price:</span> {formatPrice(guide.pricePerDay)}
          </div>
          
          <div className="guide-areas">
            <span className="info-label">Areas:</span>
            {guide.areasOfOperation && Array.isArray(guide.areasOfOperation) && guide.areasOfOperation.length > 0 ? (
              <div className="areas-preview">
                {guide.areasOfOperation.slice(0, 2).map((area, index) => (
                  <span key={index} className="area-tag">{area}</span>
                ))}
                {guide.areasOfOperation.length > 2 && (
                  <span className="more-tag">+{guide.areasOfOperation.length - 2} more</span>
                )}
              </div>
            ) : (
              <span className="no-areas">No areas listed</span>
            )}
          </div>
        </div>
        
        {/* Rating display if reviews exist */}
        {guide.reviews && Array.isArray(guide.reviews) && guide.reviews.length > 0 && (
          <div className="guide-rating">
            {(() => {
              const avgRating = guide.reviews.reduce((sum, review) => sum + review.rating, 0) / 
                               guide.reviews.length;
              return (
                <>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(avgRating) ? "star filled" : "star"}>★</span>
                  ))}
                  <span className="rating-count">({guide.reviews.length})</span>
                </>
              );
            })()}
          </div>
        )}
        
        <Link to={`/guides/${guide._id}`} className="btn btn-primary">View Profile</Link>
      </div>
    </div>
  );
};

export default GuideCard;