import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ProcessingPage.css';

const steps = [
  { label: 'Parsing Resume', key: 'parsing' },
  { label: 'Keyword Analysis', key: 'keywords' },
  { label: 'ATS Compatibility', key: 'ats' },
  { label: 'Generating Report', key: 'report' }
];

const ProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resumeFile, jobDescription } = location.state || {};

  // --- New changes start here ---
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 86) return prev + 2;
        return 86;
      });
      setActiveStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 400);

    const timer = setTimeout(() => {
      setProgress(100);
      navigate('/results', {
        state: { resumeFile, jobDescription }
      });
    }, 40000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate, resumeFile, jobDescription]);

  // --- New changes end here ---

  return (
    <div className="processing-bg">
      <nav className="processing-navbar">
        <div className="processing-navbar-left">
          <img src="https://img.icons8.com/ios-filled/50/3b6ef6/combo-chart.png" alt="ResumeAI Logo" className="processing-logo" />
          <span className="processing-title">ResumeAI</span>
        </div>
        <span className="processing-status">Analyzing...</span>
      </nav>
      <div className="processing-steps-bar">
        <div className={`step active`}>
          <span className="step-num"><span className="step-check">&#10003;</span></span>
          <span className="step-label step-label-green">Upload Resume</span>
        </div>
        <div className="step-divider"></div>
        <div className={`step ${progress > 0 ? 'active' : ''}`}>
          <span className="step-num">2</span>
          <span className="step-label step-label-blue">AI Analysis</span>
        </div>
        <div className="step-divider"></div>
        <div className="step">
          <span className="step-num">3</span>
          <span className="step-label">Get Results</span>
        </div>
      </div>
      <div className="processing-center-card">
        <div className="processing-card-header">
          <img src="https://img.icons8.com/ios-filled/80/3b6ef6/combo-chart.png" alt="processing" className="processing-main-icon" />
        </div>
        <h2 className="processing-main-title">Analyzing Your Resume</h2>
        <p className="processing-main-desc">
          Our AI is examining your resume against 1000+ job requirements
        </p>
        <div className="processing-progress-labels">
          <span className="progress-label">Analysis Progress</span>
          <span className="progress-percent">{progress}%</span>
        </div>
        <div className="processing-progress-bar">
          <div className="processing-progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="processing-feature-card">
          <div className="processing-feature-icon">
            <img src="https://img.icons8.com/ios-filled/40/3b6ef6/combo-chart.png" alt="ATS" />
          </div>
          <div>
            <div className="processing-feature-title">ATS Compatibility</div>
            <div className="processing-feature-desc">Testing against major ATS systems</div>
          </div>
        </div>
        <div className="processing-steps-list">
          {steps.map((step, idx) => (
            <div
              key={step.key}
              className={`processing-step-item ${idx <= activeStep ? 'done' : ''} ${idx === activeStep ? 'active' : ''}`}
            >
              <span className={`step-status-icon ${idx <= activeStep ? 'step-done' : ''}`}>
                {idx < activeStep ? <span>&#10003;</span> : idx === activeStep ? <span className="loader-dot"></span> : null}
              </span>
              <span className={`step-label-text ${idx <= activeStep ? 'step-label-done' : ''}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;