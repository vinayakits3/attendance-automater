import Card from '../../UI/Card';
import Button from '../../UI/Button';
import './Results.css';

/**
 * Results Section Component
 */
const const Results = ({ 
  summary = null, 
  issues = [], 
  detailedAnalysis = null,
  onBackClick 
}) => {
  if (!summary) {
    return null;
  }

  return (
    <div className="results-view">
      <header className="results-header">
        <Button 
          variant="outline" 
          size="small" 
          onClick={onBackClick}
          className="btn-back"
        >
          ← Back to Upload
        </Button>
        <h1>📊 Detailed Attendance Analysis Results</h1>
      </header>

      <div className="results-content">
        {/* Main Summary Cards */}
        <Card className="results-summary" padding="large">
          <h2>📈 Overall Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="metric">{summary.totalEmployees}</div>
              <div className="label">Total Employees</div>
            </div>
            <div className="summary-card good">
              <div className="metric">{summary.employeesWithoutIssues}</div>
              <div className="label">No Issues</div>
            </div>
            <div className="summary-card warning">
              <div className="metric">{summary.employeesWithIssues}</div>
              <div className="label">With Issues</div>
            </div>
            <div className="summary-card danger">
              <div className="metric">{summary.totalIssues}</div>
              <div className="label">Total Issues</div>
            </div>
          </div>

          {summary.issueBreakdown && (
            <div className="issue-breakdown">
              <h3>Issue Breakdown</h3>
              <div className="breakdown-items">
                <div className="breakdown-item">
                  <span className="severity-high">🔴 High Severity:</span>
                  <span>{summary.issueBreakdown.highSeverity}</span>
                </div>
                <div className="breakdown-item">
                  <span className="severity-medium">🟡 Medium Severity:</span>
                  <span>{summary.issueBreakdown.mediumSeverity}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Late Arrival Analysis */}
        {detailedAnalysis?.lateArrivalSummary && (
          <Card className="late-arrival-analysis" padding="large">
            <h2>⏰ Late Arrival Analysis</h2>
            <div className="late-stats-grid">
              <div className="late-stat-card">
                <div className="metric">{detailedAnalysis.lateArrivalSummary.totalEmployeesWithLateArrivals}</div>
                <div className="label">Employees with Late Arrivals</div>
              </div>
              <div className="late-stat-card">
                <div className="metric">{detailedAnalysis.lateArrivalSummary.totalLateDays}</div>
                <div className="label">Total Late Days</div>
              </div>
              <div className="late-stat-card">
                <div className="metric">{Math.round(detailedAnalysis.lateArrivalSummary.totalLateMinutes / 60)}h</div>
                <div className="label">Total Late Hours</div>
              </div>
              <div className="late-stat-card">
                <div className="metric">{Math.round(detailedAnalysis.lateArrivalSummary.totalLateMinutes / detailedAnalysis.lateArrivalSummary.totalLateDays)}m</div>
                <div className="label">Avg Late Minutes/Day</div>
              </div>
            </div>

            {detailedAnalysis.lateArrivalSummary.topLateEmployees.length > 0 && (
              <div className="top-late-employees">
                <h3>🏆 Top Late Employees</h3>
                <div className="late-employees-list">
                  {detailedAnalysis.lateArrivalSummary.topLateEmployees.map((emp, index) => (
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailedAnalysis.lateArrivalSummary.latePatternDistribution && (
              <div className="late-patterns">
                <h3>📊 Late Arrival Patterns</h3>
                <div className="pattern-distribution">
                  {Object.entries(detailedAnalysis.lateArrivalSummary.latePatternDistribution).map(([pattern, count]) => (
                    <div key={pattern} className="pattern-item">
                      <span className="pattern-name">{pattern}</span>
                      <span className="pattern-count">{count} employees</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Daily Breakdown */}
        {detailedAnalysis?.dailyAttendanceBreakdown && (
          <Card className="daily-breakdown" padding="large">
            <h2>📅 Daily Attendance Breakdown</h2>
            <div className="daily-breakdown-table">
              <div className="table-header">
                <div>Day</div>
                <div>Present</div>
                <div>Absent</div>
                <div>Late</div>
                <div>Late Minutes</div>
                <div>Issues</div>
              </div>
              {detailedAnalysis.dailyAttendanceBreakdown.slice(0, 15).map((day) => (
                <div key={day.day} className="table-row">
                  <div className="day-cell">{day.day}</div>
                  <div className="present-cell">{day.presentEmployees}</div>
                  <div className="absent-cell">{day.absentEmployees}</div>
                  <div className="late-cell">{day.lateEmployees}</div>
                  <div className="late-minutes-cell">{day.totalLateMinutes}m</div>
                  <div className="issues-cell">{day.issues.length}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Punctuality Ranking */}
        {detailedAnalysis?.attendancePatterns?.punctualityRanking && (
          <Card className="punctuality-ranking" padding="large">
            <h2>🎯 Punctuality Ranking</h2>
            <div className="ranking-list">
              {detailedAnalysis.attendancePatterns.punctualityRanking.slice(0, 10).map((emp, index) => (
                <div key={index} className={`ranking-item ${index < 3 ? 'top-performer' : ''}`}>
                  <div className="rank">#{index + 1}</div>
                  <div className="employee-details">
                    <div className="name">{emp.name}</div>
                    <div className="id">ID: {emp.id}</div>
                  </div>
                  <div className="punctuality-score">
                    <div className="score">{emp.punctualityScore}%</div>
                    <div className="score-details">
                      {emp.punctualDays}/{emp.workingDays} punctual days
                    </div>
                  </div>
                  <div className="late-info">
                    <span className="late-days">{emp.lateDays} late days</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Detailed Issues */}
        {issues && issues.length > 0 && (
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
                    </div>
                  </div>
                  
                  {/* Late Days Detail */}
                  {employeeIssue.lateArrivalDetails && employeeIssue.lateArrivalDetails.lateDays.length > 0 && (
                    <div className="late-days-detail">
                      <h4>📍 Late Arrival Days:</h4>
                      <div className="late-days-grid">
                        {employeeIssue.lateArrivalDetails.lateDays.map((lateDay, dayIndex) => (
                          <div key={dayIndex} className="late-day-item">
                            <span className="day">Day {lateDay.day}</span>
                            <span className="time">Arrived: {lateDay.arrivalTime}</span>
                            <span className="late-minutes">{lateDay.lateMinutes}m late</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
        )}

        {/* Employee Overview */}
        {summary.employees && summary.employees.length > 0 && (
          <Card className="employees-section" padding="large">
            <h2>📋 All Employees Overview</h2>
            <div className="employees-grid">
              {summary.employees.map((employee, index) => (
                <Card 
                  key={index} 
                  className="employee-card" 
                  variant="secondary" 
                  padding="normal"
                  hover
                >
                  <div className="employee-name">
                    👤 {employee.name}
                  </div>
                  <div className="employee-id">ID: {employee.id}</div>
                  <div className="employee-stats">
                    <div className="stat-item">
                      <span>✅ Present:</span>
                      <span>{employee.present}</span>
                    </div>
                    <div className="stat-item">
                      <span>❌ Absent:</span>
                      <span>{employee.absent}</span>
                    </div>
                    <div className="stat-item">
                      <span>⏰ Late Days:</span>
                      <span className={employee.lateCount > 0 ? 'has-issues' : 'no-issues'}>
                        {employee.lateCount}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span>🕒 Late Minutes:</span>
                      <span className={employee.lateMinutesTotal > 0 ? 'has-issues' : 'no-issues'}>
                        {employee.lateMinutesTotal}m
                      </span>
                    </div>
                    <div className="stat-item">
                      <span>⚠️ Issues:</span>
                      <span className={employee.hasIssues ? 'has-issues' : 'no-issues'}>
                        {employee.hasIssues ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
          ← Back to Upload
        </Button>
        <h1>📊 Attendance Analysis Results</h1>
      </header>

      <div className="results-content">
        {/* Summary Cards */}
        <Card className="results-summary" padding="large">
          <div className="summary-grid">
            <div className="summary-card">
              <div className="metric">{summary.totalEmployees}</div>
              <div className="label">Total Employees</div>
            </div>
            <div className="summary-card good">
              <div className="metric">{summary.employeesWithoutIssues}</div>
              <div className="label">No Issues</div>
            </div>
            <div className="summary-card warning">
              <div className="metric">{summary.employeesWithIssues}</div>
              <div className="label">With Issues</div>
            </div>
            <div className="summary-card danger">
              <div className="metric">{summary.totalIssues}</div>
              <div className="label">Total Issues</div>
            </div>
          </div>

          {summary.issueBreakdown && (
            <div className="issue-breakdown">
              <h3>Issue Breakdown</h3>
              <div className="breakdown-items">
                <div className="breakdown-item">
                  <span className="severity-high">🔴 High Severity:</span>
                  <span>{summary.issueBreakdown.highSeverity}</span>
                </div>
                <div className="breakdown-item">
                  <span className="severity-medium">🟡 Medium Severity:</span>
                  <span>{summary.issueBreakdown.mediumSeverity}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Detailed Issues */}
        {issues && issues.length > 0 && (
          <Card className="issues-section" padding="large">
            <h2>🔍 Detailed Issues</h2>
            <div className="issues-list">
              {issues.map((employeeIssue, index) => (
                <div key={index} className="employee-issues">
                  <div className="employee-header">
                    <h3>
                      👤 {employeeIssue.employee.name} (ID: {employeeIssue.employee.id})
                    </h3>
                    <div className="issue-count">
                      {employeeIssue.issues.length} issues
                    </div>
                  </div>
                  
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
        )}

        {/* Employee Overview */}
        {summary.employees && summary.employees.length > 0 && (
          <Card className="employees-section" padding="large">
            <h2>📋 All Department Employees</h2>
            <div className="employees-grid">
              {summary.employees.map((employee, index) => (
                <Card 
                  key={index} 
                  className="employee-card" 
                  variant="secondary" 
                  padding="normal"
                  hover
                >
                  <div className="employee-name">
                    👤 {employee.name}
                  </div>
                  <div className="employee-id">ID: {employee.id}</div>
                  <div className="employee-stats">
                    <div className="stat-item">
                      <span>✅ Present:</span>
                      <span>{employee.present}</span>
                    </div>
                    <div className="stat-item">
                      <span>❌ Absent:</span>
                      <span>{employee.absent}</span>
                    </div>
                    <div className="stat-item">
                      <span>⚠️ Issues:</span>
                      <span className={employee.hasIssues ? 'has-issues' : 'no-issues'}>
                        {employee.hasIssues ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Results;
