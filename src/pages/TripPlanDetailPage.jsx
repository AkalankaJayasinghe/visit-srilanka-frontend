import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { 
  getTripPlanById, 
  deleteTripPlan, 
  createEventsFromTripPlan,
  formatDate,
  formatTime,
  getImageUrl,
  formatLocation
} from '../services/tripPlanService';
import { generateTripPlanPDF } from '../services/pdfExportService';
import './TripPlanDetailPage.css';

const TripPlanDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tripPlan, setTripPlan] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    fetchTripPlan();
  }, [id]);
  
  const fetchTripPlan = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getTripPlanById(id);
      setTripPlan(data);
      
      // Create calendar events from trip plan data
      const tripEvents = createEventsFromTripPlan(data);
      setEvents(tripEvents);
    } catch (err) {
      console.error('Error fetching trip plan:', err);
      setError('Failed to fetch trip plan. Please try again later.');
      toast.error('Error loading trip plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTripPlan(id);
      toast.success('Trip plan deleted successfully');
      navigate('/trip-plans');
    } catch (err) {
      console.error('Error deleting trip plan:', err);
      toast.error('Failed to delete trip plan');
    }
  };
  
  const handleDownloadPDF = async () => {
    if (!tripPlan) return;
    
    setDownloadingPdf(true);
    try {
      // Generate filename based on trip name
      const fileName = `${tripPlan.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-trip-plan.pdf`;
      
      // Generate PDF
      const success = await generateTripPlanPDF(tripPlan, fileName);
      
      if (success) {
        toast.success('Trip plan downloaded successfully!');
      } else {
        toast.error('Failed to generate PDF. Please try again.');
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error('Error generating PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading trip plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchTripPlan} className="retry-btn">
          <i className="fas fa-sync-alt"></i> Try Again
        </button>
        <Link to="/trip-plans" className="btn btn-primary">
          <i className="fas fa-arrow-left"></i> Back to Trip Plans
        </Link>
      </div>
    );
  }
  
  if (!tripPlan) {
    return (
      <div className="error-container">
        <h2>Not Found</h2>
        <p>This trip plan does not exist or has been deleted.</p>
        <Link to="/trip-plans" className="btn btn-primary">
          <i className="fas fa-arrow-left"></i> Back to Trip Plans
        </Link>
      </div>
    );
  }

  // Get all unique dates for the itinerary
  const uniqueDates = [...new Set(events.map(event => event.date))].sort();

  return (
    <div className="trip-plan-detail-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <div className="breadcrumbs">
              <Link to="/trip-plans">Trip Plans</Link> / {tripPlan.name}
            </div>
            <h1>{tripPlan.name}</h1>
            <div className="trip-date-range">
              <i className="fas fa-calendar-alt"></i>
              <span>{formatDate(tripPlan.startDate)} to {formatDate(tripPlan.endDate)}</span>
              <span className="trip-duration">
                ({Math.ceil((new Date(tripPlan.endDate) - new Date(tripPlan.startDate)) / (1000 * 60 * 60 * 24))} days)
              </span>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Generating PDF...
                </>
              ) : (
                <>
                  <i className="fas fa-file-pdf"></i> Download PDF
                </>
              )}
            </button>
            
            <Link to={`/trip-plans/edit/${tripPlan._id}`} className="btn btn-secondary">
              <i className="fas fa-edit"></i> Edit Trip
            </Link>
            
            {!deleteConfirm ? (
              <button 
                className="btn btn-danger"
                onClick={() => setDeleteConfirm(true)}
              >
                <i className="fas fa-trash"></i> Delete
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
        </div>
        
        <div className="trip-content" id="trip-plan-content">
          <div className="trip-overview">
            <h2>Trip Services Summary</h2>
            
            <div className="services-grid">
              {/* Hotels */}
              <div className="service-category">
                <div className="category-header">
                  <i className="fas fa-hotel"></i>
                  <h3>Hotels</h3>
                </div>
                {tripPlan.hotels && tripPlan.hotels.length > 0 ? (
                  <div className="category-items">
                    {tripPlan.hotels.map((hotel, index) => {
                      const hotelDetails = hotel.hotelId;
                      return (
                        <div key={index} className="service-item">
                          <img 
                            src={getImageUrl(hotelDetails, 'hotel', API_URL)} 
                            alt={hotelDetails?.name || 'Hotel'} 
                            onError={(e) => { e.target.src = '/images/hotel-placeholder.jpg' }}
                          />
                          <div className="item-details">
                            <h4>{hotelDetails?.name || 'Hotel'}</h4>
                            <p className="item-location">
                              <i className="fas fa-map-marker-alt"></i> {formatLocation(hotelDetails?.location)}
                            </p>
                            <p className="item-date-range">
                              <i className="far fa-calendar-check"></i> {formatDate(hotel.checkIn)} to {formatDate(hotel.checkOut)}
                            </p>
                          </div>
                          {hotelDetails && (
                            <Link to={`/hotels/${hotelDetails._id}`} className="view-btn">
                              <i className="fas fa-eye"></i>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-category">No hotels added</div>
                )}
              </div>
              
              {/* Restaurants */}
              <div className="service-category">
                <div className="category-header">
                  <i className="fas fa-utensils"></i>
                  <h3>Restaurants</h3>
                </div>
                {tripPlan.restaurants && tripPlan.restaurants.length > 0 ? (
                  <div className="category-items">
                    {tripPlan.restaurants.map((restaurant, index) => {
                      const restaurantDetails = restaurant.restaurantId;
                      return (
                        <div key={index} className="service-item">
                          <img 
                            src={getImageUrl(restaurantDetails, 'restaurant', API_URL)} 
                            alt={restaurantDetails?.name || 'Restaurant'} 
                            onError={(e) => { e.target.src = '/images/restaurant-placeholder.jpg' }}
                          />
                          <div className="item-details">
                            <h4>{restaurantDetails?.name || 'Restaurant'}</h4>
                            <p className="item-location">
                              <i className="fas fa-map-marker-alt"></i> {formatLocation(restaurantDetails?.location)}
                            </p>
                            <p className="item-date-range">
                              <i className="far fa-calendar"></i> {formatDate(restaurant.date)} at {formatTime(restaurant.time)}
                            </p>
                          </div>
                          {restaurantDetails && (
                            <Link to={`/restaurants/${restaurantDetails._id}`} className="view-btn">
                              <i className="fas fa-eye"></i>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-category">No restaurants added</div>
                )}
              </div>
              
              {/* Cab Services */}
              <div className="service-category">
                <div className="category-header">
                  <i className="fas fa-car"></i>
                  <h3>Transportation</h3>
                </div>
                {tripPlan.cabServices && tripPlan.cabServices.length > 0 ? (
                  <div className="category-items">
                    {tripPlan.cabServices.map((cab, index) => {
                      const cabDetails = cab.cabServiceId;
                      return (
                        <div key={index} className="service-item">
                          <img 
                            src={getImageUrl(cabDetails, 'cab', API_URL)} 
                            alt={cabDetails?.name || 'Transportation'} 
                            onError={(e) => { e.target.src = '/images/cab-placeholder.jpg' }}
                          />
                          <div className="item-details">
                            <h4>{cabDetails?.name || 'Cab Service'}</h4>
                            <p className="item-vehicle">
                              <i className="fas fa-car-side"></i> {cabDetails?.vehicleType} {cabDetails?.vehicleModel}
                            </p>
                            <p className="item-date-range">
                              <i className="far fa-calendar"></i> {formatDate(cab.date)}
                            </p>
                            <p className="item-route">
                              <i className="fas fa-route"></i> {cab.pickup} to {cab.dropoff}
                            </p>
                          </div>
                          {cabDetails && (
                            <Link to={`/cabs/${cabDetails._id}`} className="view-btn">
                              <i className="fas fa-eye"></i>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-category">No transportation added</div>
                )}
              </div>
              
              {/* Guides */}
              <div className="service-category">
                <div className="category-header">
                  <i className="fas fa-user-tie"></i>
                  <h3>Tour Guides</h3>
                </div>
                {tripPlan.guides && tripPlan.guides.length > 0 ? (
                  <div className="category-items">
                    {tripPlan.guides.map((guide, index) => {
                      const guideDetails = guide.guideId;
                      return (
                        <div key={index} className="service-item">
                          <img 
                            src={getImageUrl(guideDetails, 'guide', API_URL)} 
                            alt={guideDetails?.name || 'Guide'} 
                            onError={(e) => { e.target.src = '/images/guide-placeholder.jpg' }}
                          />
                          <div className="item-details">
                            <h4>{guideDetails?.name || 'Tour Guide'}</h4>
                            {guideDetails?.languages && (
                              <p className="item-languages">
                                <i className="fas fa-language"></i> Languages: {Array.isArray(guideDetails.languages) ? guideDetails.languages.join(', ') : formatLocation(guideDetails.languages)}
                              </p>
                            )}
                            <p className="item-date-range">
                              <i className="far fa-calendar-check"></i> {formatDate(guide.startDate)} to {formatDate(guide.endDate)}
                            </p>
                          </div>
                          {guideDetails && (
                            <Link to={`/guides/${guideDetails._id}`} className="view-btn">
                              <i className="fas fa-eye"></i>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-category">No guides added</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="itinerary-section">
            <h2>Day-by-Day Itinerary</h2>
            
            {uniqueDates.length > 0 ? (
              <div className="itinerary-timeline">
                {uniqueDates.map((date, dateIndex) => {
                  const dayEvents = events.filter(event => event.date === date);
                  const dateObj = new Date(date);
                  const dayNumber = Math.floor((dateObj - new Date(tripPlan.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                  
                  return (
                    <div key={dateIndex} className="timeline-day">
                      <div className="day-header">
                        <div className="day-number">Day {dayNumber}</div>
                        <div className="day-date">{formatDate(date)}</div>
                      </div>
                      
                      <div className="day-events">
                        {dayEvents.map((event, eventIndex) => (
                          <div 
                            key={eventIndex} 
                            className="timeline-event"
                            style={{ borderLeftColor: event.color }}
                          >
                            <div className="event-icon" style={{ backgroundColor: event.color }}>
                              <i className={event.icon}></i>
                            </div>
                            <div className="event-details">
                              <div className="event-title">{event.title}</div>
                              {event.time && <div className="event-time">{formatTime(event.time)}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-itinerary">
                <p>Your itinerary is empty. Add hotels, restaurants, transportation, or guides to see them here.</p>
                <Link to={`/trip-plans/edit/${tripPlan._id}`} className="btn btn-primary">
                  <i className="fas fa-plus"></i> Add Services to Your Trip
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="back-button-container">
          <Link to="/trip-plans" className="btn btn-secondary back-button">
            <i className="fas fa-arrow-left"></i> Back to Trip Plans
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripPlanDetailPage;