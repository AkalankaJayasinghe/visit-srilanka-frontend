import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import RestaurantForm from '../components/restaurant/RestaurantForm';
import Spinner from '../components/common/Spinner';
import './RestaurantsPage.css';

const RestaurantsPage = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Common cuisines for filter
  const cuisineTypes = [
    'Sri Lankan', 'Indian', 'Chinese', 'Italian', 'Japanese', 
    'Thai', 'Mexican', 'French', 'American', 'Other'
  ];

  // Fetch all restaurants on component mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Apply filters whenever search term or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, cuisineFilter, priceFilter, restaurants]);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`${API_URL}/api/restaurants`);
      setRestaurants(res.data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Failed to fetch restaurants. Please try again later.');
      toast.error('Error loading restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...restaurants];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchLower) ||
        restaurant.description.toLowerCase().includes(searchLower) ||
        restaurant.location.city.toLowerCase().includes(searchLower) ||
        restaurant.location.address.toLowerCase().includes(searchLower) ||
        (Array.isArray(restaurant.cuisine) && 
         restaurant.cuisine.some(c => c.toLowerCase().includes(searchLower)))
      );
    }
    
    // Apply cuisine filter
    if (cuisineFilter !== '') {
      filtered = filtered.filter(restaurant => {
        if (Array.isArray(restaurant.cuisine)) {
          return restaurant.cuisine.includes(cuisineFilter);
        } else {
          return restaurant.cuisine === cuisineFilter;
        }
      });
    }
    
    // Apply price filter
    if (priceFilter !== '') {
      filtered = filtered.filter(restaurant => restaurant.priceRange === priceFilter);
    }
    
    setFilteredRestaurants(filtered);
  };

  const handleRestaurantAdded = (newRestaurant) => {
    setRestaurants(prevRestaurants => [newRestaurant, ...prevRestaurants]);
    toast.success('New restaurant added successfully!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCuisineFilter('');
    setPriceFilter('');
  };

  // Check if user can add restaurants
  const canAddRestaurant = user && user.role === 'restaurant_owner';

  return (
    <div className="restaurants-page">
      <div className="container">
        <div className="restaurants-header">
          <h1>Explore Restaurants in Sri Lanka</h1>
          <p>Discover the finest dining experiences for your taste buds</p>
        </div>
        
        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search restaurants by name, cuisine, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <div className="filters-row">
            <div className="filter-item">
              <label htmlFor="cuisine-filter">Cuisine</label>
              <select
                id="cuisine-filter"
                value={cuisineFilter}
                onChange={(e) => setCuisineFilter(e.target.value)}
              >
                <option value="">All Cuisines</option>
                {cuisineTypes.map((cuisine, index) => (
                  <option key={index} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label htmlFor="price-filter">Price Range</label>
              <select
                id="price-filter"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="">All Prices</option>
                <option value="$">$ (Budget)</option>
                <option value="$$">$$ (Moderate)</option>
                <option value="$$$">$$$ (Expensive)</option>
                <option value="$$$$">$$$$ (Very Expensive)</option>
              </select>
            </div>
            
            {(searchTerm || cuisineFilter || priceFilter) && (
              <div className="filter-actions">
                <button
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  <i className="fas fa-times"></i> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Restaurant Form - Only visible to restaurant owners */}
        {canAddRestaurant && (
          <RestaurantForm onRestaurantAdded={handleRestaurantAdded} />
        )}

        {/* Restaurants List */}
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading restaurants...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchRestaurants} className="retry-btn">
              <i className="fas fa-sync-alt"></i> Try Again
            </button>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="no-results">
            {restaurants.length === 0 ? (
              <>
                <h3>No restaurants available yet</h3>
                {canAddRestaurant && (
                  <p>Be the first to add a restaurant!</p>
                )}
              </>
            ) : (
              <>
                <h3>No restaurants match your search</h3>
                <p>Try adjusting your filters or search term</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="results-count">
              Showing {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'}
            </div>
            <div className="restaurants-grid">
              {filteredRestaurants.map(restaurant => (
                <div key={restaurant._id} className="restaurant-card-wrapper">
                  <RestaurantCard restaurant={restaurant} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;