import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import { saveAs } from 'file-saver';
import './ResultsPage.css';

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Location state:', location.state);

  // Extract from location.state with fallbacks
  const {
    resumeFile,
    resumeFileName,
    jobDescription,
    analysis = {}, // Main API response
    atsScore = 0,
    suggestions = [],
    missingKeywords = [],
    matchedKeywords = []
  } = location.state || {};

  // Initialize analysis data state
  const [analysisData, setAnalysisData] = useState({
    ...analysis,
    ats_score: atsScore || analysis.ats_score || 0,
    suggestions: suggestions.length ? suggestions : (analysis.suggestions || []),
    missing_keywords: missingKeywords.length ? missingKeywords : (analysis.missing_keywords || []),
    matched_keywords: matchedKeywords.length ? matchedKeywords : (analysis.matched_keywords || [])
  });

  const [setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  // Fix: Always update analysisData if new analysis is passed in state
  useEffect(() => {
    if (location.state?.analysis) {
      setAnalysisData(prev => ({ ...prev, ...location.state.analysis }));
    }
  }, [location.state]);

  const handleViewReport = () => {
    navigate('/detailed-analysis', {
      state: {
        analysisData: analysisData,
        fromResults: true,
        previousState: {
          resumeFile,
          resumeFileName,
          jobDescription,
          analysis: analysisData
        }
      }
    });
  };

  // const handleDownloadEnhancedResume = async () => {
  //   if (!resumeFile || !analysisData) {
  //     console.error('Missing resume file or analysis data');
  //     alert('Missing required data. Please try uploading your resume again.');
  //     return;
  //   }

  //   setIsDownloading(true);

  //   try {
  //     // Call backend enhance-resume endpoint
  //     const enhanceResponse = await axios.post('http://localhost:8000/api/enhance-resume', {
  //       original_resume: analysisData.text || '',
  //       job_description: jobDescription,
  //       missing_keywords: analysisData.missing_keywords || [],
  //       suggestions: analysisData.suggestions || [],
  //       matched_keywords: analysisData.matched_keywords || [],
  //       ats_score: analysisData.ats_score || 0
  //     });

  //     console.log('Enhancement response:', enhanceResponse.data);

  //     const enhancedResume = enhanceResponse.data.enhanced_resume;

  //     // Build DOCX file from enhanced resume text
  //     const doc = new Document({
  //       sections: [{
  //         properties: {},
  //         children: enhancedResume.split('\n').map(line =>
  //           new Paragraph({
  //             children: [new TextRun(line)],
  //             spacing: { after: 100 }
  //           })
  //         )
  //       }]
  //     });

  //     const blob = await Packer.toBlob(doc);
  //     saveAs(blob, 'enhanced_resume.docx');
  //   } catch (error) {
  //     console.error('Error in handleDownloadEnhancedResume:', error);
  //     alert(`Error: ${error.message || 'Failed to enhance resume. Please try again.'}`);
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  // === Score Breakdown ===
  const scoreBreakdown = [
    {
      label: 'Keywords',
      value: Math.round((analysisData.score_breakdown?.keywords || 0) * 100) / 100,
      warning: (analysisData.missing_keywords?.length || 0) > 5,
      description: `Found ${analysisData.matched_keywords?.length || 0} matching keywords`
    },
    {
      label: 'Similarity',
      value: Math.round((analysisData.score_breakdown?.similarity || 0) * 100) / 100,
      warning: (analysisData.score_breakdown?.similarity || 0) < 40,
      description: 'Similarity with job description'
    }
  ];

  // Process missing keywords with proper importance handling
  const processedMissingKeywords = (analysisData.missing_keywords || []).map(keyword => ({
    name: typeof keyword === 'string' ? keyword : (keyword.keyword || 'Unknown'),
    importance: typeof keyword === 'object' && keyword.importance 
      ? (typeof keyword.importance === 'string' ? keyword.importance : 'medium')
      : 'medium',
    present: false,
    add: true
  }));

  // Process matched keywords with proper relevance handling
  const processedMatchedKeywords = (analysisData.matched_keywords || []).map(keyword => ({
    name: typeof keyword === 'string' ? keyword : (keyword.keyword || keyword.name || 'Unknown'),
    importance: 'high', // Matched keywords are always high importance
    present: true,
    add: false
  }));

  const allKeywords = [...processedMissingKeywords, ...processedMatchedKeywords].sort((a, b) => {
    const importanceOrder = { high: 0, medium: 1, low: 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });

  const processedSuggestions = (analysisData.suggestions || []).map((s, idx) => ({
    title: s.title || `Suggestion ${idx + 1}`,
    desc: s.description || 'No description provided',
    priority: s.priority || 'medium',
    section: s.section || 'General'
  }));

  return (
    <div className="results-bg">
      {/* Navbar */}
      <nav className="results-navbar">
        <div className="results-navbar-left">
          <img src="https://img.icons8.com/ios-filled/50/3b6ef6/combo-chart.png" alt="ResumeAI Logo" className="results-logo" />
          <span className="results-title">ResumeAI</span>
        </div>
        {/* <div className="results-navbar-actions">
          <button className="share-btn">
            <span className="share-icon">&#128257;</span> Share Results
          </button>
          <button className="download-btn" onClick={handleDownloadEnhancedResume} disabled={isDownloading}>
            {isDownloading ? 'Enhancing...' : (
              <>
                <span className="download-icon">&#8681;</span> Download Enhanced Resume
              </>
            )}
          </button>
        </div> */}
      </nav>

      {/* Steps Bar */}
      <div className="results-steps-bar">
        <div className="step done">
          <span className="step-num"><span className="step-check">&#10003;</span></span>
          <span className="step-label step-label-green">Upload Resume</span>
        </div>
        <div className="step-divider"></div>
        <div className="step done">
          <span className="step-num"><span className="step-check">&#10003;</span></span>
          <span className="step-label step-label-green">AI Analysis</span>
        </div>
        <div className="step-divider"></div>
        <div className="step done">
          <span className="step-num"><span className="step-check">&#10003;</span></span>
          <span className="step-label step-label-green">Get Results</span>
        </div>
      </div>

      {/* Main ATS Score Section */}
      <div className="results-main-row">
        <div className="results-main-col">
          {/* ATS Score */}
          <div className="ats-score-card">
            <h2>Your ATS Score</h2>
            <p className="ats-desc">Your resume's compatibility with Applicant Tracking Systems</p>
            <div className="ats-score-row">
              <span className="ats-score-big">{analysisData.ats_score}</span>
              <span className="ats-score-max">/ 100</span>
            </div>
            <div className="ats-score-status">
              <span className="ats-status-badge">
                {analysisData.ats_score >= 70 ? 'Good' : analysisData.ats_score >= 40 ? 'Needs Improvement' : 'Needs Major Work'}
              </span>
              {analysisData.ats_score < 100 && (
                <span className="ats-status-points">
                  +{100 - analysisData.ats_score} points possible
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="results-tabs-card">
            <div className="results-tabs">
              <button className={`tab${activeTab === 'Overview' ? ' active' : ''}`} onClick={() => setActiveTab('Overview')}>Overview</button>
              <button className={`tab${activeTab === 'Keywords' ? ' active' : ''}`} onClick={() => setActiveTab('Keywords')}>
                Keywords {processedMissingKeywords.length > 0 && `(${processedMissingKeywords.length} missing)`}
              </button>
              <button className={`tab${activeTab === 'Suggestions' ? ' active' : ''}`} onClick={() => setActiveTab('Suggestions')}>
                Suggestions {processedSuggestions.length > 0 && `(${processedSuggestions.length})`}
              </button>
            </div>

            {activeTab === 'Overview' && (
              <div className="score-breakdown">
                <h3>Score Breakdown</h3>
                {scoreBreakdown.map(item => (
                  <div className="score-row" key={item.label}>
                    <div className="score-label">{item.label}</div>
                    <div className="score-bar-wrap">
                      <div className="score-bar-bg">
                        <div className="score-bar-fill" style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                    <div className="score-status">
                      {item.warning ? (
                        <span className="score-warning" title={item.description}>&#9888;</span>
                      ) : (
                        <span className="score-check" title={item.description}>&#10003;</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Keywords' && (
              <div className="keywords-analysis-tab">
                <h3 className="keywords-title">Keyword Analysis</h3>
                <div className="keywords-desc">Based on 1000+ Software Engineer job postings in India</div>
                <div className="keywords-list">
                  {allKeywords.slice(0, 15).map((kw, idx) => (
                    <div className="keyword-row" key={`${kw.name}-${idx}`}>
                      <span className={`kw-dot ${kw.present ? 'kw-dot-green' : 'kw-dot-red'}`}></span>
                      <span className="kw-name">{kw.name}</span>
                      <span className={`kw-badge kw-badge-${kw.importance}`}>
                        {kw.importance.charAt(0).toUpperCase() + kw.importance.slice(1)} priority
                      </span>
                      {kw.add && <span className="kw-add-btn">Add to resume</span>}
                    </div>
                  ))}
                  {allKeywords.length > 15 && (
                    <div className="show-more-keywords">
                      + {allKeywords.length - 15} more keywords...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* {activeTab === 'Suggestions' && (
              <div className="suggestions-tab">
                <h3>Suggestions</h3>
                <div className="suggestions-list">
                  {processedSuggestions.map((s, idx) => (
                    <div className="suggestion-row" key={idx}>
                      <span className="suggestion-title">{s.title}</span>
                      <div className="suggestion-desc">{s.desc}</div>
                      <div className="suggestion-priority">
                        Priority: {s.priority.charAt(0).toUpperCase() + s.priority.slice(1)}
                      </div>
                      <div className="suggestion-section">
                        Section: {s.section.charAt(0).toUpperCase() + s.section.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
            {activeTab === 'Suggestions' && (
            <div className="suggestions-tab">
              <h3 className="suggestions-heading">Suggestions</h3>
              <div className="suggestions-grid">
                {processedSuggestions.map((s, idx) => (
                  <div
                    className={`suggestion-card priority-${s.priority.toLowerCase()}`}
                    key={idx}
                  >
                    <h4 className="suggestion-title">{s.title}</h4>
                    <p className="suggestion-desc">{s.desc}</p>
                    <div className="suggestion-meta">
                      <span className={`priority-badge ${s.priority.toLowerCase()}`}>
                        Priority: {s.priority.charAt(0).toUpperCase() + s.priority.slice(1)}
                      </span>
                      <span className="section-badge">
                        Section: {s.section.charAt(0).toUpperCase() + s.section.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                {processedSuggestions.length === 0 && (
                  <p className="no-suggestions-text">No suggestions found 🎉</p>
                )}
              </div>
            </div>
          )}

          </div>
        </div>

        {/* Right Side */}
        <div className="results-side-col">
          <div className="quick-actions-card">
            <h3 className="quick-title">Quick Actions</h3>
            {/* <button className="quick-btn" onClick={handleDownloadEnhancedResume} disabled={isDownloading}>
              {isDownloading ? 'Enhancing...' : 'Download Improved Resume'}
            </button> */}
            <button className="quick-btn" onClick={handleViewReport}>View Detailed Report</button>
            {/* <button className="quick-btn">Share with Friends</button> */}
          </div>

          <div className="benchmark-card">
            <h3>
              <span className="benchmark-icon">&#8599;</span> Industry Benchmark
            </h3>
            <div className="benchmark-row"><span>Your Score</span><span className="benchmark-score">{analysisData.ats_score}%</span></div>
            <div className="benchmark-row"><span>Average Score</span><span className="benchmark-score">65%</span></div>
            <div className="benchmark-row"><span>Top 10%</span><span className="benchmark-score top">90%+</span></div>
          </div>
        </div>
      </div>

      {/* Confidence Banner */}
      <div className="confidence-banner">
        <h2>Ready to Apply with Confidence?</h2>
        <p>Your resume is now optimized for ATS systems. Start applying to your dream companies!</p>
        <div className="confidence-btn-row">
          {/* <button className="download-optimized-btn" onClick={handleDownloadEnhancedResume} disabled={isDownloading}>
            {isDownloading ? 'Enhancing...' : (
              <>
                <span className="download-icon">&#8681;</span> Download Optimized Resume
              </>
            )}
          </button> */}
          <button className="view-analysis-btn" onClick={handleViewReport}>
            View Detailed Analysis &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
