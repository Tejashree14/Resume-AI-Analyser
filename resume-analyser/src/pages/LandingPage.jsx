import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import HowItWorksModal from './HowITWorksPage';
import './LandingPage.css'; // CSS styling

  const LandingPage = () => {
  const navigate = useNavigate();
 
  const [showModal, setShowModal] = useState(false);


  const handleGetStarted = () => {
    navigate('/upload');
  };

  const handleHowItWorks = () => {
    setShowModal(true);
  };

  
  
  return (
     
    <div className="landing-wrapper">
     
      <nav className="navbar">
        <div className="navbar-logo">
          <img src="https://img.icons8.com/ios-filled/50/2d3a4b/combo-chart.png" alt="ResumeAI Logo" className="logo-img" />
          <span>ResumeAI</span>
        </div>
        {/* <div className="navbar-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#reviews">Reviews</a>
          <button className="signin-btn">Sign In</button>
        </div> */}
      </nav>

      {/* Hero Section */}
      <div className="hero-illustration-container">
        {/* Left Side */}
        <section className="hero">
          
          <h1>
            Improve your resume<br />
            with AI. <span className="highlight">Get your ATS score now.</span>
          </h1>
          <p className="hero-desc">
            Beat the ATS systems used by top Indian companies. Get instant feedback, keyword optimization, and formatting suggestions tailored for the Indian job market.
          </p>
          <div className="hero-btns">
            <button className="get-started-btn" onClick={handleGetStarted}>
              Get Started Free <span className="arrow">→</span>
            </button>
            <button className="how-it-works-btn" onClick={handleHowItWorks}>
              How it Works
            </button>
          </div>
          <div className="hero-features">
            <span>✅ Free ATS Score</span>
            <span>✅ Instant Results</span>
            <span>✅ AI Analysis report</span>
          </div>
        </section>

        {/* Right Side */}
        <section className="illustration">
          <div className="score-card">
            <h3>Your ATS Score</h3>
            <div className="score-circle">
              <svg width="100" height="100">
                <circle cx="50" cy="50" r="40" stroke="#e0e3eb" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#3b6ef6" strokeWidth="10" fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset="55"
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div className="score-value">
                <span>78</span>
                <div className="score-label">out of 100</div>
              </div>
            </div>
            <div className="score-details">
              <div className="score-row">
                <span>Keywords Match</span>
                <span className="score-good">Good</span>
              </div>
              <div className="score-row">
                <span>Format Score</span>
                <span className="score-work">Needs Work</span>
              </div>
              <div className="score-row">
                <span>Content Quality</span>
                <span className="score-excellent">Excellent</span>
              </div>
            </div>
            <button className="analyze-btn" onClick={handleGetStarted}>Analyze My Resume</button>
          </div>
        </section>
      </div>
      {/* Why Choose ResumeAI Section*/}
       {/* Why Choose ResumeAI Section */}
      {/* <section className="why-choose-section" ref={howItWorksRef}>
        <h2 className="why-choose-title">Why Choose ResumeAI?</h2>
        <p className="why-choose-subtitle">
          Built specifically for the Indian job market with insights from top recruiters
        </p>
        <div className="why-choose-cards">
          <div className="why-card">
            <div className="why-card-icon" style={{ background: "#eaf1ff" }}>
              <img src="https://img.icons8.com/ios-filled/50/3b6ef6/flash-on.png" alt="ATS Analysis" />
            </div>
            <h3>Instant ATS Analysis</h3>
            <p>
              Get your ATS compatibility score in seconds.<br />
              Know exactly how recruiters' systems will read your resume.
            </p>
          </div>
          <div className="why-card">
            <div className="why-card-icon" style={{ background: "#eafaf1" }}>
              <img src="https://img.icons8.com/ios-filled/50/3bbf6e/conference-call.png" alt="Indian Market" />
            </div>
            <h3>Indian Job Market Focus</h3>
            <p>
              Optimized for Indian companies like TCS, Infosys, Wipro, and startups.<br />
              Understand local hiring preferences.
            </p>
          </div>
          <div className="why-card">
            <div className="why-card-icon" style={{ background: "#f3eafd" }}>
              <img src="https://img.icons8.com/ios-filled/50/b36ef6/shield.png" alt="Privacy" />
            </div>
            <h3>Privacy First</h3>
            <p>
              Your resume data is encrypted and never shared.<br />
              We delete your files after analysis for complete privacy.
            </p>
          </div>
        </div>
      </section>      Call-to-action Banner */}
      {/* <section className="cta-banner">
        <h2 className="cta-title">Ready to Land Your Dream Job?</h2>
        
        <button className="cta-btn" onClick={handleGetStarted}>
          Analyze My Resume Now <span className="arrow">→</span>
        </button>
      </section> */}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            {/* <img src="https://img.icons8.com/ios-filled/50/ffffff/combo-chart.png" alt="ResumeAI Logo" className="footer-logo" />
            <span className="footer-title">ResumeAI</span>
            <p className="footer-desc">AI-powered resume optimization for Indian job seekers.</p> */}
          </div>
          {/* <div className="footer-links">
            <div>
              <h4>Product</h4>
              <ul>
                <li>ATS Score</li>
                <li>Resume Analysis</li>
                <li>Keyword Optimization</li>
                <li>Format Checker</li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Resume Tips</li>
                <li>Job Search Guide</li>
                <li>Career Advice</li>
              </ul>
            </div>
          </div> */}
        </div>
        <div className="footer-bottom">
          © 2025 ResumeAI. All rights reserved. Made with <span className="footer-heart">❤️</span> for Indian job seekers.
        </div>
      </footer>

      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}

    </div>
  );

};

export default LandingPage;
