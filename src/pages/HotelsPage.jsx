import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import HotelCard from '../components/hotels/HotelCard';
import HotelForm from '../components/hotels/HotelForm';
import Spinner from '../components/common/Spinner';
import './HotelsPage.css';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [filteredHotels, setFilteredHotels] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch all hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  // Filter hotels when search changes
  useEffect(() => {
    if (searchCity.trim() === '') {
      setFilteredHotels(hotels);
    } else {
      const filtered = hotels.filter(hotel => 
        hotel.location.city.toLowerCase().includes(searchCity.toLowerCase())
      );
      setFilteredHotels(filtered);
    }
  }, [searchCity, hotels]);

  const fetchHotels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`${API_URL}/api/hotels`);
      setHotels(res.data);
      setFilteredHotels(res.data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to fetch hotels. Please try again later.');
      toast.error('Error loading hotels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotelAdded = (newHotel) => {
    setHotels(prevHotels => [newHotel, ...prevHotels]);
    toast.success('New hotel added successfully!');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  return (
    <div className="hotels-page">
      <div className="container">
        <div className="hotels-header">
          <h1>Explore Hotels in Sri Lanka</h1>
          <p>Discover the finest accommodations for your dream vacation</p>

          <div className="search-container">
            <form onSubmit={handleSearch}>
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search hotels by city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
                <button type="submit" className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Hotel Form - Only visible to hotel owners */}
        <HotelForm onHotelAdded={handleHotelAdded} />

        {/* Hotels List */}
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredHotels.length === 0 ? (
          <div className="no-hotels-message">
            {searchCity.trim() === '' 
              ? 'No hotels available yet. Be the first to add one!'
              : `No hotels found in "${searchCity}". Try another city or clear your search.`}
          </div>
        ) : (
          <div className="hotels-grid">
            {filteredHotels.map(hotel => (
              <div key={hotel._id} className="hotel-card-wrapper">
                <HotelCard hotel={hotel} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelsPage;