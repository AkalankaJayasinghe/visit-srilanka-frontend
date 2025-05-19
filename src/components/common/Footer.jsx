import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const styles = {
    footer: {
      backgroundColor: '#2c3e50',
      color: '#ecf0f1',
      paddingTop: '3rem',
      marginTop: 'auto',
    },
    footerContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      paddingBottom: '3rem',
      width: '90%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 15px',
    },
    heading: {
      fontSize: '1.5rem',
      marginBottom: '1rem',
      color: '#fff',
    },
    subheading: {
      fontSize: '1.2rem',
      marginBottom: '1rem',
      color: '#fff',
    },
    paragraph: {
      marginBottom: '1rem',
      lineHeight: '1.7',
      color: '#ecf0f1',
    },
    linksList: {
      listStyle: 'none',
      padding: 0,
    },
    listItem: {
      marginBottom: '0.5rem',
    },
    link: {
      color: '#ecf0f1',
      textDecoration: 'none',
    },
    footerBottom: {
      backgroundColor: '#1a252f',
      padding: '1.5rem 0',
      textAlign: 'center',
    },
    copyright: {
      margin: 0,
      fontSize: '0.9rem',
      color: '#ecf0f1',
    }
  };
  
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div>
          <h3 style={styles.heading}>Sri Lanka Tourism</h3>
          <p style={styles.paragraph}>Discover the beauty of Sri Lanka, from pristine beaches to ancient temples, vibrant culture to diverse wildlife.</p>
        </div>
        
        <div>
          <h4 style={styles.subheading}>Quick Links</h4>
          <ul style={styles.linksList}>
            <li style={styles.listItem}><Link to="/" style={styles.link}>Home</Link></li>
            <li style={styles.listItem}><Link to="/hotels" style={styles.link}>Hotels</Link></li>
            <li style={styles.listItem}><Link to="/restaurants" style={styles.link}>Restaurants</Link></li>
            <li style={styles.listItem}><Link to="/cabs" style={styles.link}>Cab Services</Link></li>
            <li style={styles.listItem}><Link to="/guides" style={styles.link}>Tour Guides</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 style={styles.subheading}>Contact Us</h4>
          <p style={styles.paragraph}>Email: info@srilankatourism.com</p>
          <p style={styles.paragraph}>Phone: +94 123 456 789</p>
        </div>
      </div>
      
      <div style={styles.footerBottom}>
        <div style={{...styles.footerContent, paddingBottom: 0}}>
          <p style={styles.copyright}>&copy; {currentYear} Sri Lanka Tourism. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;