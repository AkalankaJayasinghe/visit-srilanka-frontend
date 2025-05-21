import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RestaurantForm from '../components/restaurant/RestaurantForm';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddEditRestaurantPage.css';

const AddEditRestaurantPage = ({ isEdit = false }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isEdit && id) {
      const fetchRestaurant = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/api/restaurants/${id}`);
          
          // Check if the user is the owner
          if (response.data.ownerId !== user.id) {
            toast.error("You don't have permission to edit this restaurant");
            navigate('/restaurants');
            return;
          }
          
          setRestaurant(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching restaurant:', err);
          setError('Failed to load restaurant data. Please try again.');
          setLoading(false);
          toast.error('Error loading restaurant data');
        }
      };
      
      fetchRestaurant();
    }
  }, [isEdit, id, user, API_URL, navigate]);

  const handleRestaurantAdded = (newRestaurant) => {
    toast.success('Restaurant added successfully!');
    navigate(`/restaurants/${newRestaurant._id}`);
  };

  const handleRestaurantUpdated = (updatedRestaurant) => {
    toast.success('Restaurant updated successfully!');
    navigate(`/restaurants/${updatedRestaurant._id}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading restaurant data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/restaurants')} className="btn btn-primary">
          Back to Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="add-edit-restaurant-page">
      <div className="container">
        <h1>{isEdit ? 'Edit Restaurant' : 'Add New Restaurant'}</h1>
        <RestaurantForm 
          editMode={isEdit} 
          restaurantId={id} 
          initialData={restaurant}
          onRestaurantAdded={handleRestaurantAdded}
          onRestaurantUpdated={handleRestaurantUpdated}
        />
      </div>
    </div>
  );
};

export default AddEditRestaurantPage;