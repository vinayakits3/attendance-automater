import Card from '../../UI/Card';

/**
 * Employee Overview Grid Component
 * Shows all employees in a clickable grid format
 */
const EmployeeOverview = ({ 
  employees, 
  onEmployeeClick 
}) => {
  if (!employees || employees.length === 0) {
    return null;
  }

  return (
    <Card className="employees-section" padding="large">
      <h2>👥 All Employees Overview</h2>
      <p className="employees-subtitle">Click on any employee card to view their detailed attendance report</p>
      <div className="employees-grid">
        {employees.map((employee, index) => (
          <Card 
            key={index} 
            className="employee-card clickable" 
            variant="secondary" 
            padding="normal"
            hover
            onClick={() => onEmployeeClick(employee.id)}
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
  );
};

export default EmployeeOverview;