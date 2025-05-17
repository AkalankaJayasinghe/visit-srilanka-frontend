// src/components/common/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
        
        {user ? (
          <>
            {user.role === 'tourist' && (
              <Link to="/trip-plans" className="navbar-item">My Trip Plan</Link>
            )}
            
            {['hotel_owner', 'restaurant_owner', 'cab_driver', 'guide'].includes(user.role) && (
              <Link to="/manage-business" className="navbar-item">Manage My Business</Link>
            )}
            
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