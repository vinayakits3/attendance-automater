import Card from '../../UI/Card';

/**
 * Weekdays Notice Component
 * Shows the attendance calculation policy notice
 */
const WeekdaysNotice = () => {
  return (
    <Card className="weekdays-notice" padding="medium">
      <div className="notice-content">
        <div className="notice-icon">📅</div>
        <div className="notice-text">
          <h3>Attendance Calculation Policy</h3>
          <p>
            <strong>Monday to Friday Only:</strong> This analysis calculates attendance only for weekdays (Monday through Friday). Weekend days (Saturday and Sunday) are automatically excluded from all attendance calculations and statistics.
          </p>
          <div className="policy-details">
            <span className="weekday-badge">M T W Th F</span>
            <span className="calculation-text">Included in calculations</span>
            <span className="weekend-badge">Sat Sun</span>
            <span className="excluded-text">Excluded from calculations</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeekdaysNotice;