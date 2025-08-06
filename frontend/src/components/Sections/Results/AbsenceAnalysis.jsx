import Card from '../../UI/Card';
import AbsentDaysDropdown from './AbsentDaysDropdown';

/**
 * Absence Analysis Component
 * Shows absence statistics and employee details
 */
const AbsenceAnalysis = ({ absenceSummary }) => {
  if (!absenceSummary) {
    return null;
  }

  return (
    <Card className="absence-analysis" padding="large">
      <h2>❌ Absence Analysis</h2>
      <div className="absent-stats-grid">
        <div className="absent-stat-card">
          <div className="metric">{absenceSummary.totalEmployeesWithAbsences}</div>
          <div className="label">Employees with Absences</div>
        </div>
        <div className="absent-stat-card">
          <div className="metric">{absenceSummary.totalAbsentDays}</div>
          <div className="label">Total Absent Days</div>
        </div>
        <div className="absent-stat-card">
          <div className="metric">{Math.round((absenceSummary.totalAbsentDays / (22 * absenceSummary.totalEmployeesWithAbsences)) * 100)}%</div>
          <div className="label">Avg Absence Rate</div>
        </div>
        <div className="absent-stat-card">
          <div className="metric">{Math.round(absenceSummary.averageAbsentDaysPerEmployee)}</div>
          <div className="label">Avg Days/Employee</div>
        </div>
      </div>

      {absenceSummary.topAbsentEmployees && absenceSummary.topAbsentEmployees.length > 0 && (
        <div className="top-absent-employees">
          <h3>📊 Top Absent Employees</h3>
          <div className="absent-employees-list">
            {absenceSummary.topAbsentEmployees.map((emp, index) => (
              <div key={index} className="absent-employee-card">
                <div className="employee-rank">#{index + 1}</div>
                <div className="employee-info">
                  <div className="employee-name">{emp.name}</div>
                  <div className="employee-id">ID: {emp.id}</div>
                </div>
                <div className="absent-stats">
                  <div className="stat">
                    <span className="stat-value">{emp.absentDays}</span>
                    <span className="stat-label">Absent Days</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{emp.absenceRate}%</span>
                    <span className="stat-label">Absence Rate</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{emp.pattern}</span>
                    <span className="stat-label">Pattern</span>
                  </div>
                </div>
                {/* Interactive Absent Days Details */}
                {emp.absentDetails && (
                  <div className="employee-absent-details">
                    <AbsentDaysDropdown 
                      absentDetails={emp.absentDetails}
                      employeeName={emp.name}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {absenceSummary.absencePatternDistribution && (
        <div className="absence-patterns">
          <h3>📈 Absence Patterns</h3>
          <div className="pattern-distribution">
            {Object.entries(absenceSummary.absencePatternDistribution).map(([pattern, count]) => (
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

export default AbsenceAnalysis;