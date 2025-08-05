import { useState } from 'react';
import Card from '../../UI/Card';
import Button from '../../UI/Button';
import LateDaysDropdown from './LateDaysDropdown';
import AbsentDaysDropdown from './AbsentDaysDropdown';
import HalfDaysDropdown from './HalfDaysDropdown';
import './Results.css';

/**
 * Results Section Component
 */
const Results = ({ 
  summary = null, 
  issues = [], 
  detailedAnalysis = null,
  onBackClick 
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (!summary) {
    return null;
  }

  // Find detailed information for the selected employee
  const getEmployeeDetails = (employeeId) => {
    const employeeIssue = issues.find(issue => issue.employee.id === employeeId);
    const summaryEmployee = summary.employees?.find(emp => emp.id === employeeId);
    
    return {
      summary: summaryEmployee,
      issues: employeeIssue?.issues || [],
      lateArrivalDetails: employeeIssue?.lateArrivalDetails,
      absentDetails: employeeIssue?.absentDetails,
      halfDayDetails: employeeIssue?.halfDayDetails
    };
  };

  const handleEmployeeClick = (employeeId) => {
    setSelectedEmployee(employeeId);
  };

  const handleBackToOverview = () => {
    setSelectedEmployee(null);
  };

  // Show individual employee detailed report
  if (selectedEmployee) {
    const employeeDetails = getEmployeeDetails(selectedEmployee);
    
    return (
      <div className="results-view">
        <header className="results-header">
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleBackToOverview}
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
                  <div className="employee-avatar">
                    👤
                  </div>
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
  }

  // Show main overview with employees section at the top
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
        <div className="results-system-header">
          <div className="system-badge">🏢 INN Department</div>
          <div className="system-badge">📅 Weekdays Only</div>
        </div>
        <h1>📊 INN Department Attendance Analysis</h1>
        <p className="results-subtitle">Weekdays-Only Processing (Monday-Friday)</p>
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

        {/* All Employees Overview - NOW AT THE TOP */}
        {summary.employees && summary.employees.length > 0 && (
          <Card className="employees-section" padding="large">
            <h2>👥 All Employees Overview</h2>
            <p className="employees-subtitle">Click on any employee card to view their detailed attendance report</p>
            <div className="employees-grid">
              {summary.employees.map((employee, index) => (
                <Card 
                  key={index} 
                  className="employee-card clickable" 
                  variant="secondary" 
                  padding="normal"
                  hover
                  onClick={() => handleEmployeeClick(employee.id)}
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
                  <div className="click-indicator">
                    <span>👆 Click to view detailed report</span>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Weekdays Only Notice */}
        <Card className="weekdays-notice" padding="medium">
          <div className="notice-content">
            <div className="notice-icon">📅</div>
            <div className="notice-text">
              <h3>Attendance Calculation Policy</h3>
              <p><strong>Monday to Friday Only:</strong> This analysis calculates attendance only for weekdays (Monday through Friday). Weekend days (Saturday and Sunday) are automatically excluded from all attendance calculations and statistics.</p>
              <div className="policy-details">
                <span className="weekday-badge">M T W Th F</span>
                <span className="calculation-text">Included in calculations</span>
                <span className="weekend-badge">Sat Sun</span>
                <span className="excluded-text">Excluded from calculations</span>
              </div>
            </div>
          </div>
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

        {/* Absence Analysis */}
        {detailedAnalysis?.absenceSummary && (
          <Card className="absence-analysis" padding="large">
            <h2>❌ Absence Analysis</h2>
            <div className="absent-stats-grid">
              <div className="absent-stat-card">
                <div className="metric">{detailedAnalysis.absenceSummary.totalEmployeesWithAbsences}</div>
                <div className="label">Employees with Absences</div>
              </div>
              <div className="absent-stat-card">
                <div className="metric">{detailedAnalysis.absenceSummary.totalAbsentDays}</div>
                <div className="label">Total Absent Days</div>
              </div>
              <div className="absent-stat-card">
                <div className="metric">{Math.round((detailedAnalysis.absenceSummary.totalAbsentDays / (22 * detailedAnalysis.absenceSummary.totalEmployeesWithAbsences)) * 100)}%</div>
                <div className="label">Avg Absence Rate</div>
              </div>
              <div className="absent-stat-card">
                <div className="metric">{Math.round(detailedAnalysis.absenceSummary.averageAbsentDaysPerEmployee)}</div>
                <div className="label">Avg Days/Employee</div>
              </div>
            </div>

            {detailedAnalysis.absenceSummary.topAbsentEmployees && detailedAnalysis.absenceSummary.topAbsentEmployees.length > 0 && (
              <div className="top-absent-employees">
                <h3>📊 Top Absent Employees</h3>
                <div className="absent-employees-list">
                  {detailedAnalysis.absenceSummary.topAbsentEmployees.map((emp, index) => (
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

            {detailedAnalysis.absenceSummary.absencePatternDistribution && (
              <div className="absence-patterns">
                <h3>📈 Absence Patterns</h3>
                <div className="pattern-distribution">
                  {Object.entries(detailedAnalysis.absenceSummary.absencePatternDistribution).map(([pattern, count]) => (
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

        {/* Half Day Analysis */}
        {detailedAnalysis?.halfDaySummary && (
          <Card className="halfday-analysis" padding="large">
            <h2>🕐 Half Day Analysis</h2>
            <div className="halfday-stats-grid">
              <div className="halfday-stat-card">
                <div className="metric">{detailedAnalysis.halfDaySummary.totalEmployeesWithHalfDays}</div>
                <div className="label">Employees with Half Days</div>
              </div>
              <div className="halfday-stat-card">
                <div className="metric">{detailedAnalysis.halfDaySummary.totalHalfDays}</div>
                <div className="label">Total Half Days</div>
              </div>
              <div className="halfday-stat-card">
                <div className="metric">{Math.round(detailedAnalysis.halfDaySummary.averageWorkHours * 10) / 10}h</div>
                <div className="label">Avg Work Hours</div>
              </div>
              <div className="halfday-stat-card">
                <div className="metric">{Math.round(detailedAnalysis.halfDaySummary.averageHalfDaysPerEmployee)}</div>
                <div className="label">Avg Half Days/Employee</div>
              </div>
            </div>

            {detailedAnalysis.halfDaySummary.topHalfDayEmployees && detailedAnalysis.halfDaySummary.topHalfDayEmployees.length > 0 && (
              <div className="top-halfday-employees">
                <h3>🕐 Top Half Day Employees</h3>
                <div className="halfday-employees-list">
                  {detailedAnalysis.halfDaySummary.topHalfDayEmployees.map((emp, index) => (
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

            {detailedAnalysis.halfDaySummary.halfDayReasonDistribution && (
              <div className="halfday-reasons">
                <h3>⏰ Half Day Reasons</h3>
                <div className="reason-distribution">
                  {Object.entries(detailedAnalysis.halfDaySummary.halfDayReasonDistribution).map(([reason, count]) => (
                    <div key={reason} className="reason-item">
                      <span className="reason-name">{reason}</span>
                      <span className="reason-count">{count} instances</span>
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
                      <span className="issue-count">{employeeIssue.issues.length} issues</span>                      {employeeIssue.lateArrivalDetails && employeeIssue.lateArrivalDetails.totalLateDays > 0 && (
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
                  </div>                  {/* Late Days Interactive Dropdown */}
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
        )}
      </div>
    </div>
  );
};

export default Results;