import React, { useEffect } from 'react';
// Assuming you have imported your custom CSS
import './styles.css'; 
// NOTE: For a real React app, you should install AOS and Jarallax via npm:
// npm install aos jarallax
// and import them here if you remove the CDN links.

const Home = () => {
    
    // --- External Library Initialization ---
    useEffect(() => {
        
        // 1. Initialize Jarallax
        // We ensure the Jarallax script is loaded before calling jarallax()
        if (window.jarallax) {
            window.jarallax(document.querySelectorAll('.jarallax'), {
                speed: 0.2 // Adjust this value (0 to 1) to control the movement speed
            });
        }
        
        // 2. Initialize AOS (Animate On Scroll)
        // We ensure the AOS script is loaded before calling AOS.init()
        if (window.AOS) {
            window.AOS.init({
                once: false, // Only animate once
                duration: 1000 // Animation duration in milliseconds
            });
        }
        
        // Clean-up function (optional but good practice for external libraries)
        return () => {
            // Add clean-up code here if necessary, though not strictly required for these libraries
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <>
            {/* HEADERS and CDNs for AOS and Jarallax are usually placed in the root HTML file (index.html) */}
            
            {/* NAV */}
            <header className="main-header fixed-header">
                <div className="container">
                    <div className="logo">Life Link</div>
                    <nav className="main-nav">
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#about">About</a></li>
                            <li><a href="#services">Services</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            {/* HERO */}
            <main id="home" className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="headline">Connecting Lives, Changing Futures</h1>
                    <div className="underline"></div>
                    <p className="subheadline">A place where donors and recipients meet and make a difference</p>
                    <div className="hero-buttons">
                    <a href="/register" className="btn-primary">Register</a>
                    <a href="/login" className="btn-secondary">Login</a>
                    </div>
                </div>
            </main>

            {/* ABOUT US SECTION */}
            <section id="about" className="about-section" data-aos="fade-up" data-aos-duration="1000">
                <div className="container">
                    <div className="about-image-wrapper">
                        {/* CRITICAL CHANGE: Replaced absolute path with relative path. 
                          UPDATE THIS PATH to point to your image. 
                        */}
                        <img 
                            src="images/hand.png" 
                            alt="Hand in glove picking up test tubes" 
                            className="about-image"
                        />
                    </div>
                    <div className="about-content">
                        <h2 className="section-title">About Us</h2>
                        <div className="underline red-line"></div>
                        <p>
                            We are dedicated to creating a platform where donors and recipients can connect with ease and transparency. Our mission is to facilitate meaningful connections that lead to impactful assistance and shared compassion. We believe that through this website, individuals everywhere can come together to bring hope and support where it’s most needed.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA / JARALLAX SECTION */}
            <section className="call-to-action-section" data-aos="fade-up" data-aos-duration="1000">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Empower Generosity</h2>
                        <div className="underline red-line"></div>
                        <p className="cta-subtext">
                            Making connections that foster hope and impact lives
                        </p>
                    </div>
                    {/* CRITICAL CHANGE: Added 'jarallax' class for the JS to target 
                      CRITICAL CHANGE: Replaced absolute path with relative path for data-jarallax-img
                      UPDATE THIS PATH to point to your image. 
                    */}
                    
                    <div className="cta-image-wrapper">
                    <img src="/images/empower.png" alt="Empower Generosity" className="cta-image" />
                    </div>
                    </div>
            </section>

            {/* SERVICES SECTION */}
            <section id="services" className="services-section" data-aos="fade-up" data-aos-duration="1000">
                <div className="container">
                    <h2 className="services-title">SERVICES</h2>
                    <div className="underline red-line centered"></div>

                    <div className="services-grid">
                        
                        <div className="service-item" data-aos="fade-up" data-aos-delay="100">
                            {/* CRITICAL CHANGE: Replaced absolute path with relative path */}
                            <img 
                                src="images/donation.png" 
                                alt="Typewriter with Donations text" 
                                className="service-icon"
                            />
                            <h3>Donor Matching</h3>
                            <p>Easily find matches who need your help, enabling you to make a tangible difference.</p>
                        </div>
                        
                        <div className="service-item" data-aos="fade-up" data-aos-delay="200">
                            {/* CRITICAL CHANGE: Replaced absolute path with relative path */}
                            <img 
                                src="images/recipient.png" 
                                alt="Support machine" 
                                className="service-icon"
                            />
                            <h3>Recipient Support Platform</h3>
                            <p>Present your needs with clarity to attract sympathizers willing to support.</p>
                        </div>
                        
                        <div className="service-item" data-aos="fade-up" data-aos-delay="300">
                            {/* Keeping original relative path for this image */}
                            <img 
                                src="images/secure.jpg" 
                                alt="Secure VPN communication" 
                                className="service-icon"
                            />
                            <h3>Secure Communication</h3>
                            <p>Engage privately and securely to ensure clarity and confidence for all parties.</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="main-footer">
                <div className="container">
                    <p className="copyright">Life Link<br/>Copyright &copy; 2025 All rights reserved</p>
                    <nav className="footer-nav">
                        <a href="#home">HOME</a>
                        <a href="#about">ABOUT</a>
                        <a href="#services">SERVICES</a>
                    </nav>
                </div>
            </footer>
        </>
    );
}

export default Home;