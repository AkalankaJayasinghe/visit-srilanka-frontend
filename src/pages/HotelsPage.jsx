import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HotelList from '../components/tourist/HotelList';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import { getAllHotels } from '../services/hotelService';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    name: '',
    location: '',
    priceMin: '',
    priceMax: '',
  });

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const data = await getAllHotels();
        setHotels(data);
        setFilteredHotels(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleSearch = (params) => {
    setSearchParams(params);
    let filtered = [...hotels];

    if (params.name) {
      filtered = filtered.filter(hotel => 
        hotel.name.toLowerCase().includes(params.name.toLowerCase())
      );
    }

    if (params.location) {
      filtered = filtered.filter(hotel => 
        hotel.location.toLowerCase().includes(params.location.toLowerCase())
      );
    }

    if (params.priceMin) {
      filtered = filtered.filter(hotel => hotel.pricePerNight >= params.priceMin);
    }

    if (params.priceMax) {
      filtered = filtered.filter(hotel => hotel.pricePerNight <= params.priceMax);
    }

    setFilteredHotels(filtered);
  };

  return (
    <>
      <Header />
      <Container className="py-5">
        <h1 className="mb-4">Find the Perfect Hotel in Sri Lanka</h1>
        
        <SearchBar 
          onSearch={handleSearch}
          fields={[
            { name: 'name', label: 'Hotel Name', type: 'text' },
            { name: 'location', label: 'Location', type: 'text' },
            { name: 'priceMin', label: 'Min Price', type: 'number' },
            { name: 'priceMax', label: 'Max Price', type: 'number' },
          ]}
        />
        
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <Row className="mt-4">
            <Col>
              <HotelList hotels={filteredHotels} />
            </Col>
          </Row>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default HotelsPage;