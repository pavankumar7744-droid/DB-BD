import React from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles, Award } from 'lucide-react';

const FeedbackCard = ({ feedback }) => {
  if (!feedback) return null;

  const { scores = {}, strengths = [], weaknesses = [], suggestions = [], improvedAnswerExample = '' } = feedback;

  const getScoreColorClass = (val) => {
    if (val >= 8) return 'high';
    if (val >= 5) return 'mid';
    return 'low';
  };

  return (
    <div className="card" style={{ borderColor: 'rgba(99, 102, 241, 0.5)', background: '#1e293b' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', fontWeight: 700 }}>
          <Sparkles className="text-indigo-400" size={20} style={{ color: '#818cf8' }} />
          AI Feedback & Evaluation
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(79, 70, 229, 0.2)', padding: '0.3rem 0.75rem', borderRadius: '15px' }}>
          <Award size={16} style={{ color: '#a5b4fc' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc' }}>
            Overall: {scores.overall || 0}/10
          </span>
        </div>
      </div>

      {/* 5 Dimension Score Pills */}
      <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="score-pill">
          <span className={`score-value ${getScoreColorClass(scores.relevance || 0)}`}>
            {scores.relevance || 0}
          </span>
          <span className="score-label">Relevance</span>
        </div>
        <div className="score-pill">
          <span className={`score-value ${getScoreColorClass(scores.clarity || 0)}`}>
            {scores.clarity || 0}
          </span>
          <span className="score-label">Clarity</span>
        </div>
        <div className="score-pill">
          <span className={`score-value ${getScoreColorClass(scores.confidence || 0)}`}>
            {scores.confidence || 0}
          </span>
          <span className="score-label">Confidence</span>
        </div>
        <div className="score-pill">
          <span className={`score-value ${getScoreColorClass(scores.communication || 0)}`}>
            {scores.communication || 0}
          </span>
          <span className="score-label">Comm</span>
        </div>
        <div className="score-pill" style={{ borderColor: 'var(--primary)' }}>
          <span className={`score-value ${getScoreColorClass(scores.overall || 0)}`}>
            {scores.overall || 0}
          </span>
          <span className="score-label">Overall</span>
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="feedback-section" style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={16} /> Key Strengths
          </h4>
          <ul className="feedback-list">
            {strengths.map((item, i) => (
              <li key={i} className="feedback-item strength">
                <span>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="feedback-section" style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertTriangle size={16} /> Areas for Improvement
          </h4>
          <ul className="feedback-list">
            {weaknesses.map((item, i) => (
              <li key={i} className="feedback-item weakness">
                <span>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="feedback-section" style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lightbulb size={16} /> Actionable Tips
          </h4>
          <ul className="feedback-list">
            {suggestions.map((item, i) => (
              <li key={i} className="feedback-item suggestion">
                <span>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved Answer Example */}
      {improvedAnswerExample && (
        <div className="improved-box">
          <h4>
            <Sparkles size={16} /> Stronger Example Response:
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
            {improvedAnswerExample}
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
