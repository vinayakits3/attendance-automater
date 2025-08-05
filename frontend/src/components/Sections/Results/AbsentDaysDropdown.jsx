import { useState } from 'react';
import './AbsentDaysDropdown.css';

/**
 * Interactive Dropdown Component for Absent Days Details
 */
const AbsentDaysDropdown = ({ absentDetails, employeeName }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!absentDetails || !absentDetails.absentDays || absentDetails.absentDays.length === 0) {
    return null;
  }

  const { absentDays, totalAbsentDays, absentPattern, consecutiveAbsences } = absentDetails;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getAbsenceTypeClass = (reason) => {
    if (reason && reason.toLowerCase().includes('sick')) return 'absence-sick';
    if (reason && reason.toLowerCase().includes('personal')) return 'absence-personal';
    if (reason && reason.toLowerCase().includes('emergency')) return 'absence-emergency';
    return 'absence-unspecified';
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

  return (
    <div className="absent-days-dropdown">
      <button 
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={toggleDropdown}
        type="button"
      >
        <div className="trigger-content">
          <div className="trigger-icon">
            <span className="icon">❌</span>
            <span className="count-badge">{totalAbsentDays}</span>
          </div>
          <div className="trigger-text">
            <span className="primary-text">Absent Days Details</span>
            <span className="secondary-text">
              {totalAbsentDays} days absent, {absentPattern} pattern
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
            <h4>❌ Absence Details for {employeeName}</h4>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-value">{totalAbsentDays}</span>
                <span className="stat-label">Total Absent Days</span>
              </div>
              <div className="stat">
                <span className="stat-value">{consecutiveAbsences || 0}</span>
                <span className="stat-label">Max Consecutive</span>
              </div>
              <div className="stat">
                <span className="stat-value">{Math.round((totalAbsentDays / 22) * 100)}%</span>
                <span className="stat-label">Absence Rate</span>
              </div>
              <div className="stat">
                <span className={`stat-value ${getPatternSeverity(absentPattern)}`}>{absentPattern}</span>
                <span className="stat-label">Pattern</span>
              </div>
            </div>
          </div>

          <div className="absent-days-list">
            <div className="list-header">
              <div className="col-day">Day</div>
              <div className="col-date">Date</div>
              <div className="col-type">Day Type</div>
              <div className="col-reason">Reason</div>
              <div className="col-impact">Impact</div>
            </div>
            
            {absentDays
              .sort((a, b) => a.day - b.day) // Sort by day number
              .map((absentDay, index) => (
                <div key={index} className={`absent-day-row ${getAbsenceTypeClass(absentDay.reason)}`}>
                  <div className="col-day">
                    <span className="day-number">{absentDay.day}</span>
                    <span className="day-type">{formatDayType(absentDay.dayType)}</span>
                  </div>
                  <div className="col-date">
                    <span className="month-year">July 2025</span>
                  </div>
                  <div className="col-type">
                    <span className="weekday">{absentDay.dayType}</span>
                    <span className="weekday-note">Weekday</span>
                  </div>
                  <div className="col-reason">
                    <span className="reason-text">{absentDay.reason || 'Not specified'}</span>
                    <span className="status-code">Status: A</span>
                  </div>
                  <div className="col-impact">
                    <span className={`impact-indicator ${getAbsenceTypeClass(absentDay.reason)}`}>
                      {absentDay.reason && absentDay.reason.toLowerCase().includes('sick') ? '🤒 Medical' :
                       absentDay.reason && absentDay.reason.toLowerCase().includes('personal') ? '👤 Personal' :
                       absentDay.reason && absentDay.reason.toLowerCase().includes('emergency') ? '🚨 Emergency' : '❓ Unspecified'}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {absentPattern !== 'Occasional' && (
            <div className="pattern-analysis">
              <div className="pattern-info">
                <span className="pattern-icon">📊</span>
                <div className="pattern-details">
                  <strong>Absence Pattern Analysis:</strong>
                  <span className="pattern-description">
                    {absentPattern === 'Chronic' && 'This employee has a chronic absence pattern. HR intervention recommended.'}
                    {absentPattern === 'Frequent' && 'This employee frequently takes unscheduled absences. Monitoring recommended.'}
                    {absentPattern === 'Consecutive' && 'This employee has consecutive absent days. Check if extended leave is needed.'}
                    {absentPattern.includes('Mostly') && `This employee is often absent on ${absentPattern.split(' ')[1]}s.`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {consecutiveAbsences > 2 && (
            <div className="consecutive-alert">
              <div className="alert-content">
                <span className="alert-icon">⚠️</span>
                <div className="alert-text">
                  <strong>Consecutive Absence Alert:</strong>
                  <span>Employee had {consecutiveAbsences} consecutive absent days. Consider wellness check or extended leave discussion.</span>
                </div>
              </div>
            </div>
          )}

          <div className="dropdown-footer">
            <div className="footer-note">
              <span className="note-icon">💡</span>
              <span className="note-text">
                Weekdays-only calculation: Only Monday-Friday absences are tracked
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsentDaysDropdown;