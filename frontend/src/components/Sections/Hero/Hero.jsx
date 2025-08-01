import Button from '../../UI/Button';
import IllustrationPlaceholder from '../../Common/IllustrationPlaceholder/IllustrationPlaceholder';
import './Hero.css';

/**
 * Hero Section Component
 */
const Hero = ({ 
  onUploadClick, 
  onProcessFixedFile, 
  loading = false 
}) => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-headline">
              Attendance Intelligence<br />
              <span className="highlight">That Works</span>
            </h1>
            <p className="hero-subhead">
              Upload your Excel attendance files and get instant analysis with intelligent issue detection and automated reporting.
            </p>
            <div className="hero-buttons">
              <Button 
                variant="primary"
                size="large"
                onClick={onUploadClick}
                loading={loading}
              >
                {loading ? 'Processing...' : 'Upload Excel File'}
              </Button>
              <Button 
                variant="secondary"
                size="large"
                onClick={onProcessFixedFile}
                disabled={loading}
              >
                Process Fixed File
              </Button>
            </div>
          </div>
          <div className="hero-visual">
            <IllustrationPlaceholder type="hero" className="hero-illustration" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
