import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import FeedbackCard from '../components/FeedbackCard';
import { Award, ArrowLeft, RefreshCw, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

const FeedbackResult = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSessionFeedback = async () => {
      try {
        const { data } = await API.get(`/interviews/${sessionId}`);
        setSession(data);
      } catch (err) {
        console.error('[FeedbackResult] Error fetching session results:', err);
        setErrorMsg('Failed to load session results');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionFeedback();
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        <p>Loading session evaluation summary...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Session Results Not Found</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const overallScore = session.overallScore || 0;
  const isHigh = overallScore >= 75;
  const isMid = overallScore >= 50;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))',
          borderColor: isHigh ? '#10b981' : isMid ? '#f59e0b' : '#ef4444',
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
        }}
      >
        <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(79,70,229,0.15)', borderRadius: '50%', marginBottom: '1rem' }}>
          <Award size={42} style={{ color: isHigh ? '#34d399' : '#818cf8' }} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
          Interview Session Summary
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Category: <strong>{session.category}</strong> • Role Focus: <strong>{session.role || 'General'}</strong>
        </p>

        {/* Overall Score Circle */}
        <div style={{ margin: '1.75rem auto 1rem', width: '120px', height: '120px', borderRadius: '50%', border: `4px solid ${isHigh ? '#10b981' : isMid ? '#f59e0b' : '#ef4444'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.8)' }}>
          <span style={{ fontSize: '2.25rem', fontWeight: 800, color: isHigh ? '#34d399' : isMid ? '#fbbf24' : '#f87171' }}>
            {overallScore}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>out of 100</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <Link to="/categories" className="btn btn-primary">
            <RefreshCw size={18} /> Practice Again
          </Link>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Proctoring Analysis Card (If Enabled) */}
      {session.proctoring?.enabled && (
        <div className="card" style={{ background: 'rgba(15, 23, 42, 0.8)', borderColor: '#6366f1' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} style={{ color: '#34d399' }} />
            AI Proctoring & Integrity Report
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div className="score-pill">
              <span className="score-value high">{session.proctoring.proctorScore}%</span>
              <span className="score-label">Integrity Score</span>
            </div>
            <div className="score-pill">
              <span className="score-value high">{session.proctoring.eyeContactPercent}%</span>
              <span className="score-label">Eye Contact</span>
            </div>
            <div className="score-pill">
              <span className="score-value high">{session.proctoring.faceInFramePercent}%</span>
              <span className="score-label">Face In Frame</span>
            </div>
          </div>

          {session.proctoring.flags && session.proctoring.flags.length > 0 ? (
            <div style={{ marginTop: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171', display: 'block', marginBottom: '0.3rem' }}>
                Proctoring Flags Recorded ({session.proctoring.warningCount}):
              </span>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#fde68a' }}>
                {session.proctoring.flags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>
              ✓ Outstanding attention and focus maintained! Zero integrity warnings logged.
            </p>
          )}
        </div>
      )}

      {/* Breakdown per question */}
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', marginTop: '1rem' }}>
        Per-Question Detailed Breakdown
      </h2>

      {session.answers?.map((ans, idx) => {
        const qObj = ans.question || {};
        const fbObj = ans.feedback || {};

        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Question & Candidate Answer */}
            <div className="card" style={{ background: 'rgba(15, 23, 42, 0.7)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-mixed">Question {idx + 1}</span>
                {ans.responseTimeSeconds > 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> Response Time: {ans.responseTimeSeconds}s
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
                {qObj.text || 'Question Prompt'}
              </h3>

              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', display: 'block', marginBottom: '0.3rem' }}>
                  Your Submitted Answer:
                </span>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', whiteSpace: 'pre-line' }}>
                  {ans.userAnswer || '(No answer recorded)'}
                </p>
              </div>
            </div>

            {/* AI Feedback Card */}
            <FeedbackCard feedback={fbObj} />
          </div>
        );
      })}
    </div>
  );
};

export default FeedbackResult;
