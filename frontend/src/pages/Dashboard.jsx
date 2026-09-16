import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Play, Award, CheckCircle2, AlertTriangle, ArrowRight, Calendar, Layers } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSessions: 0,
    avgScore: 0,
    weakCount: 0,
    topWeakness: '',
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [interviewsRes, progressRes] = await Promise.all([
          API.get('/interviews'),
          API.get('/progress'),
        ]);

        const sessions = interviewsRes.data || [];
        setRecentSessions(sessions.slice(0, 5));

        const progress = progressRes.data || {};
        const avgScore = progress.avgScores?.overall ? Math.round(progress.avgScores.overall * 10) : 0;
        const topWeak = progress.recurringWeaknesses?.[0]?.weakness || 'None recorded yet';

        setStats({
          totalSessions: progress.totalSessions || 0,
          avgScore,
          weakCount: progress.recurringWeaknesses?.length || 0,
          topWeakness: topWeak,
        });
      } catch (err) {
        console.error('[Dashboard] Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(30,41,59,0.9) 100%)',
          borderColor: 'rgba(99,102,241,0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
            Hello, {user?.name || 'Candidate'} 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Target Role: <strong style={{ color: '#a5b4fc' }}>{user?.targetRole || 'Software Engineer'}</strong> ({user?.experienceLevel || 'Entry-level'})
          </p>
        </div>
        <Link to="/categories" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
          <Play size={18} fill="#fff" />
          Start New Practice Session
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(79,70,229,0.15)', borderRadius: '12px', color: '#6366f1' }}>
            <Layers size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Completed Sessions
            </span>
            <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>{stats.totalSessions}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.15)', borderRadius: '12px', color: '#10b981' }}>
            <Award size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Average Overall Score
            </span>
            <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: stats.avgScore >= 70 ? '#34d399' : '#fbbf24' }}>
              {stats.avgScore} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ 100</span>
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.15)', borderRadius: '12px', color: '#f59e0b' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Top Focus Area
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fde68a', marginTop: '0.2rem' }}>
              {stats.topWeakness.length > 35 ? stats.topWeakness.substring(0, 35) + '...' : stats.topWeakness}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Recent Interview Sessions</h3>
          <Link to="/progress" style={{ color: '#818cf8', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            View Progress Trends <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8', padding: '1rem 0' }}>Loading interview history...</p>
        ) : recentSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(15,23,42,0.5)', borderRadius: '8px' }}>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>You haven't completed any interview sessions yet.</p>
            <Link to="/categories" className="btn btn-secondary">
              Start Your First Practice Session
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentSessions.map((session) => (
              <div
                key={session._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
                onClick={() => navigate(`/feedback/${session._id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`badge badge-${(session.category || 'mixed').toLowerCase().replace(' ', '')}`}>
                    {session.category}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                      {session.role || 'General'} Practice ({session.answers?.length || 0} questions)
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={12} /> {formatDate(session.completedAt || session.createdAt)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Score</span>
                    <strong style={{ fontSize: '1.1rem', color: session.overallScore >= 70 ? '#34d399' : '#fbbf24' }}>
                      {session.overallScore || 0}/100
                    </strong>
                  </div>
                  <ArrowRight size={18} style={{ color: '#94a3b8' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
