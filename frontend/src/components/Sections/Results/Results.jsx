import { useState } from 'react';
import Button from '../../UI/Button';
import IndividualEmployeeReport from './IndividualEmployeeReport';
import SummaryCards from './SummaryCards';
import EmployeeOverview from './EmployeeOverview';
import WeekdaysNotice from './WeekdaysNotice';
import LateArrivalAnalysis from './LateArrivalAnalysis';
import AbsenceAnalysis from './AbsenceAnalysis';
import HalfDayAnalysis from './HalfDayAnalysis';
import DailyBreakdown from './DailyBreakdown';
import PunctualityRanking from './PunctualityRanking';
import DetailedIssues from './DetailedIssues';
import './Results.css';

/**
 * Main Results Section Component
 * Orchestrates all the different analysis sections and handles navigation
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
      <IndividualEmployeeReport
        employeeDetails={employeeDetails}
        onBackToOverview={handleBackToOverview}
      />
    );
  }

  // Show main overview with all sections
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
        <SummaryCards summary={summary} />

        {/* All Employees Overview - AT THE TOP */}
        <EmployeeOverview 
          employees={summary.employees}
          onEmployeeClick={handleEmployeeClick}
        />

        {/* Weekdays Only Notice */}
        <WeekdaysNotice />

        {/* Late Arrival Analysis */}
        <LateArrivalAnalysis 
          lateArrivalSummary={detailedAnalysis?.lateArrivalSummary}
        />

        {/* Absence Analysis */}
        <AbsenceAnalysis 
          absenceSummary={detailedAnalysis?.absenceSummary}
        />

        {/* Half Day Analysis */}
        <HalfDayAnalysis 
          halfDaySummary={detailedAnalysis?.halfDaySummary}
        />

        {/* Daily Breakdown */}
        <DailyBreakdown 
          dailyAttendanceBreakdown={detailedAnalysis?.dailyAttendanceBreakdown}
        />

        {/* Punctuality Ranking */}
        <PunctualityRanking 
          punctualityRanking={detailedAnalysis?.attendancePatterns?.punctualityRanking}
        />

        {/* Detailed Issues */}
        <DetailedIssues issues={issues} />
      </div>
    </div>
  );
};

export default Results;