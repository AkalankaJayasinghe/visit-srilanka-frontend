import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import CabCard from '../components/cab/CabCard';
import CabForm from '../components/cab/CabForm';
import Spinner from '../components/common/Spinner';
import './CabsPage.css';

const CabsPage = () => {
  const { user } = useAuth();
  const [cabServices, setCabServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filteredCabServices, setFilteredCabServices] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Common vehicle types for filter
  const vehicleTypes = [
    'Sedan', 'SUV', 'Van', 'Mini-Bus', 'Luxury Car', 'Tuk-Tuk', 'Motorcycle'
  ];

  // Common areas in Sri Lanka for filter
  const commonAreas = [
    'Colombo', 'Kandy', 'Galle', 'Negombo', 'Nuwara Eliya', 'Anuradhapura',
    'Jaffna', 'Trincomalee', 'Batticaloa', 'Matara', 'Ella', 'Dambulla'
  ];

  // Fetch all cab services on component mount
  useEffect(() => {
    fetchCabServices();
  }, []);

  // Apply filters whenever search term or filters change
  useEffect(() => {
    if (cabServices.length > 0) {
      applyFilters();
    }
  }, [searchTerm, areaFilter, typeFilter, cabServices]);

  const fetchCabServices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`${API_URL}/api/cabs`);
      console.log("API Response:", res.data); // Debugging to see what's being returned
      setCabServices(res.data);
    } catch (err) {
      console.error('Error fetching cab services:', err);
      setError('Failed to fetch cab services. Please try again later.');
      toast.error('Error loading cab services');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cabServices];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cab => 
        (cab.name && cab.name.toLowerCase().includes(searchLower)) ||
        (cab.description && cab.description.toLowerCase().includes(searchLower)) ||
        (cab.vehicleModel && cab.vehicleModel.toLowerCase().includes(searchLower)) ||
        (cab.vehicleType && cab.vehicleType.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply area filter
    if (areaFilter !== '') {
      filtered = filtered.filter(cab => {
        if (cab.operatingAreas && Array.isArray(cab.operatingAreas)) {
          return cab.operatingAreas.includes(areaFilter);
        }
        return false;
      });
    }
    
    // Apply vehicle type filter
    if (typeFilter !== '') {
      filtered = filtered.filter(cab => cab.vehicleType === typeFilter);
    }
    
    setFilteredCabServices(filtered);
  };

  const handleCabServiceAdded = (newCabService) => {
    setCabServices(prevCabServices => [newCabService, ...prevCabServices]);
    toast.success('New cab service added successfully!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAreaFilter('');
    setTypeFilter('');
  };

  // Check if user can add cab services
  const canAddCabService = user && user.role === 'cab_driver';

  return (
    <div className="cabs-page">
      <div className="container">
        <div className="cabs-header">
          <h1>Find Cab Services in Sri Lanka</h1>
          <p>Discover reliable transportation services for your journey across the island</p>
        </div>
        
        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, vehicle type, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <div className="filters-row">
            <div className="filter-item">
              <label htmlFor="area-filter">Operating Area</label>
              <select
                id="area-filter"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <option value="">All Areas</option>
                {commonAreas.map((area, index) => (
                  <option key={index} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label htmlFor="type-filter">Vehicle Type</label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {vehicleTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {(searchTerm || areaFilter || typeFilter) && (
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

        {/* Cab Form - Only visible to cab drivers */}
        {canAddCabService && (
          <CabForm onCabServiceAdded={handleCabServiceAdded} />
        )}

        {/* Cab Services List */}
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading cab services...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchCabServices} className="retry-btn">
              <i className="fas fa-sync-alt"></i> Try Again
            </button>
          </div>
        ) : filteredCabServices.length === 0 ? (
          <div className="no-results">
            {cabServices.length === 0 ? (
              <>
                <h3>No cab services available yet</h3>
                {canAddCabService && (
                  <p>Be the first to add a cab service!</p>
                )}
              </>
            ) : (
              <>
                <h3>No cab services match your search</h3>
                <p>Try adjusting your filters or search term</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="results-count">
              Showing {filteredCabServices.length} {filteredCabServices.length === 1 ? 'cab service' : 'cab services'}
            </div>
            <div className="cabs-grid">
              {filteredCabServices.map(cab => (
                <div key={cab._id} className="cab-card-wrapper">
                  <CabCard cab={cab} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CabsPage;