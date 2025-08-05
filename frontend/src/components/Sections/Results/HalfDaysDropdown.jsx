import { useState } from 'react';
import './HalfDaysDropdown.css';

/**
 * Interactive Dropdown Component for Half Days Details
 */
const HalfDaysDropdown = ({ halfDayDetails, employeeName }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!halfDayDetails || !halfDayDetails.halfDays || halfDayDetails.halfDays.length === 0) {
    return null;
  }

  const { halfDays, totalHalfDays, halfDayPattern, averageWorkHours } = halfDayDetails;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getHalfDayTypeClass = (reason) => {
    if (reason && reason.toLowerCase().includes('insufficient hours')) return 'halfday-insufficient';
    if (reason && reason.toLowerCase().includes('unusual timing')) return 'halfday-timing';
    if (reason && reason.toLowerCase().includes('early timing')) return 'halfday-early';
    return 'halfday-general';
  };

  const formatDayType = (dayType) => {
    if (!dayType) return '';
    return dayType.length <= 3 ? dayType : dayType.substring(0, 3);
  };

  const getPatternSeverity = (pattern) => {
    if (pattern === 'Chronic') return 'pattern-critical';
    if (pattern === 'Frequent') return 'pattern-high';
    if (pattern === 'Consecutive') return 'pattern-medium';
    return 'pattern-low';
  };

  const formatWorkHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="half-days-dropdown">
      <button 
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        type="button"
      >
        <div className="trigger-content">
          <div className="trigger-icon">
            <span className="icon">🕐</span>
            <span className="count-badge">{totalHalfDays}</span>
          </div>
          <div className="trigger-text">
            <span className="primary-text">Half Days Details</span>
            <span className="secondary-text">
              {totalHalfDays} half days, avg {averageWorkHours}h worked
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
            <h4>🕐 Half Day Details for {employeeName}</h4>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-value">{totalHalfDays}</span>
                <span className="stat-label">Total Half Days</span>
              </div>
              <div className="stat">
                <span className="stat-value">{averageWorkHours}h</span>
                <span className="stat-label">Avg Work Hours</span>
              </div>
              <div className="stat">
                <span className="stat-value">{Math.round((totalHalfDays / 22) * 100)}%</span>
                <span className="stat-label">Half Day Rate</span>
              </div>
              <div className="stat">
                <span className={`stat-value ${getPatternSeverity(halfDayPattern)}`}>{halfDayPattern}</span>
                <span className="stat-label">Pattern</span>
              </div>
            </div>
          </div>

          <div className="half-days-list">
            <div className="list-header">
              <div className="col-day">Day</div>
              <div className="col-timing">Timing</div>
              <div className="col-hours">Work Hours</div>
              <div className="col-required">Required</div>
              <div className="col-reason">Reason</div>
            </div>
            
            {halfDays
              .sort((a, b) => a.day - b.day) // Sort by day number
              .map((halfDay, index) => (
                <div key={index} className={`half-day-row ${getHalfDayTypeClass(halfDay.reason)}`}>
                  <div className="col-day">
                    <span className="day-number">{halfDay.day}</span>
                    <span className="day-type">{formatDayType(halfDay.dayType)}</span>
                  </div>
                  <div className="col-timing">
                    <span className="arrival-time">{halfDay.arrivalTime}</span>
                    <span className="departure-time">{halfDay.departureTime}</span>
                  </div>
                  <div className="col-hours">
                    <span className="work-hours">{formatWorkHours(halfDay.workMinutes)}</span>
                    <span className="hours-label">worked</span>
                  </div>
                  <div className="col-required">
                    <span className="required-hours">{formatWorkHours(halfDay.requiredMinutes)}</span>
                    <span className="required-label">required</span>
                  </div>
                  <div className="col-reason">
                    <span className={`reason-indicator ${getHalfDayTypeClass(halfDay.reason)}`}>
                      {halfDay.reason.includes('insufficient') ? '⏱️ Insufficient' :
                       halfDay.reason.includes('unusual timing') ? '🕘 Unusual Timing' :
                       halfDay.reason.includes('early timing') ? '🌅 Early Arrival' : '🕐 Half Day'}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <div className="business-rules">
            <div className="rules-info">
              <span className="rules-icon">📋</span>
              <div className="rules-details">
                <strong>Half Day Business Rules:</strong>
                <div className="rule-list">
                  <div className="rule-item">
                    <span className="rule-condition">9:30 AM - 10:01 AM arrival:</span>
                    <span className="rule-requirement">4.5 hours minimum</span>
                  </div>
                  <div className="rule-item">
                    <span className="rule-condition">Before 9:30 AM or after 10:01 AM:</span>
                    <span className="rule-requirement">9 hours minimum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {halfDayPattern !== 'Occasional' && (
            <div className="pattern-analysis">
              <div className="pattern-info">
                <span className="pattern-icon">📊</span>
                <div className="pattern-details">
                  <strong>Half Day Pattern Analysis:</strong>
                  <span className="pattern-description">
                    {halfDayPattern === 'Chronic' && 'This employee has a chronic half-day pattern. Review work scheduling.'}
                    {halfDayPattern === 'Frequent' && 'This employee frequently works half days. Consider workload assessment.'}
                    {halfDayPattern === 'Consecutive' && 'This employee has consecutive half days. Check for scheduling issues.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="dropdown-footer">
            <div className="footer-note">
              <span className="note-icon">💡</span>
              <span className="note-text">
                Work hours calculated from first punch to last punch with break deductions
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalfDaysDropdown;