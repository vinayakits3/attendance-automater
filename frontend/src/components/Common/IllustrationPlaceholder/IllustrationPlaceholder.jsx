import './IllustrationPlaceholder.css';

/**
 * Reusable SVG Illustration Placeholder Component
 */
const IllustrationPlaceholder = ({ type = 'hero', className = '', ...props }) => {
  const illustrations = {
    hero: (
      <svg viewBox="0 0 400 300" className={`illustration ${className}`} {...props}>
        <defs>
          <pattern id="blueprintGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
            <path d="M 0 6 L 24 6 M 0 12 L 24 12 M 0 18 L 24 18" fill="none" stroke="#f8f8f8" strokeWidth="0.25"/>
            <path d="M 6 0 L 6 24 M 12 0 L 12 24 M 18 0 L 18 24" fill="none" stroke="#f8f8f8" strokeWidth="0.25"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#blueprintGrid)" opacity="0.6"/>
        
        {/* Isometric Server Rack */}
        <g transform="translate(80, 100)">
          <path d="M0 0 L40 -20 L120 -20 L80 0 Z" fill="none" stroke="#000" strokeWidth="1.5"/>
          <path d="M0 0 L0 60 L40 40 L40 -20 Z" fill="none" stroke="#000" strokeWidth="1.5"/>
          <path d="M80 0 L80 60 L120 40 L120 -20 Z" fill="none" stroke="#000" strokeWidth="1.5"/>
          <path d="M0 60 L40 40 L120 40 L80 60 Z" fill="none" stroke="#000" strokeWidth="1.5"/>
          
          {/* Server panels */}
          <rect x="10" y="10" width="60" height="8" fill="none" stroke="#000" strokeWidth="0.8"/>
          <rect x="10" y="20" width="60" height="8" fill="none" stroke="#000" strokeWidth="0.8"/>
          <rect x="10" y="30" width="60" height="8" fill="none" stroke="#000" strokeWidth="0.8"/>
          
          {/* Status indicators */}
          <circle cx="65" cy="14" r="2" fill="#000"/>
          <circle cx="65" cy="24" r="2" fill="none" stroke="#000" strokeWidth="0.8"/>
          <circle cx="65" cy="34" r="2" fill="#000"/>
        </g>
        
        {/* Isometric Database */}
        <g transform="translate(220, 120)">
          <path d="M0 30 Q0 20 20 20 Q40 20 40 30 L40 50 Q40 60 20 60 Q0 60 0 50 Z" fill="none" stroke="#000" strokeWidth="1.5"/>
          <ellipse cx="20" cy="30" rx="20" ry="10" fill="none" stroke="#000" strokeWidth="1.5"/>
          <ellipse cx="20" cy="40" rx="20" ry="10" fill="none" stroke="#000" strokeWidth="0.8"/>
          <ellipse cx="20" cy="50" rx="20" ry="10" fill="none" stroke="#000" strokeWidth="0.8"/>
        </g>
        
        {/* Connection lines with dimensioning style */}
        <g stroke="#000" strokeWidth="1" strokeDasharray="3,2" opacity="0.7">
          <line x1="160" y1="120" x2="220" y2="140"/>
          <line x1="160" y1="140" x2="220" y2="160"/>
          {/* Dimension markers */}
          <path d="M155 120 L165 120 M155 140 L165 140" stroke="#000" strokeWidth="0.8"/>
          <path d="M215 140 L225 140 M215 160 L225 160" stroke="#000" strokeWidth="0.8"/>
        </g>
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
          <pattern id="systemGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f5f5f5" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="400" height="250" fill="url(#systemGrid)" opacity="0.4"/>
        
        {/* Isometric Central Processor */}
        <g transform="translate(170, 110)">
          <path d="M0 0 L20 -10 L80 -10 L60 0 Z" fill="none" stroke="#000" strokeWidth="1.5"/>
          <path d="M0 0 L0 40 L20 30 L20 -10 Z" fill="none" stroke="#000" strokeWidth="1.5"/>
          <path d="M60 0 L60 40 L80 30 L80 -10 Z" fill="none" stroke="#000" strokeWidth="1.5"/>
          <path d="M0 40 L20 30 L80 30 L60 40 Z" fill="none" stroke="#000" strokeWidth="1.5"/>
          
          {/* CPU details */}
          <rect x="5" y="5" width="50" height="30" fill="none" stroke="#000" strokeWidth="0.8"/>
          <circle cx="15" cy="15" r="3" fill="#000"/>
          <circle cx="25" cy="15" r="3" fill="none" stroke="#000" strokeWidth="0.8"/>
          <circle cx="35" cy="15" r="3" fill="#000"/>
          <circle cx="45" cy="15" r="3" fill="none" stroke="#000" strokeWidth="0.8"/>
        </g>
        
        {/* Isometric Input/Output Modules */}
        <g transform="translate(60, 70)">
          <path d="M0 0 L15 -8 L45 -8 L30 0 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <path d="M0 0 L0 25 L15 17 L15 -8 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <path d="M30 0 L30 25 L45 17 L45 -8 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <text x="15" y="15" textAnchor="middle" fontSize="8" fill="#000">EXCEL</text>
        </g>
        
        <g transform="translate(310, 70)">
          <path d="M0 0 L15 -8 L45 -8 L30 0 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <path d="M0 0 L0 25 L15 17 L15 -8 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <path d="M30 0 L30 25 L45 17 L45 -8 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <text x="15" y="15" textAnchor="middle" fontSize="8" fill="#000">DATA</text>
        </g>
        
        <g transform="translate(60, 160)">
          <path d="M0 0 L15 -8 L45 -8 L30 0 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <path d="M0 0 L0 25 L15 17 L15 -8 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <path d="M30 0 L30 25 L45 17 L45 -8 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <text x="15" y="15" textAnchor="middle" fontSize="8" fill="#000">REPORT</text>
        </g>
        
        <g transform="translate(310, 160)">
          <path d="M0 0 L15 -8 L45 -8 L30 0 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <path d="M0 0 L0 25 L15 17 L15 -8 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <path d="M30 0 L30 25 L45 17 L45 -8 Z" fill="none" stroke="#000" strokeWidth="1"/>
          <text x="15" y="15" textAnchor="middle" fontSize="8" fill="#000">ALERT</text>
        </g>
        
        {/* Blueprint-style connection lines */}
        <g stroke="#000" strokeWidth="1" strokeDasharray="2,3" opacity="0.7">
          <line x1="105" y1="80" x2="170" y2="120"/>
          <line x1="310" y1="80" x2="250" y2="120"/>
          <line x1="105" y1="170" x2="170" y2="140"/>
          <line x1="310" y1="170" x2="250" y2="140"/>
          
          {/* Connection indicators */}
          <circle cx="105" cy="80" r="2" fill="none" stroke="#000" strokeWidth="1"/>
          <circle cx="310" cy="80" r="2" fill="none" stroke="#000" strokeWidth="1"/>
          <circle cx="105" cy="170" r="2" fill="none" stroke="#000" strokeWidth="1"/>
          <circle cx="310" cy="170" r="2" fill="none" stroke="#000" strokeWidth="1"/>
        </g>
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
