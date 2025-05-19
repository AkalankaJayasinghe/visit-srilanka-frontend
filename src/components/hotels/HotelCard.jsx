import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HotelCard.css';

const HotelCard = ({ hotel }) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [imageError, setImageError] = useState(false);
  
  // Format image path correctly
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/hotel-placeholder.jpg';
    
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
  const displayImage = !imageError && hotel.images && hotel.images.length > 0 
    ? getImageUrl(hotel.images[0])
    : '/images/hotel-placeholder.jpg';
  
  useEffect(() => {
    if (hotel.images && hotel.images.length > 0) {
      console.log('Hotel:', hotel.name);
      console.log('Original image path:', hotel.images[0]);
      console.log('Processed image URL:', getImageUrl(hotel.images[0]));
    }
  }, [hotel]);

  return (
    <div className="hotel-card">
      <div className="hotel-card-image">
        <img 
          src={displayImage} 
          alt={hotel.name} 
          onError={(e) => {
            console.error('Image failed to load:', displayImage);
            setImageError(true);
          }}
        />
        <div className="hotel-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < hotel.starRating ? "star filled" : "star"}>★</span>
          ))}
        </div>
      </div>
      <div className="hotel-card-content">
        <h3>{hotel.name}</h3>
        <p className="hotel-location">
          <i className="fas fa-map-marker-alt"></i> {hotel.location.city}, {hotel.location.address}
        </p>
        <p className="hotel-description">{hotel.description.substring(0, 100)}...</p>
        <div className="hotel-amenities">
          {hotel.amenities && hotel.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="amenity-badge">{amenity}</span>
          ))}
          {hotel.amenities && hotel.amenities.length > 3 && (
            <span className="amenity-badge">+{hotel.amenities.length - 3} more</span>
          )}
        </div>
        <div className="hotel-price">
          From ${hotel.rooms && hotel.rooms.length > 0 
            ? Math.min(...hotel.rooms.map(room => room.pricePerNight))
            : 0} / night
        </div>
        <Link to={`/hotels/${hotel._id}`} className="btn btn-primary">View Details</Link>
      </div>
    </div>
  );
};

export default HotelCard;