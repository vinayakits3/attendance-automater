import Card from '../../UI/Card';
import LateDaysDropdown from './LateDaysDropdown';

/**
 * Late Arrival Analysis Component
 * Shows late arrival statistics and employee details
 */
const LateArrivalAnalysis = ({ lateArrivalSummary }) => {
  if (!lateArrivalSummary) {
    return null;
  }

  return (
    <Card className="late-arrival-analysis" padding="large">
      <h2>⏰ Late Arrival Analysis</h2>
      <div className="late-stats-grid">
        <div className="late-stat-card">
          <div className="metric">{lateArrivalSummary.totalEmployeesWithLateArrivals}</div>
          <div className="label">Employees with Late Arrivals</div>
        </div>
        <div className="late-stat-card">
          <div className="metric">{lateArrivalSummary.totalLateDays}</div>
          <div className="label">Total Late Days</div>
        </div>
        <div className="late-stat-card">
          <div className="metric">{Math.round(lateArrivalSummary.totalLateMinutes / 60)}h</div>
          <div className="label">Total Late Hours</div>
        </div>
        <div className="late-stat-card">
          <div className="metric">{Math.round(lateArrivalSummary.totalLateMinutes / lateArrivalSummary.totalLateDays)}m</div>
          <div className="label">Avg Late Minutes/Day</div>
        </div>
      </div>

      {lateArrivalSummary.topLateEmployees && lateArrivalSummary.topLateEmployees.length > 0 && (
        <div className="top-late-employees">
          <h3>🏆 Top Late Employees</h3>
          <div className="late-employees-list">
            {lateArrivalSummary.topLateEmployees.map((emp, index) => (
              <div key={index} className="late-employee-card">
                <div className="employee-rank">#{index + 1}</div>
                <div className="employee-info">
                  <div className="employee-name">{emp.name}</div>
                  <div className="employee-id">ID: {emp.id}</div>
                </div>
                <div className="late-stats">
                  <div className="stat">
                    <span className="stat-value">{emp.lateDays}</span>
                    <span className="stat-label">Late Days</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{emp.averageLateMinutes}m</span>
                    <span className="stat-label">Avg Late</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{emp.pattern}</span>
                    <span className="stat-label">Pattern</span>
                  </div>
                </div>
                {/* Interactive Late Days Details */}
                {emp.lateArrivalDetails && (
                  <div className="employee-late-details">
                    <LateDaysDropdown 
                      lateArrivalDetails={emp.lateArrivalDetails}
                      employeeName={emp.name}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {lateArrivalSummary.latePatternDistribution && (
        <div className="late-patterns">
          <h3>📊 Late Arrival Patterns</h3>
          <div className="pattern-distribution">
            {Object.entries(lateArrivalSummary.latePatternDistribution).map(([pattern, count]) => (
              <div key={pattern} className="pattern-item">
                <span className="pattern-name">{pattern}</span>
                <span className="pattern-count">{count} employees</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default LateArrivalAnalysis;