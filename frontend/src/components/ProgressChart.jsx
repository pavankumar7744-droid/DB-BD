import React from 'react';

const ProgressChart = ({ trend = [] }) => {
  if (!trend || trend.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
        <p>No completed interview sessions yet. Complete your first session to see your progress chart!</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="chart-container">
        {trend.map((item, index) => {
          const heightPercent = Math.min(100, Math.max(10, item.overallScore || 0));
          let barColor = 'linear-gradient(180deg, #6366f1, #4338ca)';
          if (item.overallScore >= 80) {
            barColor = 'linear-gradient(180deg, #10b981, #059669)';
          } else if (item.overallScore < 50) {
            barColor = 'linear-gradient(180deg, #ef4444, #dc2626)';
          }

          return (
            <div key={item.sessionId || index} className="chart-bar-group">
              <div
                className="chart-bar"
                style={{
                  height: `${heightPercent}%`,
                  background: barColor,
                }}
                title={`Session #${index + 1} (${item.category}): ${item.overallScore}/100`}
              >
                <span className="chart-bar-val">{item.overallScore}</span>
              </div>
              <span className="chart-label">{formatDate(item.date)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
        <span>Earlier Sessions</span>
        <span>Latest Sessions</span>
      </div>
    </div>
  );
};

export default ProgressChart;
