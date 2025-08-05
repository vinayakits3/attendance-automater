import Loading from '../../UI/Loading';
import IllustrationPlaceholder from '../../Common/IllustrationPlaceholder/IllustrationPlaceholder';
import './Upload.css';

/**
 * Upload Section Component
 */
const Upload = ({ 
  dragActive = false,
  loading = false,
  error = null,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onUploadClick,
  message = null
}) => {
  const handleClick = () => {
    if (!loading && onUploadClick) {
      onUploadClick();
    }
  };

  return (
    <section className="upload-section">
      <div className="container">
        <div 
          className={`drop-zone ${dragActive ? 'active' : ''} ${loading ? 'loading' : ''} ${!loading ? 'clickable' : ''}`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
        >
          <div className="drop-content">
            {loading ? (
              <Loading 
                size="large" 
                message="Processing INN Department attendance (weekdays only)..." 
              />
            ) : (
              <>
                <div className="drop-visual">
                  <IllustrationPlaceholder type="upload" />
                </div>
                <div className="drop-text">
                  <h3>📊 Upload INN Department Excel File</h3>
                  <p>Drop your INN attendance file here or click to browse</p>
                  <div className="processing-info">
                    <div className="info-badge">🏢 INN Department Only</div>
                    <div className="info-badge">📅 Weekdays Only (Mon-Fri)</div>
                  </div>
                  <div className="supported-formats">
                    <span>Supported: .xlsx, .xls</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {error && (
          <div className="upload-error">
            ❌ {error}
          </div>
        )}
        
        {message && (
          <div className="upload-message">
            ✅ {message}
          </div>
        )}
      </div>
    </section>
  );
};

export default Upload;
