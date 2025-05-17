// src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import heroBackgroundImage from '../assets/images/hero.jpg';


const LandingPage = () => {

    const heroStyle = {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white'
    };

    return (
        <div className="landing-page">
            <section className="hero">
                <div className="hero-content">
                    <h1>Discover the Beauty of Sri Lanka</h1>
                    <p>Plan your perfect trip with our comprehensive platform</p>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-primary">Get Started</Link>
                        <Link to="/login" className="btn btn-secondary">Login</Link>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2>Why Choose Our Platform?</h2>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <i className="icon-hotel"></i>
                            <h3>Best Hotels</h3>
                            <p>Find accommodations that match your preferences and budget</p>
                        </div>
                        <div className="feature-card">
                            <i className="icon-food"></i>
                            <h3>Local Cuisine</h3>
                            <p>Discover authentic Sri Lankan food and international restaurants</p>
                        </div>
                        <div className="feature-card">
                            <i className="icon-transport"></i>
                            <h3>Reliable Transport</h3>
                            <p>Get around easily with our trusted cab services</p>
                        </div>
                        <div className="feature-card">
                            <i className="icon-guide"></i>
                            <h3>Expert Guides</h3>
                            <p>Explore with knowledgeable local guides who enhance your experience</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="destinations">
                <div className="container">
                    <h2>Popular Destinations</h2>
                    <div className="destinations-grid">
                        <div className="destination-card">
                            <img src="/images/colombo.jpg" alt="Colombo" />
                            <h3>Colombo</h3>
                            <p>The vibrant capital city</p>
                        </div>
                        <div className="destination-card">
                            <img src="/images/kandy.jpg" alt="Kandy" />
                            <h3>Kandy</h3>
                            <p>Cultural heart of Sri Lanka</p>
                        </div>
                        <div className="destination-card">
                            <img src="/images/galle.jpg" alt="Galle" />
                            <h3>Galle</h3>
                            <p>Historic fort city</p>
                        </div>
                        <div className="destination-card">
                            <img src="/images/ella.jpg" alt="Ella" />
                            <h3>Ella</h3>
                            <p>Picturesque hill country</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;