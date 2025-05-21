import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { calculateTripDuration } from '../../services/tripPlanService';
import './TripPlanCard.css';

const TripPlanCard = ({ tripPlan, onDelete }) => {
  if (!tripPlan) {
    return (
      <div className="trip-plan-card error-card">
        <p>Error: Trip plan data is unavailable</p>
      </div>
    );
  }

  // Calculate duration in days
  const startDate = new Date(tripPlan.startDate);
  const endDate = new Date(tripPlan.endDate);
  const durationInDays = calculateTripDuration(startDate, endDate);
  
  // Format dates
  const formattedStartDate = format(startDate, 'MMM d, yyyy');
  const formattedEndDate = format(endDate, 'MMM d, yyyy');
  
  // Count included services
  const hotelCount = tripPlan.hotels?.length || 0;
  const restaurantCount = tripPlan.restaurants?.length || 0;
  const cabCount = tripPlan.cabServices?.length || 0;
  const guideCount = tripPlan.guides?.length || 0;

  return (
    <div className="trip-plan-card">
      <div className="trip-plan-header">
        <h3>{tripPlan.name}</h3>
        <div className="trip-dates">
          <div className="date-range">
            <span className="start-date">{formattedStartDate}</span>
            <span className="date-separator">→</span>
            <span className="end-date">{formattedEndDate}</span>
          </div>
          <span className="duration-badge">
            {durationInDays} {durationInDays === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>
      
      <div className="trip-services">
        {hotelCount > 0 && (
          <div className="service-item hotel-service">
            <i className="fas fa-hotel"></i>
            <span>{hotelCount} {hotelCount === 1 ? 'Hotel' : 'Hotels'}</span>
          </div>
        )}
        
        {restaurantCount > 0 && (
          <div className="service-item restaurant-service">
            <i className="fas fa-utensils"></i>
            <span>{restaurantCount} {restaurantCount === 1 ? 'Restaurant' : 'Restaurants'}</span>
          </div>
        )}
        
        {cabCount > 0 && (
          <div className="service-item cab-service">
            <i className="fas fa-car"></i>
            <span>{cabCount} {cabCount === 1 ? 'Cab' : 'Cabs'}</span>
          </div>
        )}
        
        {guideCount > 0 && (
          <div className="service-item guide-service">
            <i className="fas fa-user-tie"></i>
            <span>{guideCount} {guideCount === 1 ? 'Guide' : 'Guides'}</span>
          </div>
        )}
        
        {(hotelCount + restaurantCount + cabCount + guideCount) === 0 && (
          <div className="empty-services">
            <span>No services added yet</span>
          </div>
        )}
      </div>
      
      <div className="trip-actions">
        <Link to={`/trip-plans/${tripPlan._id}`} className="btn btn-primary">
          View Details
        </Link>
        {onDelete && (
          <button 
            className="btn btn-danger"
            onClick={(e) => {
              e.preventDefault();
              onDelete(tripPlan._id);
            }}
          >
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default TripPlanCard;