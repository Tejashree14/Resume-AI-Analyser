import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DetailedAnalysisPage.css";

const DetailedAnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (location.state?.analysisData) {
          setAnalysisData(location.state.analysisData);
          setLoading(false);
          // Safely store data in sessionStorage if available
          try {
            sessionStorage.setItem('lastAnalysisData', JSON.stringify(location.state.analysisData));
          } catch (storageError) {
            console.warn('Could not access sessionStorage:', storageError);
            // Continue without sessionStorage
          }
        } else {
          // Try to get data from session storage if navigation state is lost
          try {
            const savedData = sessionStorage.getItem('lastAnalysisData');
            if (savedData) {
              setAnalysisData(JSON.parse(savedData));
              setLoading(false);
            } else {
              setError('No analysis data available. Please go back and try again.');
              setLoading(false);
            }
          } catch (storageError) {
            console.warn('Could not access sessionStorage:', storageError);
            setError('No analysis data available. Please go back and try again.');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading analysis data:', error);
        setError('An error occurred while loading the analysis. Please try again.');
        setLoading(false);
      }
    };

    loadData();
  }, [location]);

  // Extract data from analysis response
  const {
    ats_score = 0,
    matched_keywords = [],
    missing_keywords = [],
    suggestions = []
  } = analysisData || {};

  // Categorize suggestions by section
  const suggestionsBySection = suggestions.reduce((acc, suggestion) => {
    const section = suggestion.section || 'General';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(suggestion);
    return acc;
  }, {});

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'needs-work';
  };

  const handleGoBack = () => {
    if (location.state?.fromResults && location.state.previousState) {
      navigate('/results', {
        state: location.state.previousState,
        replace: true
      });
    } else {
      navigate(-1); // Fallback to default back navigation
    }
  };

  if (loading) {
    return <div className="loading-container">Loading analysis...</div>;
  }

  if (error || !analysisData) {
    return (
      <div className="error-container">
        <p>{error || 'No analysis data available'}</p>
        <button onClick={handleGoBack} className="back-button">Go Back</button>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      <button 
        onClick={handleGoBack} 
        className="back-button"
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>←</span> Back to Results
      </button>
      
      <div className="score-summary">
        <h2>Detailed Resume Analysis</h2>
        <p className="subheading">Comprehensive feedback to help you create an ATS-optimized resume</p>

        <div className="score-metrics">
          <div className="score-box">
            {ats_score}/100<br />
            <span>Overall ATS Score</span>
          </div>
          <div className="score-box green">
            {Math.round(ats_score * 0.9)}%<br />
            <span>Better than peers</span>
          </div>
          <div className="score-box purple">
            +{100 - ats_score}<br />
            <span>Points to improve</span>
          </div>
        </div>
      </div>

      <div className="section-breakdown">
        <h3>Section-by-Section Analysis</h3>

        {Object.entries(suggestionsBySection).map(([section, sectionSuggestions]) => {
          const sectionScore = Math.max(10, 100 - (sectionSuggestions.length * 10));
          const scoreClass = getScoreClass(sectionScore);
          
          return (
            <div className="section-block" key={section}>
              <div className="section-title">
                {section} <span className={`score-tag ${scoreClass}`}>{sectionScore}/100</span>
              </div>
              <ul className="suggestions-box">
                {sectionSuggestions.map((suggestion, idx) => (
                  <li key={`${section}-${idx}`}>{suggestion.description}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="keyword-analysis">
        <h3>Keyword Analysis</h3>

        <div className="keyword-section">
          <strong>Keywords Present ({matched_keywords.length})</strong>
          <div className="keywords-container">
            {matched_keywords.map((kw, idx) => (
              <div key={`match-${idx}`} className="pill green">
                {kw.keyword}
              </div>
            ))}
          </div>
        </div>

        {missing_keywords.length > 0 && (
          <div className="keyword-section">
            <strong>Missing Keywords ({missing_keywords.length})</strong>
            <div className="keywords-container">
              {missing_keywords.map((kw, idx) => (
                <div 
                  key={`missing-${idx}`} 
                  className={`pill red importance-${kw.importance || 'medium'}`}
                >
                  {kw.keyword}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="keyword-section">
          <strong>Recommendations</strong>
          <ul className="suggestions-list">
            {suggestions
              .filter(s => s.type === 'keyword' || s.priority === 'high')
              .slice(0, 5)
              .map((suggestion, idx) => (
                <li key={`rec-${idx}`}>{suggestion.description}</li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalysisPage;