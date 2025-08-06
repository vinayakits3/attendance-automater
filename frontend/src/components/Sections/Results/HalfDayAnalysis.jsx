import Card from '../../UI/Card';
import HalfDaysDropdown from './HalfDaysDropdown';

/**
 * Half Day Analysis Component
 * Shows half day statistics and employee details
 */
const HalfDayAnalysis = ({ halfDaySummary }) => {
  if (!halfDaySummary) {
    return null;
  }

  return (
    <Card className="halfday-analysis" padding="large">
      <h2>🕐 Half Day Analysis</h2>
      <div className="halfday-stats-grid">
        <div className="halfday-stat-card">
          <div className="metric">{halfDaySummary.totalEmployeesWithHalfDays}</div>
          <div className="label">Employees with Half Days</div>
        </div>
        <div className="halfday-stat-card">
          <div className="metric">{halfDaySummary.totalHalfDays}</div>
          <div className="label">Total Half Days</div>
        </div>
        <div className="halfday-stat-card">
          <div className="metric">{Math.round(halfDaySummary.averageWorkHours * 10) / 10}h</div>
          <div className="label">Avg Work Hours</div>
        </div>
        <div className="halfday-stat-card">
          <div className="metric">{Math.round(halfDaySummary.averageHalfDaysPerEmployee)}</div>
          <div className="label">Avg Half Days/Employee</div>
        </div>
      </div>

      {halfDaySummary.topHalfDayEmployees && halfDaySummary.topHalfDayEmployees.length > 0 && (
        <div className="top-halfday-employees">
          <h3>🕐 Top Half Day Employees</h3>
          <div className="halfday-employees-list">
            {halfDaySummary.topHalfDayEmployees.map((emp, index) => (
              <div key={index} className="halfday-employee-card">
                <div className="employee-rank">#{index + 1}</div>
                <div className="employee-info">
                  <div className="employee-name">{emp.name}</div>
                  <div className="employee-id">ID: {emp.id}</div>
                </div>
                <div className="halfday-stats">
                  <div className="stat">
                    <span className="stat-value">{emp.halfDays}</span>
                    <span className="stat-label">Half Days</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{emp.averageWorkHours}h</span>
                    <span className="stat-label">Avg Work Hours</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{emp.pattern}</span>
                    <span className="stat-label">Pattern</span>
                  </div>
                </div>
                {/* Interactive Half Days Details */}
                {emp.halfDayDetails && (
                  <div className="employee-halfday-details">
                    <HalfDaysDropdown 
                      halfDayDetails={emp.halfDayDetails}
                      employeeName={emp.name}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {halfDaySummary.halfDayReasonDistribution && (
        <div className="halfday-reasons">
          <h3>⏰ Half Day Reasons</h3>
          <div className="reason-distribution">
            {Object.entries(halfDaySummary.halfDayReasonDistribution).map(([reason, count]) => (
              <div key={reason} className="reason-item">
                <span className="reason-name">{reason}</span>
                <span className="reason-count">{count} instances</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default HalfDayAnalysis;