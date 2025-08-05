import { useState } from 'react';
import './LateDaysDropdown.css';

/**
 * Interactive Dropdown Component for Late Days Details
 */
const LateDaysDropdown = ({ lateArrivalDetails, employeeName }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!lateArrivalDetails || !lateArrivalDetails.lateDays || lateArrivalDetails.lateDays.length === 0) {
    return null;
  }

  const { lateDays, totalLateDays, totalLateMinutes, averageLateMinutes, pattern } = lateArrivalDetails;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getSeverityClass = (lateMinutes) => {
    if (lateMinutes >= 60) return 'severity-critical';
    if (lateMinutes >= 30) return 'severity-high';
    if (lateMinutes >= 15) return 'severity-medium';
    return 'severity-low';
  };

  const formatDayType = (dayType) => {
    if (!dayType) return '';
    return dayType.length <= 3 ? dayType : dayType.substring(0, 3);
  };

  return (
    <div className="late-days-dropdown">
      <button 
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        type="button"
      >
        <div className="trigger-content">
          <div className="trigger-icon">
            <span className="icon">⏰</span>
            <span className="count-badge">{totalLateDays}</span>
          </div>
          <div className="trigger-text">
            <span className="primary-text">Late Days Details</span>
            <span className="secondary-text">
              {totalLateDays} days, {totalLateMinutes}m total, avg {averageLateMinutes}m
            </span>
          </div>
          <div className="trigger-arrow">
            {isOpen ? '▲' : '▼'}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="dropdown-content">
          <div className="dropdown-header">
            <h4>📅 Late Arrival Details for {employeeName}</h4>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-value">{totalLateDays}</span>
                <span className="stat-label">Total Late Days</span>
              </div>
              <div className="stat">
                <span className="stat-value">{totalLateMinutes}m</span>
                <span className="stat-label">Total Late Minutes</span>
              </div>
              <div className="stat">
                <span className="stat-value">{averageLateMinutes}m</span>
                <span className="stat-label">Average per Day</span>
              </div>
              <div className="stat">
                <span className={`stat-value pattern-${pattern.toLowerCase()}`}>{pattern}</span>
                <span className="stat-label">Pattern</span>
              </div>
            </div>
          </div>

          <div className="late-days-list">
            <div className="list-header">
              <div className="col-day">Day</div>
              <div className="col-date">Date</div>
              <div className="col-arrival">Arrival Time</div>
              <div className="col-late">Late By</div>
              <div className="col-severity">Severity</div>
            </div>
            
            {lateDays
              .sort((a, b) => a.day - b.day) // Sort by day number
              .map((lateDay, index) => (
                <div key={index} className={`late-day-row ${getSeverityClass(lateDay.lateMinutes)}`}>
                  <div className="col-day">
                    <span className="day-number">{lateDay.day}</span>
                    <span className="day-type">{formatDayType(lateDay.dayType)}</span>
                  </div>
                  <div className="col-date">
                    <span className="month-year">July 2025</span>
                  </div>
                  <div className="col-arrival">
                    <span className="time">{lateDay.time || lateDay.arrivalTime}</span>
                    <span className="expected">Expected: ≤10:01</span>
                  </div>
                  <div className="col-late">
                    <span className="minutes">{lateDay.lateMinutes}min</span>
                    <span className="delay-text">late</span>
                  </div>
                  <div className="col-severity">
                    <span className={`severity-indicator ${getSeverityClass(lateDay.lateMinutes)}`}>
                      {lateDay.lateMinutes >= 60 ? '🔴 Critical' :
                       lateDay.lateMinutes >= 30 ? '🟠 High' :
                       lateDay.lateMinutes >= 15 ? '🟡 Medium' : '🟢 Low'}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {pattern !== 'Occasional' && (
            <div className="pattern-analysis">
              <div className="pattern-info">
                <span className="pattern-icon">📊</span>
                <div className="pattern-details">
                  <strong>Pattern Analysis:</strong>
                  <span className="pattern-description">
                    {pattern === 'Chronic' && 'This employee has a chronic late arrival pattern. Consider intervention.'}
                    {pattern === 'Frequent' && 'This employee frequently arrives late. Regular monitoring recommended.'}
                    {pattern === 'Consecutive' && 'This employee has consecutive late days. Immediate attention needed.'}
                    {pattern.includes('Mostly') && `This employee is often late on ${pattern.split(' ')[1]}s.`}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="dropdown-footer">
            <div className="footer-note">
              <span className="note-icon">💡</span>
              <span className="note-text">
                Punch-based calculation: Late = MIN punch time {'>'} 10:01 AM
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LateDaysDropdown;
