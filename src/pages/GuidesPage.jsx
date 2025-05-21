import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import GuideCard from '../components/guide/GuideCard';
import GuideForm from '../components/guide/GuideForm';
import Spinner from '../components/common/Spinner';
import './GuidesPage.css';

const GuidesPage = () => {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [filteredGuides, setFilteredGuides] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Common languages for filtering
  const commonLanguages = [
    'English', 'Sinhala', 'Tamil', 'Hindi', 'French', 'German', 
    'Spanish', 'Chinese', 'Japanese'
  ];
  
  // Common specializations for filtering
  const commonSpecializations = [
    'Cultural Heritage', 'Wildlife & Nature', 'Adventure', 'Historical Sites', 
    'Culinary Tours', 'Photography Tours', 'Hiking & Trekking', 'Religious Sites'
  ];
  
  // Common areas in Sri Lanka for filtering
  const commonAreas = [
    'Colombo', 'Kandy', 'Galle', 'Negombo', 'Nuwara Eliya', 'Anuradhapura',
    'Jaffna', 'Trincomalee', 'Sigiriya', 'Ella'
  ];

  // Fetch all guides on component mount
  useEffect(() => {
    fetchGuides();
  }, []);

  // Apply filters whenever search term or filters change
  useEffect(() => {
    if (guides.length > 0) {
      applyFilters();
    }
  }, [searchTerm, languageFilter, specializationFilter, areaFilter, guides]);

  const fetchGuides = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`${API_URL}/api/guides`);
      console.log("API Response:", res.data); // Debugging to see what's being returned
      setGuides(res.data);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError('Failed to fetch guides. Please try again later.');
      toast.error('Error loading guides');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...guides];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(guide => 
        (guide.name && guide.name.toLowerCase().includes(searchLower)) ||
        (guide.bio && guide.bio.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply language filter
    if (languageFilter !== '') {
      filtered = filtered.filter(guide => {
        if (guide.languages && Array.isArray(guide.languages)) {
          return guide.languages.includes(languageFilter);
        }
        return false;
      });
    }
    
    // Apply specialization filter
    if (specializationFilter !== '') {
      filtered = filtered.filter(guide => {
        if (guide.specializations && Array.isArray(guide.specializations)) {
          return guide.specializations.includes(specializationFilter);
        }
        return false;
      });
    }
    
    // Apply area filter
    if (areaFilter !== '') {
      filtered = filtered.filter(guide => {
        if (guide.areasOfOperation && Array.isArray(guide.areasOfOperation)) {
          return guide.areasOfOperation.includes(areaFilter);
        }
        return false;
      });
    }
    
    setFilteredGuides(filtered);
  };

  const handleGuideAdded = (newGuide) => {
    setGuides(prevGuides => [newGuide, ...prevGuides]);
    toast.success('New guide profile added successfully!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLanguageFilter('');
    setSpecializationFilter('');
    setAreaFilter('');
  };

  // Check if user can add guide profile
  const canAddGuide = user && user.role === 'guide';

  return (
    <div className="guides-page">
      <div className="container">
        <div className="guides-header">
          <h1>Discover Tour Guides in Sri Lanka</h1>
          <p>Find experienced local guides to enhance your Sri Lankan adventure</p>
        </div>
        
        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <div className="filters-row">
            <div className="filter-item">
              <label htmlFor="language-filter">Language</label>
              <select
                id="language-filter"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
              >
                <option value="">All Languages</option>
                {commonLanguages.map((language, index) => (
                  <option key={index} value={language}>{language}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label htmlFor="specialization-filter">Specialization</label>
              <select
                id="specialization-filter"
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
              >
                <option value="">All Specializations</option>
                {commonSpecializations.map((specialization, index) => (
                  <option key={index} value={specialization}>{specialization}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label htmlFor="area-filter">Location</label>
              <select
                id="area-filter"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {commonAreas.map((area, index) => (
                  <option key={index} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            {(searchTerm || languageFilter || specializationFilter || areaFilter) && (
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

        {/* Guide Form - Only visible to guides */}
        {canAddGuide && (
          <GuideForm onGuideAdded={handleGuideAdded} />
        )}

        {/* Guides List */}
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading guides...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchGuides} className="retry-btn">
              <i className="fas fa-sync-alt"></i> Try Again
            </button>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="no-results">
            {guides.length === 0 ? (
              <>
                <h3>No guides available yet</h3>
                {canAddGuide && (
                  <p>Be the first to add your guide profile!</p>
                )}
              </>
            ) : (
              <>
                <h3>No guides match your search</h3>
                <p>Try adjusting your filters or search term</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="results-count">
              Showing {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'}
            </div>
            <div className="guides-grid">
              {filteredGuides.map(guide => (
                <div key={guide._id} className="guide-card-wrapper">
                  <GuideCard guide={guide} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GuidesPage;