import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import TripPlanCard from '../components/tripPlan/TripPlanCard';
import { getUserTripPlans, deleteTripPlan } from '../services/tripPlanService';
import Spinner from '../components/common/Spinner';
import './TripPlansPage.css';

const TripPlansPage = () => {
  const { user } = useAuth();
  const [tripPlans, setTripPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTripPlans, setFilteredTripPlans] = useState([]);
  const [sortOption, setSortOption] = useState('startDate-desc');

  // Fetch trip plans on component mount
  useEffect(() => {
    fetchTripPlans();
  }, []);

  // Apply filters and sorting whenever search term or sort option changes
  useEffect(() => {
    if (tripPlans.length > 0) {
      filterAndSortTripPlans();
    }
  }, [searchTerm, sortOption, tripPlans]);

  const fetchTripPlans = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserTripPlans();
      setTripPlans(data);
    } catch (err) {
      console.error('Error fetching trip plans:', err);
      setError('Failed to fetch trip plans. Please try again later.');
      toast.error('Error loading trip plans');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTripPlans = () => {
    // First, filter by search term if any
    let filtered = [...tripPlans];
    
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(plan => 
        (plan.name && plan.name.toLowerCase().includes(searchLower))
      );
    }
    
    // Then sort according to selected option
    const [sortField, sortDirection] = sortOption.split('-');
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } 
      else if (sortField === 'startDate') {
        comparison = new Date(a.startDate) - new Date(b.startDate);
      }
      else if (sortField === 'endDate') {
        comparison = new Date(a.endDate) - new Date(b.endDate);
      }
      else if (sortField === 'duration') {
        const durationA = Math.ceil((new Date(a.endDate) - new Date(a.startDate)) / (1000 * 60 * 60 * 24));
        const durationB = Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24));
        comparison = durationA - durationB;
      }
      else if (sortField === 'created') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredTripPlans(filtered);
  };

  const handleDeleteTripPlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip plan?')) {
      try {
        await deleteTripPlan(id);
        setTripPlans(prevPlans => prevPlans.filter(plan => plan._id !== id));
        toast.success('Trip plan deleted successfully');
      } catch (err) {
        console.error('Error deleting trip plan:', err);
        toast.error('Failed to delete trip plan');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your trip plans...</p>
      </div>
    );
  }

  return (
    <div className="trip-plans-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>My Trip Plans</h1>
            <p>Manage your travel itineraries across Sri Lanka</p>
          </div>
          <Link to="/trip-plans/add" className="btn btn-primary create-plan-btn">
            <i className="fas fa-plus"></i> Create New Trip Plan
          </Link>
        </div>
        
        <div className="search-sort-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search trip plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <div className="sort-box">
            <label htmlFor="sort-option">Sort by:</label>
            <select
              id="sort-option"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="startDate-desc">Start Date (Newest First)</option>
              <option value="startDate-asc">Start Date (Oldest First)</option>
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
              <option value="duration-desc">Duration (Longest First)</option>
              <option value="duration-asc">Duration (Shortest First)</option>
              <option value="created-desc">Recently Created</option>
              <option value="created-asc">Oldest Created</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchTripPlans} className="retry-btn">
              <i className="fas fa-sync-alt"></i> Try Again
            </button>
          </div>
        ) : filteredTripPlans.length === 0 ? (
          <div className="no-results">
            {tripPlans.length === 0 ? (
              <>
                <div className="empty-state">
                  <i className="fas fa-route empty-icon"></i>
                  <h3>No Trip Plans Yet</h3>
                  <p>Create your first trip plan to start organizing your journey across Sri Lanka.</p>
                  <Link to="/trip-plans/add" className="btn btn-primary">
                    Create First Trip Plan
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3>No trip plans match your search</h3>
                <p>Try adjusting your search term</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="results-count">
              Showing {filteredTripPlans.length} {filteredTripPlans.length === 1 ? 'trip plan' : 'trip plans'}
            </div>
            <div className="trip-plans-grid">
              {filteredTripPlans.map(tripPlan => (
                <div key={tripPlan._id} className="trip-plan-card-wrapper">
                  <TripPlanCard tripPlan={tripPlan} onDelete={handleDeleteTripPlan} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TripPlansPage;