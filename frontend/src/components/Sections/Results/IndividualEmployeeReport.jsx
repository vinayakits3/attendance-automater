import Card from '../../UI/Card';
import Button from '../../UI/Button';
import LateDaysDropdown from './LateDaysDropdown';
import AbsentDaysDropdown from './AbsentDaysDropdown';
import HalfDaysDropdown from './HalfDaysDropdown';

/**
 * Individual Employee Report Component
 * Shows detailed attendance report for a specific employee
 */
const IndividualEmployeeReport = ({ 
  employeeDetails, 
  onBackToOverview 
}) => {
  return (
    <div className="results-view">
      <header className="results-header">
        <Button 
          variant="outline" 
          size="small" 
          onClick={onBackToOverview}
          className="btn-back"
        >
          ← Back to All Employees
        </Button>
        <div className="results-system-header">
          <div className="system-badge">🏢 INN Department</div>
          <div className="system-badge">📅 Weekdays Only</div>
        </div>
        <h1>👤 Individual Employee Report</h1>
        {employeeDetails.summary && (
          <p className="results-subtitle">
            {employeeDetails.summary.name} (ID: {employeeDetails.summary.id})
          </p>
        )}
      </header>

      <div className="results-content">
        {/* Individual Employee Summary */}
        {employeeDetails.summary && (
          <Card className="employee-detail-summary" padding="large">
            <h2>📊 Employee Summary</h2>
            <div className="employee-detail-grid">
              <div className="employee-detail-info">
                <div className="employee-avatar">👤</div>
                <div className="employee-basic-info">
                  <h3>{employeeDetails.summary.name}</h3>
                  <p className="employee-id">Employee ID: {employeeDetails.summary.id}</p>
                </div>
              </div>
              
              <div className="employee-stats-detailed">
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-value">{employeeDetails.summary.present}</div>
                    <div className="stat-label">Present Days</div>
                  </div>
                </div>
                
                <div className={`stat-card ${employeeDetails.summary.absent > 0 ? 'has-issues' : ''}`}>
                  <div className="stat-icon">❌</div>
                  <div className="stat-content">
                    <div className="stat-value">{employeeDetails.summary.absent}</div>
                    <div className="stat-label">Absent Days</div>
                  </div>
                </div>
                
                <div className={`stat-card ${employeeDetails.summary.lateCount > 0 ? 'has-issues' : ''}`}>
                  <div className="stat-icon">⏰</div>
                  <div className="stat-content">
                    <div className="stat-value">{employeeDetails.summary.lateCount}</div>
                    <div className="stat-label">Late Days</div>
                  </div>
                </div>
                
                <div className={`stat-card ${employeeDetails.summary.lateMinutesTotal > 0 ? 'has-issues' : ''}`}>
                  <div className="stat-icon">🕒</div>
                  <div className="stat-content">
                    <div className="stat-value">{employeeDetails.summary.lateMinutesTotal}m</div>
                    <div className="stat-label">Total Late Minutes</div>
                  </div>
                </div>
                
                <div className={`stat-card ${employeeDetails.summary.hasIssues ? 'has-issues' : 'no-issues'}`}>
                  <div className="stat-icon">{employeeDetails.summary.hasIssues ? '⚠️' : '✨'}</div>
                  <div className="stat-content">
                    <div className="stat-value">{employeeDetails.summary.hasIssues ? 'Yes' : 'No'}</div>
                    <div className="stat-label">Has Issues</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <div className="stat-value">{employeeDetails.issues.length}</div>
                    <div className="stat-label">Total Issues</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Late Arrival Details */}
        {employeeDetails.lateArrivalDetails && employeeDetails.lateArrivalDetails.totalLateDays > 0 && (
          <Card className="employee-late-details" padding="large">
            <h2>⏰ Late Arrival Details</h2>
            <div className="late-summary-stats">
              <div className="late-summary-item">
                <span className="label">Total Late Days:</span>
                <span className="value">{employeeDetails.lateArrivalDetails.totalLateDays}</span>
              </div>
              <div className="late-summary-item">
                <span className="label">Total Late Minutes:</span>
                <span className="value">{employeeDetails.lateArrivalDetails.totalLateMinutes}m</span>
              </div>
              <div className="late-summary-item">
                <span className="label">Average Late Minutes:</span>
                <span className="value">{employeeDetails.lateArrivalDetails.averageLateMinutes}m</span>
              </div>
              <div className="late-summary-item">
                <span className="label">Pattern:</span>
                <span className="value">{employeeDetails.lateArrivalDetails.latePattern}</span>
              </div>
            </div>
            
            <LateDaysDropdown 
              lateArrivalDetails={employeeDetails.lateArrivalDetails}
              employeeName={employeeDetails.summary?.name}
            />
          </Card>
        )}

        {/* Absence Details */}
        {employeeDetails.absentDetails && employeeDetails.absentDetails.totalAbsentDays > 0 && (
          <Card className="employee-absent-details" padding="large">
            <h2>❌ Absence Details</h2>
            <div className="absent-summary-stats">
              <div className="absent-summary-item">
                <span className="label">Total Absent Days:</span>
                <span className="value">{employeeDetails.absentDetails.totalAbsentDays}</span>
              </div>
              <div className="absent-summary-item">
                <span className="label">Absence Rate:</span>
                <span className="value">{employeeDetails.absentDetails.absenceRate}%</span>
              </div>
              <div className="absent-summary-item">
                <span className="label">Pattern:</span>
                <span className="value">{employeeDetails.absentDetails.absentPattern}</span>
              </div>
            </div>
            
            <AbsentDaysDropdown 
              absentDetails={employeeDetails.absentDetails}
              employeeName={employeeDetails.summary?.name}
            />
          </Card>
        )}

        {/* Half Day Details */}
        {employeeDetails.halfDayDetails && employeeDetails.halfDayDetails.totalHalfDays > 0 && (
          <Card className="employee-halfday-details" padding="large">
            <h2>🕐 Half Day Details</h2>
            <div className="halfday-summary-stats">
              <div className="halfday-summary-item">
                <span className="label">Total Half Days:</span>
                <span className="value">{employeeDetails.halfDayDetails.totalHalfDays}</span>
              </div>
              <div className="halfday-summary-item">
                <span className="label">Average Work Hours:</span>
                <span className="value">{employeeDetails.halfDayDetails.averageWorkHours}h</span>
              </div>
              <div className="halfday-summary-item">
                <span className="label">Half Day Rate:</span>
                <span className="value">{employeeDetails.halfDayDetails.halfDayRate}%</span>
              </div>
            </div>
            
            <HalfDaysDropdown 
              halfDayDetails={employeeDetails.halfDayDetails}
              employeeName={employeeDetails.summary?.name}
            />
          </Card>
        )}

        {/* All Issues for this Employee */}
        {employeeDetails.issues && employeeDetails.issues.length > 0 && (
          <Card className="employee-all-issues" padding="large">
            <h2>🔍 All Issues</h2>
            <div className="issues-container">
              {employeeDetails.issues.map((issue, issueIndex) => (
                <div key={issueIndex} className={`issue-item ${issue.severity}`}>
                  <span className="severity-badge">
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className="issue-message">{issue.message}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* No Issues Message */}
        {(!employeeDetails.issues || employeeDetails.issues.length === 0) && 
         (!employeeDetails.lateArrivalDetails || employeeDetails.lateArrivalDetails.totalLateDays === 0) &&
         (!employeeDetails.absentDetails || employeeDetails.absentDetails.totalAbsentDays === 0) &&
         (!employeeDetails.halfDayDetails || employeeDetails.halfDayDetails.totalHalfDays === 0) && (
          <Card className="no-issues-card" padding="large">
            <div className="no-issues-content">
              <div className="success-icon">✨</div>
              <h2>Excellent Performance!</h2>
              <p>This employee has no attendance issues and maintains excellent punctuality.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IndividualEmployeeReport;