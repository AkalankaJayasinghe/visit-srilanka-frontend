import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CabForm from '../components/cab/CabForm';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddEditCabPage.css';

const AddEditCabPage = ({ isEdit = false }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cabService, setCabService] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isEdit && id) {
      const fetchCabService = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/api/cabs/${id}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          
          // Check if the user is the owner
          if (response.data.ownerId !== user?.id) {
            toast.error("You don't have permission to edit this cab service");
            navigate('/cabs');
            return;
          }
          
          setCabService(response.data);
        } catch (err) {
          console.error('Error fetching cab service:', err);
          setError('Failed to load cab service data. Please try again.');
          toast.error('Error loading cab service data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCabService();
    }
  }, [isEdit, id, user, API_URL, navigate]);

  const handleCabServiceAdded = (newCabService) => {
    toast.success('Cab service added successfully!');
    navigate(`/cabs/${newCabService._id}`);
  };

  const handleCabServiceUpdated = (updatedCabService) => {
    toast.success('Cab service updated successfully!');
    navigate(`/cabs/${updatedCabService._id}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading cab service data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/cabs')} className="btn btn-primary">
          Back to Cab Services
        </button>
      </div>
    );
  }

  // Check if user is authorized to add/edit cab service
  if (!user || user.role !== 'cab_driver') {
    return (
      <div className="error-container">
        <p>You must be logged in as a cab driver to manage cab services.</p>
        <button onClick={() => navigate('/cabs')} className="btn btn-primary">
          Back to Cab Services
        </button>
      </div>
    );
  }

  return (
    <div className="add-edit-cab-page">
      <div className="container">
        <h1>{isEdit ? 'Edit Cab Service' : 'Add New Cab Service'}</h1>
        <CabForm 
          editMode={isEdit} 
          cabServiceId={id} 
          initialData={cabService}
          onCabServiceAdded={handleCabServiceAdded}
          onCabServiceUpdated={handleCabServiceUpdated}
        />
      </div>
    </div>
  );
};

export default AddEditCabPage;