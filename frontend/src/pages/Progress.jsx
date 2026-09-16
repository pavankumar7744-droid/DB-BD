import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import ProgressChart from '../components/ProgressChart';
import { TrendingUp, AlertTriangle, Award, Layers, Target, CheckCircle2 } from 'lucide-react';

const Progress = () => {
  const [progressData, setProgressData] = useState({
    totalSessions: 0,
    scoreTrend: [],
    avgScores: {
      relevance: 0,
      clarity: 0,
      confidence: 0,
      communication: 0,
      overall: 0,
    },
    recurringWeaknesses: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await API.get('/progress');
        setProgressData(data);
      } catch (err) {
        console.error('[Progress] Failed to fetch progress analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        <p>Calculating performance statistics and trend analysis...</p>
      </div>
    );
  }

  const { totalSessions, scoreTrend, avgScores, recurringWeaknesses } = progressData;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <TrendingUp className="text-indigo-400" size={28} style={{ color: '#818cf8' }} />
          Performance & Score Progress
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Track score improvements across practice sessions and pinpoint recurring growth areas
        </p>
      </div>

      {/* Score Trend Chart Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
            Overall Score Trend (0 – 100)
          </h3>
          <span className="badge badge-mixed">
            {totalSessions} Completed Session{totalSessions !== 1 ? 's' : ''}
          </span>
        </div>
        <ProgressChart trend={scoreTrend} />
      </div>

      {/* Average Competency Scores Grid */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} style={{ color: '#6366f1' }} />
          Average Competency Breakdown (0 – 10 Scale)
        </h3>

        <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          <div className="score-pill">
            <span className="score-value high">{avgScores.relevance || 0}</span>
            <span className="score-label">Relevance</span>
          </div>
          <div className="score-pill">
            <span className="score-value high">{avgScores.clarity || 0}</span>
            <span className="score-label">Clarity</span>
          </div>
          <div className="score-pill">
            <span className="score-value mid">{avgScores.confidence || 0}</span>
            <span className="score-label">Confidence</span>
          </div>
          <div className="score-pill">
            <span className="score-value high">{avgScores.communication || 0}</span>
            <span className="score-label">Comm</span>
          </div>
          <div className="score-pill" style={{ borderColor: 'var(--primary)', background: 'rgba(79,70,229,0.15)' }}>
            <span className="score-value high">{avgScores.overall || 0}</span>
            <span className="score-label">Overall</span>
          </div>
        </div>
      </div>

      {/* Top 5 Recurring Weaknesses Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
          Top 5 Most Frequent Focus Areas
        </h3>

        {recurringWeaknesses.length === 0 ? (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
            No recurring weaknesses identified yet. Practice more questions to generate statistical AI weakness aggregation!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recurringWeaknesses.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: '#f1f5f9', fontWeight: 500 }}>
                    {item.weakness}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  Flagged {item.count} time{item.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
