import React from "react";
import "./HowItWorksModal.css";

const HowItWorksModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>How It Works</h2>
        <p>
          1️⃣ Upload your resume (PDF/DOCX format).<br />
          2️⃣ Our AI analyzes your resume and matches it against ATS standards.<br />
          3️⃣ You get an instant ATS score, feedback, and improvement tips.<br />
          4️⃣ Optimize your resume to increase your interview chances.
        </p>
      </div>
    </div>
  );
};

export default HowItWorksModal;
