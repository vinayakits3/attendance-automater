import './IllustrationPlaceholder.css';

/**
 * Reusable SVG Illustration Placeholder Component
 */
const IllustrationPlaceholder = ({ type = 'hero', className = '', ...props }) => {
  const illustrations = {
    hero: (
      <svg viewBox="0 0 400 300" className={`illustration ${className}`} {...props}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e5e5" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#grid)" opacity="0.3"/>
        {/* Browser Windows */}
        <rect x="50" y="80" width="120" height="80" fill="none" stroke="#000" strokeWidth="2" rx="4"/>
        <rect x="50" y="80" width="120" height="20" fill="#000"/>
        <circle cx="60" cy="90" r="3" fill="#fff"/>
        <circle cx="70" cy="90" r="3" fill="#fff"/>
        <circle cx="80" cy="90" r="3" fill="#fff"/>
        
        <rect x="230" y="60" width="120" height="80" fill="none" stroke="#000" strokeWidth="2" rx="4"/>
        <rect x="230" y="60" width="120" height="20" fill="#000"/>
        <circle cx="240" cy="70" r="3" fill="#fff"/>
        <circle cx="250" cy="70" r="3" fill="#fff"/>
        <circle cx="260" cy="70" r="3" fill="#fff"/>
        
        {/* Connection Lines */}
        <line x1="170" y1="120" x2="230" y2="100" stroke="#000" strokeWidth="2" strokeDasharray="5,5"/>
        <line x1="110" y1="160" x2="290" y2="140" stroke="#000" strokeWidth="2" strokeDasharray="5,5"/>
        
        {/* Central Node */}
        <circle cx="200" cy="150" r="15" fill="#000"/>
        <circle cx="200" cy="150" r="8" fill="#fff"/>
      </svg>
    ),
    
    partners: (
      <svg viewBox="0 0 300 100" className={`illustration ${className}`} {...props}>
        <rect x="20" y="30" width="60" height="40" fill="none" stroke="#000" strokeWidth="1" rx="4"/>
        <rect x="120" y="30" width="60" height="40" fill="none" stroke="#000" strokeWidth="1" rx="4"/>
        <rect x="220" y="30" width="60" height="40" fill="none" stroke="#000" strokeWidth="1" rx="4"/>
        <text x="50" y="55" textAnchor="middle" fontSize="12" fill="#666">PARTNER</text>
        <text x="150" y="55" textAnchor="middle" fontSize="12" fill="#666">PARTNER</text>
        <text x="250" y="55" textAnchor="middle" fontSize="12" fill="#666">PARTNER</text>
      </svg>
    ),
    
    system: (
      <svg viewBox="0 0 400 250" className={`illustration ${className}`} {...props}>
        <defs>
          <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1" fill="#ddd"/>
          </pattern>
        </defs>
        <rect width="400" height="250" fill="url(#dots)" opacity="0.3"/>
        
        {/* Central Processing Unit */}
        <rect x="150" y="100" width="100" height="50" fill="#000" rx="8"/>
        <text x="200" y="130" textAnchor="middle" fontSize="12" fill="#fff">PROCESSOR</text>
        
        {/* Orbiting Elements */}
        <circle cx="100" cy="80" r="20" fill="none" stroke="#000" strokeWidth="2"/>
        <text x="100" y="85" textAnchor="middle" fontSize="10" fill="#000">EXCEL</text>
        
        <circle cx="300" cy="80" r="20" fill="none" stroke="#000" strokeWidth="2"/>
        <text x="300" y="85" textAnchor="middle" fontSize="10" fill="#000">DATA</text>
        
        <circle cx="100" cy="170" r="20" fill="none" stroke="#000" strokeWidth="2"/>
        <text x="100" y="175" textAnchor="middle" fontSize="10" fill="#000">REPORT</text>
        
        <circle cx="300" cy="170" r="20" fill="none" stroke="#000" strokeWidth="2"/>
        <text x="300" y="175" textAnchor="middle" fontSize="10" fill="#000">ALERT</text>
        
        {/* Connection Lines */}
        <line x1="120" y1="90" x2="150" y2="115" stroke="#000" strokeWidth="1"/>
        <line x1="280" y1="90" x2="250" y2="115" stroke="#000" strokeWidth="1"/>
        <line x1="120" y1="160" x2="150" y2="135" stroke="#000" strokeWidth="1"/>
        <line x1="280" y1="160" x2="250" y2="135" stroke="#000" strokeWidth="1"/>
      </svg>
    ),
    
    workflow: (
      <svg viewBox="0 0 350 200" className={`illustration ${className}`} {...props}>
        {/* Workflow Steps */}
        <rect x="20" y="80" width="60" height="40" fill="none" stroke="#000" strokeWidth="2" rx="4"/>
        <text x="50" y="105" textAnchor="middle" fontSize="11" fill="#000">UPLOAD</text>
        
        <rect x="145" y="80" width="60" height="40" fill="none" stroke="#000" strokeWidth="2" rx="4"/>
        <text x="175" y="105" textAnchor="middle" fontSize="11" fill="#000">ANALYZE</text>
        
        <rect x="270" y="80" width="60" height="40" fill="none" stroke="#000" strokeWidth="2" rx="4"/>
        <text x="300" y="105" textAnchor="middle" fontSize="11" fill="#000">RESULTS</text>
        
        {/* Arrows */}
        <polygon points="90,100 130,100 125,95 125,105" fill="#000"/>
        <polygon points="215,100 255,100 250,95 250,105" fill="#000"/>
      </svg>
    ),
    
    upload: (
      <svg viewBox="0 0 300 200" className={`illustration ${className}`} {...props}>
        {/* Upload Cloud */}
        <path d="M150 80 C130 80, 120 95, 120 110 C105 110, 95 120, 95 135 C95 150, 105 160, 120 160 L180 160 C195 160, 205 150, 205 135 C205 125, 200 116, 192 111 C192 95, 178 80, 150 80 Z" 
              fill="none" stroke="#000" strokeWidth="2"/>
        
        {/* Upload Arrow */}
        <line x1="150" y1="140" x2="150" y2="110" stroke="#000" strokeWidth="3"/>
        <polygon points="150,105 145,115 155,115" fill="#000"/>
        
        {/* File Icon */}
        <rect x="135" y="145" width="30" height="40" fill="none" stroke="#000" strokeWidth="2" rx="2"/>
        <text x="150" y="170" textAnchor="middle" fontSize="10" fill="#000">XLS</text>
      </svg>
    )
  };

  return illustrations[type] || illustrations.hero;
};

export default IllustrationPlaceholder;
