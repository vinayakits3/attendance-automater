
import { useState, useEffect } from 'react'
import './App.css'

// Import modular components
import Hero from './components/Sections/Hero'
import Upload from './components/Sections/Upload'
import Results from './components/Sections/Results'
import Button from './components/UI/Button'
import IllustrationPlaceholder from './components/Common/IllustrationPlaceholder'

// Import services and hooks
import ApiService from './services/api'
import { useFileUpload } from './hooks/useFileUpload'

function App() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [config, setConfig] = useState(null);

  // Use the file upload hook for file handling
  const {
    loading,
    error,
    dragActive,
    uploadFile,
    processFixedFile,
    handleDrag,
    handleDrop,
    handleFileInput,
    reset: resetFileUpload
  } = useFileUpload();

  // Load configuration on component mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await ApiService.getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('file-input').click();
  };

  const handleFileUpload = async (file) => {
    try {
      const result = await uploadFile(file);
      if (result.success) {
        setAttendanceData(result.data);
        setSummary(result.data.summary);
        setShowResults(true);
      }
    } catch (err) {
      // Error is already handled by the hook
      console.error('Upload failed:', err);
    }
  };

  const handleProcessFixedFile = async () => {
    try {
      const result = await processFixedFile();
      if (result.success) {
        setAttendanceData(result.data);
        setSummary(result.data.summary);
        setShowResults(true);
      }
    } catch (err) {
      // Error is already handled by the hook
      console.error('Processing failed:', err);
    }
  };

  const handleFileInputChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleDropFile = async (e) => {
    try {
      const result = await handleDrop(e);
      if (result && result.success) {
        setAttendanceData(result.data);
        setSummary(result.data.summary);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Drop failed:', err);
    }
  };

  const resetApp = () => {
    setShowResults(false);
    setAttendanceData(null);
    setSummary(null);
    resetFileUpload();
  };

  // Show results view
  if (showResults) {
    return (
      <div className="app results-view">
        <Results
          summary={summary}
          issues={attendanceData?.issues || []}
          detailedAnalysis={attendanceData?.detailedAnalysis || null}
          onBackClick={resetApp}
        />
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>
    );
  }

  // Show landing page
  return (
    <div className="app landing-page">
      {/* Hidden file input */}
      <input
        id="file-input"
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Hero Section */}
      <Hero
        onUploadClick={handleUploadClick}
        onProcessFixedFile={handleProcessFixedFile}
        loading={loading}
      />

      {/* Upload Section */}
      <Upload
        dragActive={dragActive}
        loading={loading}
        error={error}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDropFile}
      />

      {/* Trusted Partners */}
      <section className="partners-section">
        <div className="container">
          <p className="partners-label">Trusted by organizations worldwide</p>
          <div className="partners-grid">
            <IllustrationPlaceholder type="partners" />
          </div>
        </div>
      </section>

      {/* System Overview */}
      <section className="intro-section">
        <div className="container">
          <div className="intro-content">
            <div className="intro-text">
              <h2>Intelligent Attendance<br />Processing System</h2>
              <p>
                Our advanced system analyzes your Excel attendance files using sophisticated algorithms 
                to detect issues, generate insights, and create actionable reports automatically.
              </p>
            </div>
            <div className="intro-visual">
              <IllustrationPlaceholder type="system" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Block */}
      <section className="features-section">
        <div className="container">
          <div className="features-content">
            <div className="features-visual">
              <IllustrationPlaceholder type="workflow" />
            </div>
            <div className="features-text">
              <h2>Automated for Excellence</h2>
              <p className="features-subtitle">
                Custom algorithms optimized for attendance pattern recognition and issue detection
              </p>
              <ul className="features-list">
                <li>✓ Four-punch system validation</li>
                <li>✓ Late arrival and early departure detection</li>
                <li>✓ Missing punch identification</li>
                <li>✓ Department-specific analysis</li>
                <li>✓ Severity-based issue classification</li>
              </ul>
              <Button 
                variant="primary"
                onClick={handleUploadClick}
                disabled={loading}
              >
                Start Analysis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison-section">
        <div className="container">
          <h2>Why Choose Our System</h2>
          <div className="comparison-grid">
            <div className="comparison-item">
              <h3>Speed</h3>
              <div className="metric">⚡ Instant</div>
              <p>Process thousands of records in seconds</p>
            </div>
            <div className="comparison-item">
              <h3>Accuracy</h3>
              <div className="metric">🎯 99.9%</div>
              <p>Precise issue detection and classification</p>
            </div>
            <div className="comparison-item">
              <h3>Control</h3>
              <div className="metric">🔧 Full</div>
              <p>Complete visibility into attendance patterns</p>
            </div>
            <div className="comparison-item">
              <h3>Integration</h3>
              <div className="metric">🔗 Easy</div>
              <p>Works with your existing Excel workflows</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <div className="logo">
                <span className="logo-icon">📊</span>
                <span className="logo-text">AttendanceAI</span>
              </div>
            </div>
            <div className="footer-right">
              <nav className="footer-nav">
                <a href="#about">About</a>
                <a href="#features">Features</a>
                <a href="#support">Support</a>
                <a href="#contact">Contact</a>
              </nav>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 AttendanceAI. Intelligent attendance processing system.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App