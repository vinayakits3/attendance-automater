import './Loading.css';

/**
 * Loading Component with Spinner
 */
const Loading = ({ 
  size = 'medium',
  message = 'Loading...',
  centered = false,
  overlay = false,
  className = ''
}) => {
  const baseClass = 'loading';
  const sizeClass = `loading-${size}`;
  const centeredClass = centered ? 'loading-centered' : '';
  const overlayClass = overlay ? 'loading-overlay' : '';
  
  const loadingClass = [
    baseClass,
    sizeClass,
    centeredClass,
    overlayClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={loadingClass}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loading;
