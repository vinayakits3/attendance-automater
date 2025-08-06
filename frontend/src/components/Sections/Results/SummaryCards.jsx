import Card from '../../UI/Card';

/**
 * Summary Cards Component
 * Shows the main summary statistics at the top of the results
 */
const SummaryCards = ({ summary }) => {
  if (!summary) {
    return null;
  }

  return (
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
  );
};

export default SummaryCards;