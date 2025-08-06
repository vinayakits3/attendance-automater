import Card from '../../UI/Card';

/**
 * Daily Breakdown Component
 * Shows daily attendance breakdown table
 */
const DailyBreakdown = ({ dailyAttendanceBreakdown }) => {
  if (!dailyAttendanceBreakdown || dailyAttendanceBreakdown.length === 0) {
    return null;
  }

  return (
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
        {dailyAttendanceBreakdown.slice(0, 15).map((day) => (
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
  );
};

export default DailyBreakdown;