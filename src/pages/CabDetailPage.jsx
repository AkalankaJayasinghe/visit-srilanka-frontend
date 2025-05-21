import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import './CabDetailPage.css';

const CabDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cab, setCab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Format image path correctly
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/cab-placeholder.jpg';
    
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
    const fetchCabServiceDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`${API_URL}/api/cabs/${id}`);
        console.log("Cab detail data:", res.data); // Debug
        setCab(res.data);
      } catch (err) {
        console.error('Error fetching cab service details:', err);
        setError('Failed to fetch cab service details. Please try again later.');
        toast.error('Error loading cab service details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCabServiceDetails();
  }, [id, API_URL]);

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

  // Check if current user is the owner
  const isOwner = cab && user && cab.ownerId === user.id;

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/cabs/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      toast.success('Cab service deleted successfully');
      navigate('/cabs');
    } catch (err) {
      console.error('Error deleting cab service:', err);
      toast.error('Failed to delete cab service');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading cab service details...</p>
      </div>
    );
  }

  if (error || !cab) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Cab service not found'}</p>
          <Link to="/cabs" className="btn btn-primary">
            <i className="fas fa-arrow-left"></i> Back to Cab Services
          </Link>
        </div>
      </div>
    );
  }

  // Function to safely get value or return fallback
  const safeValue = (value, fallback, formatFn = null) => {
    if (value === undefined || value === null) {
      return fallback;
    }
    return formatFn ? formatFn(value) : value;
  };

  // Calculate average rating from reviews
  const avgRating = cab.reviews && cab.reviews.length > 0 
    ? cab.reviews.reduce((sum, review) => sum + review.rating, 0) / cab.reviews.length
    : 0;

  return (
    <div className="cab-detail-page">
      <div className="container">
        <div className="navigation-breadcrumb">
          <Link to="/cabs">Cab Services</Link> / {cab.name || 'Cab Service'}
        </div>
        
        {/* Action buttons for owner */}
        {isOwner && (
          <div className="owner-actions">
            <Link to={`/cabs/edit/${cab._id}`} className="btn btn-secondary">
              <i className="fas fa-edit"></i> Edit Service
            </Link>
            {!deleteConfirm ? (
              <button 
                className="btn btn-danger"
                onClick={() => setDeleteConfirm(true)}
              >
                <i className="fas fa-trash"></i> Delete Service
              </button>
            ) : (
              <div className="delete-confirm">
                <span>Are you sure?</span>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={handleDelete}
                >
                  Yes, Delete
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="cab-hero">
          <div className="cab-gallery">
            <div className="main-image">
              {cab.images && cab.images.length > 0 ? (
                <img 
                  src={getImageUrl(cab.images[activeImageIndex])} 
                  alt={`${cab.name || 'Cab'} - Main view`}
                  onError={(e) => {
                    e.target.src = '/images/cab-placeholder.jpg';
                  }}
                />
              ) : (
                <img 
                  src="/images/cab-placeholder.jpg" 
                  alt={`${cab.name || 'Cab'} - No image available`}
                />
              )}
              <div className="cab-status">
                <span className={`status-indicator ${cab.availability ? 'available' : 'unavailable'}`}>
                  {cab.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
            
            {cab.images && cab.images.length > 1 && (
              <div className="thumbnail-gallery">
                {cab.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={getImageUrl(image)} 
                      alt={`${cab.name || 'Cab'} - View ${index + 1}`}
                      onError={(e) => {
                        e.target.src = '/images/cab-placeholder.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="cab-header">
            <h1>{cab.name || 'Cab Service'}</h1>
            
            <div className="cab-meta">
              <div className="cab-type-model">
                <span className="vehicle-type">{safeValue(cab.vehicleType, 'Unknown Type')}</span>
                <span className="vehicle-model">{safeValue(cab.vehicleModel, 'Unknown Model')}</span>
                <span className="license-plate">{safeValue(cab.licensePlate, 'No License Plate')}</span>
              </div>
              
              <div className="cab-price-capacity">
                <span className="price-per-km">{formatPrice(cab.pricePerKm)}</span>
                <span className="capacity">
                  <i className="fas fa-user"></i> {safeValue(cab.capacity, '?')} {cab.capacity !== 1 ? 'persons' : 'person'}
                </span>
              </div>
              
              {avgRating > 0 && (
                <div className="rating-display">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(avgRating) ? "star filled" : "star"}>★</span>
                  ))}
                  <span className="rating-value">{avgRating.toFixed(1)}</span>
                  <span className="review-count">({cab.reviews ? cab.reviews.length : 0} reviews)</span>
                </div>
              )}
            </div>
            
            {cab.operatingAreas && cab.operatingAreas.length > 0 && (
              <div className="operating-areas">
                <h3>Operating Areas</h3>
                <div className="areas-tags">
                  {cab.operatingAreas.map((area, index) => (
                    <span key={index} className="area-tag">{area}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="cab-content">
          <div className="cab-main">
            <section className="description-section">
              <h2>About this Service</h2>
              <p>{safeValue(cab.description, 'No description available for this cab service.')}</p>
            </section>
            
            {cab.reviews && cab.reviews.length > 0 && (
              <section className="reviews-section">
                <h2>Customer Reviews</h2>
                <div className="reviews-list">
                  {cab.reviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <span className="reviewer-name">{review.userId?.name || 'Anonymous'}</span>
                          <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "star filled" : "star"}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment || 'No comment provided'}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          <div className="cab-sidebar">
            {cab.contactInfo && (
              <div className="sidebar-section contact-section">
                <h3>Contact Information</h3>
                <ul className="contact-list">
                  {cab.contactInfo.phone && (
                    <li>
                      <i className="fas fa-phone"></i>
                      <span>{cab.contactInfo.phone}</span>
                    </li>
                  )}
                  {cab.contactInfo.email && (
                    <li>
                      <i className="fas fa-envelope"></i>
                      <span>{cab.contactInfo.email}</span>
                    </li>
                  )}
                </ul>
                
                {(cab.contactInfo.phone || cab.contactInfo.email) && (
                  <div className="booking-actions">
                    {cab.contactInfo.phone && (
                      <a 
                        href={`tel:${cab.contactInfo.phone}`} 
                        className="btn btn-primary btn-block"
                      >
                        <i className="fas fa-phone"></i> Call Driver
                      </a>
                    )}
                    {cab.contactInfo.email && (
                      <a 
                        href={`mailto:${cab.contactInfo.email}?subject=Booking Inquiry for ${cab.name || 'Cab Service'}`} 
                        className="btn btn-secondary btn-block"
                      >
                        <i className="fas fa-envelope"></i> Email Driver
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="sidebar-section specs-section">
              <h3>Vehicle Specifications</h3>
              <ul className="specs-list">
                <li>
                  <span className="spec-label">Vehicle Type:</span>
                  <span className="spec-value">{safeValue(cab.vehicleType, 'Not specified')}</span>
                </li>
                <li>
                  <span className="spec-label">Model:</span>
                  <span className="spec-value">{safeValue(cab.vehicleModel, 'Not specified')}</span>
                </li>
                <li>
                  <span className="spec-label">License Plate:</span>
                  <span className="spec-value">{safeValue(cab.licensePlate, 'Not specified')}</span>
                </li>
                <li>
                  <span className="spec-label">Passenger Capacity:</span>
                  <span className="spec-value">{safeValue(cab.capacity, 'Not specified')} {cab.capacity !== 1 ? 'persons' : 'person'}</span>
                </li>
                <li>
                  <span className="spec-label">Price per KM:</span>
                  <span className="spec-value">{formatPrice(cab.pricePerKm)}</span>
                </li>
                <li>
                  <span className="spec-label">Availability:</span>
                  <span className={`spec-value ${cab.availability ? 'available-text' : 'unavailable-text'}`}>
                    {cab.availability ? 'Available for booking' : 'Currently unavailable'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="back-button-container">
          <Link to="/cabs" className="btn btn-secondary back-button">
            <i className="fas fa-arrow-left"></i> Back to Cab Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CabDetailPage;