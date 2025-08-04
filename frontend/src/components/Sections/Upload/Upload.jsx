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
                message="Processing your attendance data..." 
              />
            ) : (
              <>
                <div className="drop-visual">
                  <IllustrationPlaceholder type="upload" />
                </div>
                <div className="drop-text">
                  <h3>Drop your Excel file here</h3>
                  <p>Or click here to browse files</p>
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
