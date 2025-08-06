import Card from '../../UI/Card';

/**
 * Punctuality Ranking Component
 * Shows punctuality ranking of employees
 */
const PunctualityRanking = ({ punctualityRanking }) => {
  if (!punctualityRanking || punctualityRanking.length === 0) {
    return null;
  }

  return (
    <Card className="punctuality-ranking" padding="large">
      <h2>🎯 Punctuality Ranking</h2>
      <div className="ranking-list">
        {punctualityRanking.slice(0, 10).map((emp, index) => (
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
  );
};

export default PunctualityRanking;