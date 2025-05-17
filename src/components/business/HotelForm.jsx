import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Card, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ImageUpload from '../common/ImageUpload';
import { createHotel, updateHotel } from '../../services/hotelService';

const HotelForm = ({ hotel, onSuccess }) => {
  const [serverError, setServerError] = useState('');
  const isEditing = !!hotel;

  const initialValues = {
    name: hotel?.name || '',
    description: hotel?.description || '',
    location: hotel?.location || '',
    pricePerNight: hotel?.pricePerNight || '',
    amenities: hotel?.amenities?.join(', ') || '',
    phone: hotel?.phone || '',
    email: hotel?.email || '',
    website: hotel?.website || '',
    images: []
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    location: Yup.string().required('Location is required'),
    pricePerNight: Yup.number()
      .required('Price is required')
      .positive('Price must be positive'),
    phone: Yup.string().required('Phone number is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setServerError('');
      
      // Convert amenities string to array
      const formData = {
        ...values,
        amenities: values.amenities ? values.amenities.split(',').map(item => item.trim()) : [],
        pricePerNight: Number(values.pricePerNight)
      };
      
      if (isEditing) {
        await updateHotel(hotel._id, formData);
        toast.success('Hotel updated successfully!');
      } else {
        await createHotel(formData);
        resetForm();
        toast.success('Hotel added successfully!');
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Operation failed. Please try again.');
      toast.error('Failed to save hotel');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4 shadow">
      <Card.Body>
        <h2 className="text-center mb-4">{isEditing ? 'Edit Hotel' : 'Add New Hotel'}</h2>
        {serverError && <Alert variant="danger">{serverError}</Alert>}
        
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Hotel Name</label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  className="form-control"
                  rows="4"
                />
                <ErrorMessage name="description" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label htmlFor="location" className="form-label">Location</label>
                <Field
                  type="text"
                  id="location"
                  name="location"
                  className="form-control"
                />
                <ErrorMessage name="location" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label htmlFor="pricePerNight" className="form-label">Price Per Night (LKR)</label>
                <Field
                  type="number"
                  id="pricePerNight"
                  name="pricePerNight"
                  className="form-control"
                />
                <ErrorMessage name="pricePerNight" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label htmlFor="amenities" className="form-label">Amenities (comma-separated)</label>
                <Field
                  type="text"
                  id="amenities"
                  name="amenities"
                  className="form-control"
                  placeholder="WiFi, Pool, Restaurant, etc."
                />
                <ErrorMessage name="amenities" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <Field
                  type="text"
                  id="phone"
                  name="phone"
                  className="form-control"
                />
                <ErrorMessage name="phone" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                />
                <ErrorMessage name="email" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label htmlFor="website" className="form-label">Website (optional)</label>
                <Field
                  type="text"
                  id="website"
                  name="website"
                  className="form-control"
                />
                <ErrorMessage name="website" component="div" className="text-danger" />
              </div>

              <div className="mb-4">
                <label className="form-label">Hotel Images</label>
                <ImageUpload
                  onChange={(files) => setFieldValue('images', files)}
                  multiple={true}
                  maxFiles={5}
                  existingImages={hotel?.images || []}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Hotel' : 'Add Hotel'}
              </Button>
            </Form>
          )}
        </Formik>
      </Card.Body>
    </Card>
  );
};

export default HotelForm;