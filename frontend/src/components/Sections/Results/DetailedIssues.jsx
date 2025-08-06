import Card from '../../UI/Card';
import LateDaysDropdown from './LateDaysDropdown';
import AbsentDaysDropdown from './AbsentDaysDropdown';
import HalfDaysDropdown from './HalfDaysDropdown';

/**
 * Detailed Issues Component
 * Shows detailed issues by employee with interactive dropdowns
 */
const DetailedIssues = ({ issues }) => {
  if (!issues || issues.length === 0) {
    return null;
  }

  return (
    <Card className="issues-section" padding="large">
      <h2>🔍 Detailed Issues by Employee</h2>
      <div className="issues-list">
        {issues.map((employeeIssue, index) => (
          <div key={index} className="employee-issues">
            <div className="employee-header">
              <h3>
                👤 {employeeIssue.employee.name} (ID: {employeeIssue.employee.id})
              </h3>
              <div className="employee-stats">
                <span className="issue-count">{employeeIssue.issues.length} issues</span>
                {employeeIssue.lateArrivalDetails && employeeIssue.lateArrivalDetails.totalLateDays > 0 && (
                  <span className="late-info">
                    🕒 {employeeIssue.lateArrivalDetails.totalLateDays} late days 
                    ({employeeIssue.lateArrivalDetails.totalLateMinutes} total minutes)
                  </span>
                )}
                {employeeIssue.absentDetails && employeeIssue.absentDetails.totalAbsentDays > 0 && (
                  <span className="absent-info">
                    ❌ {employeeIssue.absentDetails.totalAbsentDays} absent days 
                    ({employeeIssue.absentDetails.absentPattern} pattern)
                  </span>
                )}
                {employeeIssue.halfDayDetails && employeeIssue.halfDayDetails.totalHalfDays > 0 && (
                  <span className="halfday-info">
                    🕐 {employeeIssue.halfDayDetails.totalHalfDays} half days 
                    (avg {employeeIssue.halfDayDetails.averageWorkHours}h)
                  </span>
                )}
              </div>
            </div>

            {/* Late Days Interactive Dropdown */}
            <LateDaysDropdown 
              lateArrivalDetails={employeeIssue.lateArrivalDetails}
              employeeName={employeeIssue.employee.name}
            />
            
            {/* Absent Days Interactive Dropdown */}
            <AbsentDaysDropdown 
              absentDetails={employeeIssue.absentDetails}
              employeeName={employeeIssue.employee.name}
            />
            
            {/* Half Days Interactive Dropdown */}
            <HalfDaysDropdown 
              halfDayDetails={employeeIssue.halfDayDetails}
              employeeName={employeeIssue.employee.name}
            />
            
            <div className="issues-container">
              {employeeIssue.issues.map((issue, issueIndex) => (
                <div key={issueIndex} className={`issue-item ${issue.severity}`}>
                  <span className="severity-badge">
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className="issue-message">{issue.message}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DetailedIssues;