import './Card.css';

/**
 * Reusable Card Component
 */
const Card = ({ 
  children, 
  variant = 'default',
  padding = 'normal',
  shadow = true,
  hover = false,
  className = '',
  ...props 
}) => {
  const baseClass = 'card';
  const variantClass = `card-${variant}`;
  const paddingClass = `card-padding-${padding}`;
  const shadowClass = shadow ? 'card-shadow' : '';
  const hoverClass = hover ? 'card-hover' : '';
  
  const cardClass = [
    baseClass,
    variantClass,
    paddingClass,
    shadowClass,
    hoverClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};

export default Card;
