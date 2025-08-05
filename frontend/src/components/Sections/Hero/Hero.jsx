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
              <span className="department-badge">INN Department</span><br />
              Weekdays-Only<br />
              <span className="highlight">Attendance System</span>
            </h1>
            <p className="hero-subhead">
              Dedicated attendance analysis for <strong>INN Department employees</strong>. 
              Calculates attendance only for <strong>weekdays (Monday-Friday)</strong>. 
              Weekend days are automatically excluded from all calculations.
            </p>
            <div className="hero-buttons">
              <Button 
                variant="primary"
                size="large"
                onClick={onUploadClick}
                loading={loading}
              >
                {loading ? 'Processing INN Department...' : 'Upload INN Department Excel'}
              </Button>
              <Button 
                variant="secondary"
                size="large"
                onClick={onProcessFixedFile}
                disabled={loading}
              >
                Process Existing INN File
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
