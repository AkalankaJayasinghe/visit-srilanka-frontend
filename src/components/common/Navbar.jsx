import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is available in auth context
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Function to check if user has a specific role - handles different cases
  const hasRole = (roleName) => {
    if (!user || !user.role) return false;
    
    // Handle case where role is a string
    if (typeof user.role === 'string') {
      return user.role.toLowerCase() === roleName.toLowerCase();
    }
    
    // Handle case where role is an ID or number
    if (typeof user.role === 'number') {
      // Map role IDs to names if needed
      return false; // Update this based on your role ID mapping
    }
    
    return false;
  };

  // Function to check if user is a tourist
  const isTourist = () => {
    if (!user) return false;
    
    // Check direct role property
    if (user.role && typeof user.role === 'string' && user.role.toLowerCase() === 'tourist') {
      return true;
    }
    
    return false;
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Sri Lanka Tourism</Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">Home</Link>
        <Link to="/hotels" className="navbar-item">Hotels</Link>
        <Link to="/restaurants" className="navbar-item">Restaurants</Link>
        <Link to="/cabs" className="navbar-item">Cab Services</Link>
        <Link to="/guides" className="navbar-item">Guides</Link>
        
        {isAuthenticated ? (
          <>
            {/* Check if user is a tourist using multiple methods */}
            {(isTourist() || hasRole('tourist')) && (
              <Link to="/trip-plans" className="navbar-item" style={{
                fontWeight: 'bold',
                color: '#3182ce',
                background: 'rgba(66, 153, 225, 0.1)',
                borderRadius: '4px',
                padding: '0 12px'
              }}>
                My Trip Plans ✈️
              </Link>
            )}
            
            {user && ['hotel_owner', 'restaurant_owner', 'cab_driver', 'guide'].some(role => hasRole(role)) && (
              <Link to="/manage-business" className="navbar-item">Manage My Business</Link>
            )}
            
            <span className="user-greeting">
              Hello, {user?.name || user?.username || 'User'}
            </span>
            
            <button onClick={handleLogout} className="navbar-item btn-link">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-item">Login</Link>
            <Link to="/register" className="navbar-item btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;