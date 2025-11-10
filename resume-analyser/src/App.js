import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ResultsPage from './pages/ResultsPage';
import DetailedAnalysisPage from './pages/DetailedAnalysisPage';


function App() {
  



  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/processing" element={<ProcessingPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/detailed-analysis" element={<DetailedAnalysisPage />} state={{ fromResults: true }} />
      </Routes>
    </Router>
  );
}

export default App;