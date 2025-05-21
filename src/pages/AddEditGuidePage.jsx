import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GuideForm from '../components/guide/GuideForm';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddEditGuidePage.css';

const AddEditGuidePage = ({ isEdit = false }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isEdit && id) {
      const fetchGuide = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/api/guides/${id}`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          
          // Check if the user is the owner
          if (response.data.ownerId !== user?.id) {
            toast.error("You don't have permission to edit this guide profile");
            navigate('/guides');
            return;
          }
          
          setGuide(response.data);
        } catch (err) {
          console.error('Error fetching guide:', err);
          setError('Failed to load guide data. Please try again.');
          toast.error('Error loading guide data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchGuide();
    }
  }, [isEdit, id, user, API_URL, navigate]);

  const handleGuideAdded = (newGuide) => {
    toast.success('Guide profile added successfully!');
    navigate(`/guides/${newGuide._id}`);
  };

  const handleGuideUpdated = (updatedGuide) => {
    toast.success('Guide profile updated successfully!');
    navigate(`/guides/${updatedGuide._id}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading guide data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/guides')} className="btn btn-primary">
          Back to Guides
        </button>
      </div>
    );
  }

  // Check if user is authorized to add/edit guide profile
  if (!user || user.role !== 'guide') {
    return (
      <div className="error-container">
        <p>You must be logged in as a guide to manage guide profiles.</p>
        <button onClick={() => navigate('/guides')} className="btn btn-primary">
          Back to Guides
        </button>
      </div>
    );
  }

  return (
    <div className="add-edit-guide-page">
      <div className="container">
        <h1>{isEdit ? 'Edit Guide Profile' : 'Create Guide Profile'}</h1>
        <GuideForm 
          editMode={isEdit} 
          guideId={id} 
          initialData={guide}
          onGuideAdded={handleGuideAdded}
          onGuideUpdated={handleGuideUpdated}
        />
      </div>
    </div>
  );
};

export default AddEditGuidePage;