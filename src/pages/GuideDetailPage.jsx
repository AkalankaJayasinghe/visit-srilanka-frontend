import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import './GuideDetailPage.css';

const GuideDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Format image path correctly
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/guide-placeholder.jpg';
    
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
    const fetchGuideDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`${API_URL}/api/guides/${id}`);
        console.log("Guide detail data:", res.data); // Debug
        setGuide(res.data);
      } catch (err) {
        console.error('Error fetching guide details:', err);
        setError('Failed to fetch guide details. Please try again later.');
        toast.error('Error loading guide details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuideDetails();
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
    return `$${parseFloat(price).toFixed(2)}/day`;
  };

  // Check if current user is the owner
  const isOwner = guide && user && guide.ownerId === user.id;

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/guides/${id}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      toast.success('Guide profile deleted successfully');
      navigate('/guides');
    } catch (err) {
      console.error('Error deleting guide profile:', err);
      toast.error('Failed to delete guide profile');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading guide details...</p>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Guide not found'}</p>
          <Link to="/guides" className="btn btn-primary">
            <i className="fas fa-arrow-left"></i> Back to Guides
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
  const avgRating = guide.reviews && guide.reviews.length > 0 
    ? guide.reviews.reduce((sum, review) => sum + review.rating, 0) / guide.reviews.length
    : 0;

  return (
    <div className="guide-detail-page">
      <div className="container">
        <div className="navigation-breadcrumb">
          <Link to="/guides">Tour Guides</Link> / {guide.name || 'Guide Profile'}
        </div>
        
        {/* Action buttons for owner */}
        {isOwner && (
          <div className="owner-actions">
            <Link to={`/guides/edit/${guide._id}`} className="btn btn-secondary">
              <i className="fas fa-edit"></i> Edit Profile
            </Link>
            {!deleteConfirm ? (
              <button 
                className="btn btn-danger"
                onClick={() => setDeleteConfirm(true)}
              >
                <i className="fas fa-trash"></i> Delete Profile
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
        
        <div className="guide-hero">
          <div className="guide-gallery">
            <div className="main-image">
              {guide.images && guide.images.length > 0 ? (
                <img 
                  src={getImageUrl(guide.images[activeImageIndex])} 
                  alt={`${guide.name || 'Guide'} - Profile view`}
                  onError={(e) => {
                    e.target.src = '/images/guide-placeholder.jpg';
                  }}
                />
              ) : (
                <img 
                  src="/images/guide-placeholder.jpg" 
                  alt={`${guide.name || 'Guide'} - No image available`}
                />
              )}
              <div className="guide-status">
                <span className={`status-indicator ${guide.availability ? 'available' : 'unavailable'}`}>
                  {guide.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
            
            {guide.images && guide.images.length > 1 && (
              <div className="thumbnail-gallery">
                {guide.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img 
                      src={getImageUrl(image)} 
                      alt={`${guide.name || 'Guide'} - View ${index + 1}`}
                      onError={(e) => {
                        e.target.src = '/images/guide-placeholder.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="guide-header">
            <h1>{guide.name || 'Tour Guide'}</h1>
            
            <div className="guide-meta">
              <div className="experience-box">
                <span className="experience-badge">{safeValue(guide.experience, '?')} {guide.experience === 1 ? 'year' : 'years'} of experience</span>
              </div>
              
              <div className="price-box">
                <span className="price-badge">{formatPrice(guide.pricePerDay)}</span>
              </div>
              
              {avgRating > 0 && (
                <div className="rating-display">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(avgRating) ? "star filled" : "star"}>★</span>
                  ))}
                  <span className="rating-value">{avgRating.toFixed(1)}</span>
                  <span className="review-count">({guide.reviews ? guide.reviews.length : 0} reviews)</span>
                </div>
              )}
            </div>
            
            <div className="guide-languages">
              <h3>Languages</h3>
              <div className="languages-list">
                {guide.languages && Array.isArray(guide.languages) && guide.languages.map((language, index) => (
                  <span key={index} className="language-tag">{language}</span>
                ))}
              </div>
            </div>
            
            <div className="guide-specializations">
              <h3>Specializations</h3>
              <div className="specializations-list">
                {guide.specializations && Array.isArray(guide.specializations) && guide.specializations.map((specialization, index) => (
                  <span key={index} className="specialization-tag">{specialization}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="guide-content">
          <div className="guide-main">
            <section className="bio-section">
              <h2>About This Guide</h2>
              <p>{safeValue(guide.bio, 'No biography available for this guide.')}</p>
            </section>
            
            {guide.reviews && guide.reviews.length > 0 && (
              <section className="reviews-section">
                <h2>Guest Reviews</h2>
                <div className="reviews-list">
                  {guide.reviews.map((review, index) => (
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
          
          <div className="guide-sidebar">
            {guide.contactInfo && (
              <div className="sidebar-section contact-section">
                <h3>Contact Information</h3>
                <ul className="contact-list">
                  {guide.contactInfo.phone && (
                    <li>
                      <i className="fas fa-phone"></i>
                      <span>{guide.contactInfo.phone}</span>
                    </li>
                  )}
                  {guide.contactInfo.email && (
                    <li>
                      <i className="fas fa-envelope"></i>
                      <span>{guide.contactInfo.email}</span>
                    </li>
                  )}
                </ul>
                
                {(guide.contactInfo.phone || guide.contactInfo.email) && (
                  <div className="booking-actions">
                    {guide.contactInfo.phone && (
                      <a 
                        href={`tel:${guide.contactInfo.phone}`} 
                        className="btn btn-primary btn-block"
                      >
                        <i className="fas fa-phone"></i> Call Guide
                      </a>
                    )}
                    {guide.contactInfo.email && (
                      <a 
                        href={`mailto:${guide.contactInfo.email}?subject=Tour Guide Inquiry for ${guide.name || 'Tour Guide'}`} 
                        className="btn btn-secondary btn-block"
                      >
                        <i className="fas fa-envelope"></i> Email Guide
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="sidebar-section areas-section">
              <h3>Areas of Operation</h3>
              {guide.areasOfOperation && Array.isArray(guide.areasOfOperation) && guide.areasOfOperation.length > 0 ? (
                <div className="areas-list">
                  {guide.areasOfOperation.map((area, index) => (
                    <div key={index} className="area-tag">{area}</div>
                  ))}
                </div>
              ) : (
                <p className="no-areas">No areas specified</p>
              )}
            </div>
            
            <div className="sidebar-section booking-info-section">
              <h3>Booking Information</h3>
              <ul className="specs-list">
                <li>
                  <span className="spec-label">Daily Rate:</span>
                  <span className="spec-value">{formatPrice(guide.pricePerDay)}</span>
                </li>
                <li>
                  <span className="spec-label">Experience:</span>
                  <span className="spec-value">{safeValue(guide.experience, 'Not specified')} {guide.experience === 1 ? 'year' : 'years'}</span>
                </li>
                <li>
                  <span className="spec-label">Availability:</span>
                  <span className={`spec-value ${guide.availability ? 'available-text' : 'unavailable-text'}`}>
                    {guide.availability ? 'Available for booking' : 'Currently unavailable'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="back-button-container">
          <Link to="/guides" className="btn btn-secondary back-button">
            <i className="fas fa-arrow-left"></i> Back to Guides
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuideDetailPage;