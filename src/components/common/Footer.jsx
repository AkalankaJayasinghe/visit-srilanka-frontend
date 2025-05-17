import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Visit Sri Lanka</h5>
            <p>Discover the beauty of Sri Lanka with our comprehensive travel platform.</p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-white">Home</Link></li>
              <li><Link to="/hotels" className="text-white">Hotels</Link></li>
              <li><Link to="/restaurants" className="text-white">Restaurants</Link></li>
              <li><Link to="/cabs" className="text-white">Cabs</Link></li>
              <li><Link to="/guides" className="text-white">Guides</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <address>
              <p>Email: info@visitsrilanka.com</p>
              <p>Phone: +94 123 456 789</p>
              <p>Address: Colombo, Sri Lanka</p>
            </address>
          </Col>
        </Row>
        <hr />
        <p className="text-center mb-0">© {new Date().getFullYear()} Visit Sri Lanka. All rights reserved.</p>
      </Container>
    </footer>
  );
};

export default Footer;