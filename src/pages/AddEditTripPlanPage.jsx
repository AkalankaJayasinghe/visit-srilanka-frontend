import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { 
  getTripPlanById, 
  createTripPlan, 
  updateTripPlan,
  getHotels,
  getRestaurants,
  getCabServices,
  getGuides,
  calculateTripDuration,
  formatDate,
  formatTime
} from '../services/tripPlanService';
import './AddEditTripPlanPage.css';

const AddEditTripPlanPage = ({ isEdit = false }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [cabServices, setCabServices] = useState([]);
  const [guides, setGuides] = useState([]);
  
  // Basic trip details form data
  const [basicDetails, setBasicDetails] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  
  // Selected services
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [selectedCabs, setSelectedCabs] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Helper function to format location data safely
  const formatLocation = (location) => {
    if (!location) return 'Location not available';
    
    if (typeof location === 'string') return location;
    
    if (typeof location === 'object') {
      // Return the most specific location info available
      if (location.address) return location.address;
      if (location.city) return location.city;
      if (location.coordinates && Array.isArray(location.coordinates)) 
        return `${location.coordinates[0]}, ${location.coordinates[1]}`;
      
      // Generic object stringification as fallback
      try {
        return JSON.stringify(location);
      } catch (e) {
        return 'Complex location';
      }
    }
    
    return String(location);
  };

  // Fetch existing trip plan if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      fetchTripPlan();
    }
  }, [isEdit, id]);
  
  // Fetch all service options when needed
  useEffect(() => {
    if (step === 2) {
      fetchHotels();
    } else if (step === 3) {
      fetchRestaurants();
    } else if (step === 4) {
      fetchCabServices();
    } else if (step === 5) {
      fetchGuides();
    }
  }, [step]);

  const fetchTripPlan = async () => {
    try {
      setIsLoading(true);
      const tripPlan = await getTripPlanById(id);
      
      // Set basic details
      setBasicDetails({
        name: tripPlan.name,
        startDate: format(new Date(tripPlan.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(tripPlan.endDate), 'yyyy-MM-dd')
      });
      
      // Set selected services
      if (tripPlan.hotels && tripPlan.hotels.length > 0) {
        setSelectedHotels(tripPlan.hotels.map(hotel => ({
          hotelId: hotel.hotelId?._id || hotel.hotelId,
          name: hotel.hotelId?.name || 'Unknown Hotel',
          checkIn: format(new Date(hotel.checkIn), 'yyyy-MM-dd'),
          checkOut: format(new Date(hotel.checkOut), 'yyyy-MM-dd')
        })));
      }
      
      if (tripPlan.restaurants && tripPlan.restaurants.length > 0) {
        setSelectedRestaurants(tripPlan.restaurants.map(restaurant => ({
          restaurantId: restaurant.restaurantId?._id || restaurant.restaurantId,
          name: restaurant.restaurantId?.name || 'Unknown Restaurant',
          date: format(new Date(restaurant.date), 'yyyy-MM-dd'),
          time: restaurant.time
        })));
      }
      
      if (tripPlan.cabServices && tripPlan.cabServices.length > 0) {
        setSelectedCabs(tripPlan.cabServices.map(cab => ({
          cabServiceId: cab.cabServiceId?._id || cab.cabServiceId,
          name: cab.cabServiceId?.name || 'Unknown Cab Service',
          date: format(new Date(cab.date), 'yyyy-MM-dd'),
          pickup: cab.pickup,
          dropoff: cab.dropoff
        })));
      }
      
      if (tripPlan.guides && tripPlan.guides.length > 0) {
        setSelectedGuides(tripPlan.guides.map(guide => ({
          guideId: guide.guideId?._id || guide.guideId,
          name: guide.guideId?.name || 'Unknown Guide',
          startDate: format(new Date(guide.startDate), 'yyyy-MM-dd'),
          endDate: format(new Date(guide.endDate), 'yyyy-MM-dd')
        })));
      }
    } catch (err) {
      console.error('Error fetching trip plan:', err);
      setError('Failed to load trip plan data. Please try again.');
      toast.error('Error loading trip plan data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const data = await getHotels();
      setHotels(data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      toast.error('Failed to load hotels');
    }
  };

  const fetchRestaurants = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      toast.error('Failed to load restaurants');
    }
  };

  const fetchCabServices = async () => {
    try {
      const data = await getCabServices();
      setCabServices(data);
    } catch (err) {
      console.error('Error fetching cab services:', err);
      toast.error('Failed to load cab services');
    }
  };

  const fetchGuides = async () => {
    try {
      const data = await getGuides();
      setGuides(data);
    } catch (err) {
      console.error('Error fetching guides:', err);
      toast.error('Failed to load guides');
    }
  };

  const handleBasicDetailsChange = (e) => {
    const { name, value } = e.target;
    setBasicDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHotelSelect = (e, hotelId) => {
    const selected = hotels.find(hotel => hotel._id === hotelId);
    if (!selected) return;
    
    // Check if already selected
    if (selectedHotels.some(h => h.hotelId === hotelId)) {
      toast.info('This hotel is already in your plan');
      return;
    }
    
    // Default check-in to trip start date and check-out to trip end date
    setSelectedHotels([...selectedHotels, {
      hotelId,
      name: selected.name,
      checkIn: basicDetails.startDate,
      checkOut: basicDetails.endDate
    }]);
  };

  const handleRestaurantSelect = (e, restaurantId) => {
    const selected = restaurants.find(restaurant => restaurant._id === restaurantId);
    if (!selected) return;
    
    // Check if already selected
    if (selectedRestaurants.some(r => r.restaurantId === restaurantId)) {
      toast.info('This restaurant is already in your plan');
      return;
    }
    
    setSelectedRestaurants([...selectedRestaurants, {
      restaurantId,
      name: selected.name,
      date: basicDetails.startDate,
      time: '19:00' // Default dinner time
    }]);
  };

  const handleCabSelect = (e, cabServiceId) => {
    const selected = cabServices.find(cab => cab._id === cabServiceId);
    if (!selected) return;
    
    // Check if already selected
    if (selectedCabs.some(c => c.cabServiceId === cabServiceId)) {
      toast.info('This cab service is already in your plan');
      return;
    }
    
    setSelectedCabs([...selectedCabs, {
      cabServiceId,
      name: selected.name,
      date: basicDetails.startDate,
      pickup: '',
      dropoff: ''
    }]);
  };

  const handleGuideSelect = (e, guideId) => {
    const selected = guides.find(guide => guide._id === guideId);
    if (!selected) return;
    
    // Check if already selected
    if (selectedGuides.some(g => g.guideId === guideId)) {
      toast.info('This guide is already in your plan');
      return;
    }
    
    setSelectedGuides([...selectedGuides, {
      guideId,
      name: selected.name,
      startDate: basicDetails.startDate,
      endDate: basicDetails.endDate
    }]);
  };

  const updateHotelDetails = (index, field, value) => {
    const updated = [...selectedHotels];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedHotels(updated);
  };

  const updateRestaurantDetails = (index, field, value) => {
    const updated = [...selectedRestaurants];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedRestaurants(updated);
  };

  const updateCabDetails = (index, field, value) => {
    const updated = [...selectedCabs];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedCabs(updated);
  };

  const updateGuideDetails = (index, field, value) => {
    const updated = [...selectedGuides];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedGuides(updated);
  };

  const removeHotel = (index) => {
    setSelectedHotels(selectedHotels.filter((_, i) => i !== index));
  };

  const removeRestaurant = (index) => {
    setSelectedRestaurants(selectedRestaurants.filter((_, i) => i !== index));
  };

  const removeCab = (index) => {
    setSelectedCabs(selectedCabs.filter((_, i) => i !== index));
  };

  const removeGuide = (index) => {
    setSelectedGuides(selectedGuides.filter((_, i) => i !== index));
  };

  const validateBasicDetails = () => {
    if (!basicDetails.name.trim()) {
      toast.error('Please enter a name for your trip plan');
      return false;
    }
    
    if (!basicDetails.startDate) {
      toast.error('Please select a start date');
      return false;
    }
    
    if (!basicDetails.endDate) {
      toast.error('Please select an end date');
      return false;
    }
    
    const start = new Date(basicDetails.startDate);
    const end = new Date(basicDetails.endDate);
    
    if (end < start) {
      toast.error('End date cannot be before start date');
      return false;
    }
    
    return true;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // Check if the path is already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Combine the API URL with the image path
    const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const imgPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${apiUrl}${imgPath}`;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateBasicDetails()) {
      return;
    }
    
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const tripPlanData = {
        name: basicDetails.name,
        startDate: basicDetails.startDate,
        endDate: basicDetails.endDate,
        hotels: selectedHotels.map(hotel => ({
          hotelId: hotel.hotelId,
          checkIn: hotel.checkIn,
          checkOut: hotel.checkOut
        })),
        restaurants: selectedRestaurants.map(restaurant => ({
          restaurantId: restaurant.restaurantId,
          date: restaurant.date,
          time: restaurant.time
        })),
        cabServices: selectedCabs.map(cab => ({
          cabServiceId: cab.cabServiceId,
          date: cab.date,
          pickup: cab.pickup,
          dropoff: cab.dropoff
        })),
        guides: selectedGuides.map(guide => ({
          guideId: guide.guideId,
          startDate: guide.startDate,
          endDate: guide.endDate
        }))
      };
      
      let response;
      if (isEdit) {
        response = await updateTripPlan(id, tripPlanData);
        toast.success('Trip plan updated successfully!');
      } else {
        response = await createTripPlan(tripPlanData);
        toast.success('Trip plan created successfully!');
      }
      
      navigate(`/trip-plans/${response._id}`);
    } catch (err) {
      console.error('Error saving trip plan:', err);
      toast.error(err.response?.data?.message || 'Failed to save trip plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEdit) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading trip plan data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/trip-plans')} className="btn btn-primary">
          Back to Trip Plans
        </button>
      </div>
    );
  }

  return (
    <div className="add-edit-trip-plan-page">
      <div className="container">
        <h1>{isEdit ? 'Edit Trip Plan' : 'Create New Trip Plan'}</h1>
        
        <div className="stepper">
          <div className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Basic Details</div>
          </div>
          <div className={`step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Hotels</div>
          </div>
          <div className={`step ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Restaurants</div>
          </div>
          <div className={`step ${step === 4 ? 'active' : step > 4 ? 'completed' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Transportation</div>
          </div>
          <div className={`step ${step === 5 ? 'active' : step > 5 ? 'completed' : ''}`}>
            <div className="step-number">5</div>
            <div className="step-label">Guides</div>
          </div>
          <div className={`step ${step === 6 ? 'active' : ''}`}>
            <div className="step-number">6</div>
            <div className="step-label">Review</div>
          </div>
        </div>
        
        <div className="form-container">
          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="step-content">
              <h2>Enter Basic Trip Details</h2>
              <div className="form-group">
                <label htmlFor="name">Trip Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={basicDetails.name}
                  onChange={handleBasicDetailsChange}
                  placeholder="e.g., Summer 2023 Sri Lanka Adventure"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date*</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={basicDetails.startDate}
                    onChange={handleBasicDetailsChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="endDate">End Date*</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={basicDetails.endDate}
                    onChange={handleBasicDetailsChange}
                    required
                  />
                </div>
              </div>
              
              <div className="date-range-info">
                {basicDetails.startDate && basicDetails.endDate && (
                  <p>
                    <i className="fas fa-calendar-alt"></i>
                    Trip Duration: {calculateTripDuration(basicDetails.startDate, basicDetails.endDate)} days
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Step 2: Hotels */}
          {step === 2 && (
            <div className="step-content">
              <h2>Add Hotels to Your Trip</h2>
              <p className="step-description">Select hotels for your accommodation during the trip.</p>
              
              {/* Selected Hotels List */}
              {selectedHotels.length > 0 && (
                <div className="selected-items">
                  <h3>Selected Hotels</h3>
                  {selectedHotels.map((hotel, index) => (
                    <div key={index} className="selected-item">
                      <div className="item-name">{hotel.name}</div>
                      <div className="item-details">
                        <div className="detail-row">
                          <label>Check-in:</label>
                          <input
                            type="date"
                            value={hotel.checkIn}
                            min={basicDetails.startDate}
                            max={basicDetails.endDate}
                            onChange={(e) => updateHotelDetails(index, 'checkIn', e.target.value)}
                          />
                        </div>
                        <div className="detail-row">
                          <label>Check-out:</label>
                          <input
                            type="date"
                            value={hotel.checkOut}
                            min={hotel.checkIn || basicDetails.startDate}
                            max={basicDetails.endDate}
                            onChange={(e) => updateHotelDetails(index, 'checkOut', e.target.value)}
                          />
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeHotel(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hotel Selection */}
              <div className="service-selection">
                <h3>Available Hotels</h3>
                <div className="selection-list">
                  {hotels.length === 0 ? (
                    <div className="loading-services">Loading hotels...</div>
                  ) : (
                    hotels.map(hotel => (
                      <div key={hotel._id} className="selection-card">
                        <img 
                          src={hotel.images?.length > 0 ? getImageUrl(hotel.images[0]) : '/images/hotel-placeholder.jpg'} 
                          alt={hotel.name}
                          onError={(e) => { e.target.src = '/images/hotel-placeholder.jpg' }}
                        />
                        <div className="card-content">
                          <h4>{hotel.name}</h4>
                          <p className="location">
                            <i className="fas fa-map-marker-alt"></i> {formatLocation(hotel.location)}
                          </p>
                          {hotel.priceRange && (
                            <p className="price">Price Range: {hotel.priceRange}</p>
                          )}
                          <button 
                            className="add-btn"
                            onClick={(e) => handleHotelSelect(e, hotel._id)}
                          >
                            Add to Trip
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Restaurants */}
          {step === 3 && (
            <div className="step-content">
              <h2>Add Restaurants to Your Trip</h2>
              <p className="step-description">Select restaurants for your dining experiences.</p>
              
              {/* Selected Restaurants List */}
              {selectedRestaurants.length > 0 && (
                <div className="selected-items">
                  <h3>Selected Restaurants</h3>
                  {selectedRestaurants.map((restaurant, index) => (
                    <div key={index} className="selected-item">
                      <div className="item-name">{restaurant.name}</div>
                      <div className="item-details">
                        <div className="detail-row">
                          <label>Date:</label>
                          <input
                            type="date"
                            value={restaurant.date}
                            min={basicDetails.startDate}
                            max={basicDetails.endDate}
                            onChange={(e) => updateRestaurantDetails(index, 'date', e.target.value)}
                          />
                        </div>
                        <div className="detail-row">
                          <label>Time:</label>
                          <input
                            type="time"
                            value={restaurant.time}
                            onChange={(e) => updateRestaurantDetails(index, 'time', e.target.value)}
                          />
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeRestaurant(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Restaurant Selection */}
              <div className="service-selection">
                <h3>Available Restaurants</h3>
                <div className="selection-list">
                  {restaurants.length === 0 ? (
                    <div className="loading-services">Loading restaurants...</div>
                  ) : (
                    restaurants.map(restaurant => (
                      <div key={restaurant._id} className="selection-card">
                        <img 
                          src={restaurant.images?.length > 0 ? getImageUrl(restaurant.images[0]) : '/images/restaurant-placeholder.jpg'} 
                          alt={restaurant.name}
                          onError={(e) => { e.target.src = '/images/restaurant-placeholder.jpg' }}
                        />
                        <div className="card-content">
                          <h4>{restaurant.name}</h4>
                          <p className="location">
                            <i className="fas fa-map-marker-alt"></i> {formatLocation(restaurant.location)}
                          </p>
                          {restaurant.cuisine && (
                            <p className="cuisine">Cuisine: {restaurant.cuisine.join(', ')}</p>
                          )}
                          <button 
                            className="add-btn"
                            onClick={(e) => handleRestaurantSelect(e, restaurant._id)}
                          >
                            Add to Trip
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Cab Services */}
          {step === 4 && (
            <div className="step-content">
              <h2>Add Transportation to Your Trip</h2>
              <p className="step-description">Select cab services for your travel needs.</p>
              
              {/* Selected Cabs List */}
              {selectedCabs.length > 0 && (
                <div className="selected-items">
                  <h3>Selected Transportation</h3>
                  {selectedCabs.map((cab, index) => (
                    <div key={index} className="selected-item">
                      <div className="item-name">{cab.name}</div>
                      <div className="item-details">
                        <div className="detail-row">
                          <label>Date:</label>
                          <input
                            type="date"
                            value={cab.date}
                            min={basicDetails.startDate}
                            max={basicDetails.endDate}
                            onChange={(e) => updateCabDetails(index, 'date', e.target.value)}
                          />
                        </div>
                        <div className="detail-row">
                          <label>Pickup:</label>
                          <input
                            type="text"
                            value={cab.pickup}
                            placeholder="Pickup location"
                            onChange={(e) => updateCabDetails(index, 'pickup', e.target.value)}
                          />
                        </div>
                        <div className="detail-row">
                          <label>Dropoff:</label>
                          <input
                            type="text"
                            value={cab.dropoff}
                            placeholder="Dropoff location"
                            onChange={(e) => updateCabDetails(index, 'dropoff', e.target.value)}
                          />
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeCab(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Cab Service Selection */}
              <div className="service-selection">
                <h3>Available Cab Services</h3>
                <div className="selection-list">
                  {cabServices.length === 0 ? (
                    <div className="loading-services">Loading cab services...</div>
                  ) : (
                    cabServices.map(cab => (
                      <div key={cab._id} className="selection-card">
                        <img 
                          src={cab.images?.length > 0 ? getImageUrl(cab.images[0]) : '/images/cab-placeholder.jpg'} 
                          alt={cab.name}
                          onError={(e) => { e.target.src = '/images/cab-placeholder.jpg' }}
                        />
                        <div className="card-content">
                          <h4>{cab.name}</h4>
                          <p className="vehicle-type">
                            <i className="fas fa-car"></i> {cab.vehicleType} - {cab.vehicleModel}
                          </p>
                          {cab.pricePerKm && (
                            <p className="price">${cab.pricePerKm.toFixed(2)}/km</p>
                          )}
                          {cab.location && (
                            <p className="location">
                              <i className="fas fa-map-marker-alt"></i> {formatLocation(cab.location)}
                            </p>
                          )}
                          <button 
                            className="add-btn"
                            onClick={(e) => handleCabSelect(e, cab._id)}
                          >
                            Add to Trip
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 5: Guides */}
          {step === 5 && (
            <div className="step-content">
              <h2>Add Tour Guides to Your Trip</h2>
              <p className="step-description">Select guides to enhance your travel experience.</p>
              
              {/* Selected Guides List */}
              {selectedGuides.length > 0 && (
                <div className="selected-items">
                  <h3>Selected Guides</h3>
                  {selectedGuides.map((guide, index) => (
                    <div key={index} className="selected-item">
                      <div className="item-name">{guide.name}</div>
                      <div className="item-details">
                        <div className="detail-row">
                          <label>Start Date:</label>
                          <input
                            type="date"
                            value={guide.startDate}
                            min={basicDetails.startDate}
                            max={basicDetails.endDate}
                            onChange={(e) => updateGuideDetails(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="detail-row">
                          <label>End Date:</label>
                          <input
                            type="date"
                            value={guide.endDate}
                            min={guide.startDate || basicDetails.startDate}
                            max={basicDetails.endDate}
                            onChange={(e) => updateGuideDetails(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeGuide(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Guide Selection */}
              <div className="service-selection">
                <h3>Available Guides</h3>
                <div className="selection-list">
                  {guides.length === 0 ? (
                    <div className="loading-services">Loading guides...</div>
                  ) : (
                    guides.map(guide => (
                      <div key={guide._id} className="selection-card">
                        <img 
                          src={guide.images?.length > 0 ? getImageUrl(guide.images[0]) : '/images/guide-placeholder.jpg'} 
                          alt={guide.name}
                          onError={(e) => { e.target.src = '/images/guide-placeholder.jpg' }}
                        />
                        <div className="card-content">
                          <h4>{guide.name}</h4>
                          {guide.languages && (
                            <p className="languages">Languages: {guide.languages.join(', ')}</p>
                          )}
                          {guide.pricePerDay && (
                            <p className="price">${guide.pricePerDay.toFixed(2)}/day</p>
                          )}
                          {guide.location && (
                            <p className="location">
                              <i className="fas fa-map-marker-alt"></i> {formatLocation(guide.location)}
                            </p>
                          )}
                          <button 
                            className="add-btn"
                            onClick={(e) => handleGuideSelect(e, guide._id)}
                          >
                            Add to Trip
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 6: Review */}
          {step === 6 && (
            <div className="step-content">
              <h2>Review Your Trip Plan</h2>
              <div className="review-section">
                <h3>Trip Details</h3>
                <div className="review-item">
                  <span className="label">Trip Name:</span>
                  <span className="value">{basicDetails.name}</span>
                </div>
                <div className="review-item">
                  <span className="label">Date Range:</span>
                  <span className="value">
                    {formatDate(basicDetails.startDate)} to {formatDate(basicDetails.endDate)} 
                    ({calculateTripDuration(basicDetails.startDate, basicDetails.endDate)} days)
                  </span>
                </div>
              </div>
              
              {selectedHotels.length > 0 && (
                <div className="review-section">
                  <h3>Hotels ({selectedHotels.length})</h3>
                  {selectedHotels.map((hotel, index) => (
                    <div key={index} className="review-service-item">
                      <span className="service-name">{hotel.name}</span>
                      <span className="service-details">
                        {formatDate(hotel.checkIn)} to {formatDate(hotel.checkOut)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedRestaurants.length > 0 && (
                <div className="review-section">
                  <h3>Restaurants ({selectedRestaurants.length})</h3>
                  {selectedRestaurants.map((restaurant, index) => (
                    <div key={index} className="review-service-item">
                      <span className="service-name">{restaurant.name}</span>
                      <span className="service-details">
                        {formatDate(restaurant.date)} at {formatTime(restaurant.time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedCabs.length > 0 && (
                <div className="review-section">
                  <h3>Transportation ({selectedCabs.length})</h3>
                  {selectedCabs.map((cab, index) => (
                    <div key={index} className="review-service-item">
                      <span className="service-name">{cab.name}</span>
                      <span className="service-details">
                        {formatDate(cab.date)}
                        {cab.pickup && cab.dropoff ? ` - ${cab.pickup} to ${cab.dropoff}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedGuides.length > 0 && (
                <div className="review-section">
                  <h3>Guides ({selectedGuides.length})</h3>
                  {selectedGuides.map((guide, index) => (
                    <div key={index} className="review-service-item">
                      <span className="service-name">{guide.name}</span>
                      <span className="service-details">
                        {formatDate(guide.startDate)} to {formatDate(guide.endDate)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedHotels.length === 0 && selectedRestaurants.length === 0 && 
               selectedCabs.length === 0 && selectedGuides.length === 0 && (
                <div className="empty-plan-notice">
                  <p>You haven't added any services to your trip plan yet.</p>
                  <p>Go back to previous steps to add hotels, restaurants, transportation, or guides.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="form-actions">
            {step > 1 && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handlePrevStep}
              >
                <i className="fas fa-arrow-left"></i> Previous
              </button>
            )}
            
            {step < 6 ? (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleNextStep}
              >
                Next <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="btn-spinner"></div> 
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> 
                    {isEdit ? 'Update Trip Plan' : 'Create Trip Plan'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditTripPlanPage;