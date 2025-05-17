import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="hero-section py-5" style={{ 
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/sri-lanka-hero.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      color: 'white'
    }}>
      <Container>
        <Row className="justify-content-center text-center">
          <Col md={8}>
            <h1 className="display-3 fw-bold mb-4">Discover the Beauty of Sri Lanka</h1>
            <p className="lead mb-5">
              Experience the rich culture, stunning landscapes, and warm hospitality of the pearl of the Indian Ocean.
              Plan your perfect trip with our comprehensive travel platform.
            </p>
            <div className="d-grid gap-2 d-md-flex justify-content-md-center">
              <Button as={Link} to="/hotels" variant="primary" size="lg" className="me-md-2">Find Hotels</Button>
              <Button as={Link} to="/trip-plan" variant="outline-light" size="lg">Plan Your Trip</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Hero;