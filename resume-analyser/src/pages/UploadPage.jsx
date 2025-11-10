import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css';

const UploadPage = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jdError, setJdError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      setResumeError('Only PDF, DOC, or DOCX files are allowed.');
      setResumeFile(null);
    } else if (file.size > 5 * 1024 * 1024) {
      setResumeError('File size must be less than 5MB.');
      setResumeFile(null);
    } else {
      setResumeError('');
      setResumeFile(file);
    }

  
    if (file) {
      setFileUploaded(true); // mark as uploaded
    } else {
      setFileUploaded(false); // reset if no file
    }
  };

  const [fileUploaded, setFileUploaded] = useState(false);
  const handleContinue = async () => {
    if (!isFormValid) return;

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_description', jobDescription);

    try {
      console.log("Sending request to backend...");
      
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server responded with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Backend Response:", responseData);

      // Navigate to results page with the analysis data
      navigate('/results', {
        state: {
          resumeFile: resumeFile,
          resumeFileName: resumeFile.name,
          jobDescription: jobDescription,
          analysis: responseData,
          atsScore: responseData.ats_score,
          suggestions: responseData.suggestions || [],
          missingKeywords: responseData.missing_keywords || [],
          matchedKeywords: responseData.matched_keywords || []
        }
      });

    } catch (error) {
      console.error("Error in handleContinue:", error);
      alert(`Error: ${error.message}. Please check the console for more details.`);
    }
  };

  const isFormValid = resumeFile && jobDescription && jobDescription.length >= 100;

  return (
    <div className="upload-bg">
      <nav className="upload-navbar">
        <div className="upload-navbar-left">
          <img src="https://img.icons8.com/ios-filled/50/3b6ef6/combo-chart.png" alt="ResumeAI Logo" className="upload-logo" />
          <span className="upload-title">ResumeAI</span>
        </div>
        <span className="free-analysis">Free Analysis</span>
      </nav>
      <div className="upload-steps">
        <div className="step active">
          <span className="step-num">1</span>
          <span className="step-label">Upload Resume</span>
        </div>
        <div className="step-divider"></div>
        <div className="step">
          <span className="step-num">2</span>
          <span className="step-label">AI Analysis</span>
        </div>
        <div className="step-divider"></div>
        <div className="step">
          <span className="step-num">3</span>
          <span className="step-label">Get Results</span>
        </div>
      </div>
      <div className="upload-main">
        {/* --- New changes start here --- */}
        <div className="upload-left">
          <h2 className="upload-heading">Upload Your Resume</h2>
          <p className="upload-subheading">
            Get instant ATS score and detailed feedback to improve your chances
          </p>
          <div className="upload-dropzone">
            {/* <div className="upload-icon-bg">
              <img src="https://img.icons8.com/ios-filled/50/3b6ef6/upload.png" alt="Upload" />
            </div> */}
            <div className="upload-drop-text">
              {/* Drag and drop your resume<br />here
              <br /> */}
              <span className="upload-browse-text">click to browse files</span>
              {/* <br /> */}
              <label htmlFor="resume-upload" className="choose-file-label">
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="resume-input"
                  style={{ display: 'none' }}
                />
                {/* <button type="button" className="choose-file-btn" onClick={() => document.getElementById('resume-upload').click()}>
                  Choose File
                </button> */}
                <button
                  type="button"
                  className={`choose-file-btn ${fileUploaded ? "uploaded" : ""}`}
                  onClick={() => document.getElementById('resume-upload').click()}
                >
                  {fileUploaded ? "File Uploaded ✅" : "Choose File"}
                </button>

              </label>
              {resumeError && <p className="error-text">{resumeError}</p>}
            </div>
            <div className="upload-supported">
              Supported formats: PDF, DOC, DOCX (Max 5MB)
            </div>
          </div>
          
          {/* --- Job Description section starts here --- */}
          <div className="upload-jd-card">
            <div className="jd-title">
              <img src="https://img.icons8.com/ios-filled/32/3b6ef6/document.png" alt="JD" />
              <span>Paste Job Description</span>
            </div>
            <textarea
              className="jd-textarea"
              placeholder="Paste the job description here (minimum 100 characters)..."
              value={jobDescription}
              onChange={e => {
                setJobDescription(e.target.value);
                if (e.target.value.length < 100) {
                  setJdError('Job description must be at least 100 characters.');
                } else {
                  setJdError('');
                }
              }}
              rows={6}
            />
            {jdError && <p className="error-text">{jdError}</p>}
            <div className="jd-hint">
              Why? We use this to tailor your resume analysis for the specific role.
            </div>
          </div>

          {/* <div className="upload-file-req-card">
            <div className="file-req-title">File Requirements</div>
            <ul className="file-req-list">
              <li><span className="file-req-icon">&#10004;</span> PDF, DOC, or DOCX format</li>
              <li><span className="file-req-icon">&#10004;</span> Maximum file size: 5MB</li>
              <li><span className="file-req-icon">&#10004;</span> Text should be selectable (not scanned image)</li>
              <li><span className="file-req-icon">&#10004;</span> English language preferred</li>
            </ul>
          </div> */}
          

        </div>
        <div className="upload-right">
          <div>
            <div className="upload-get-card">
              <div className="upload-get-title">
                <img src="https://img.icons8.com/ios-filled/32/3b6ef6/combo-chart.png" alt="bolt" />
                <span>What You'll Get</span>
              </div>
              <ul className="upload-get-list">
                <li>
                  <span className="get-icon">&#10004;</span>
                  <span>
                    <strong>ATS Compatibility Score</strong>
                    <br />
                    <span className="get-desc">See how well your resume passes through ATS systems</span>
                  </span>
                </li>
                <li>
                  <span className="get-icon">&#10004;</span>
                  <span>
                    <strong>Keyword Analysis</strong>
                    <br />
                    <span className="get-desc">Get suggestions for industry-relevant keywords</span>
                  </span>
                </li>
                <li>
                  <span className="get-icon">&#10004;</span>
                  <span>
                    <strong>Format Optimization</strong>
                    <br />
                    <span className="get-desc">Improve layout and structure for better readability</span>
                  </span>
                </li>
                <li>
                  <span className="get-icon">&#10004;</span>
                  <span>
                    <strong>Content Suggestions</strong>
                    <br />
                    <span className="get-desc">Actionable tips to strengthen your resume content</span>
                  </span>
                </li>
              </ul>
            </div>
            <div className="privacy-card">
              <div className="privacy-title">
                <span className="privacy-icon">!</span> Privacy Notice
              </div>
              <div className="privacy-desc">
                Your resume is processed securely and deleted after analysis. We never store or share your personal information.
              </div>
            </div>
            <div className="popular-card">
              <div className="popular-title">Popular with</div>
              <div className="popular-list">
                <ul>
                  <li>Software Engineers</li>
                  <li>Product Managers</li>
                  <li>Marketing Professionals</li>
                </ul>
                <ul>
                  <li>Data Scientists</li>
                  <li>Business Analysts</li>
                  <li>Fresh Graduates</li>
                </ul>
              </div>
            </div>

            <div className="upload-file-req-card">
            <div className="file-req-title">File Requirements</div>
            <ul className="file-req-list">
              <li><span className="file-req-icon">&#10004;</span> PDF, DOC, or DOCX format</li>
              <li><span className="file-req-icon">&#10004;</span> Maximum file size: 5MB</li>
              <li><span className="file-req-icon">&#10004;</span> Text should be selectable (not scanned image)</li>
              <li><span className="file-req-icon">&#10004;</span> English language preferred</li>
            </ul>
          </div>


          </div>
        </div>
        {/* --- New changes end here --- */}
      </div>
      <div className="upload-continue">
        <button
          className={`continue-btn ${isFormValid ? '' : 'disabled'}`}
          onClick={handleContinue}
          disabled={!isFormValid}
        >
          Continue to Analysis
        </button> 
      </div>
      {/* --- Footer section starts here --- */}
      <footer className="footer">
        {/* <div className="footer-content">
          <div className="footer-brand">
            <img src="https://img.icons8.com/ios-filled/50/ffffff/combo-chart.png" alt="ResumeAI Logo" className="footer-logo" />
            <span className="footer-title">ResumeAI</span>
            <p className="footer-desc">AI-powered resume optimization for Indian job seekers.</p>
          </div>
          <div className="footer-links">
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
          </div>
        </div> */}
        <div className="footer-bottom">
          &copy; 2024 ResumeAI. All rights reserved. Made with <span className="footer-heart">&hearts;</span> for Indian job seekers.
        </div>
      </footer>
      {/* --- Footer section ends here --- */}
    </div>
  );
};

export default UploadPage;