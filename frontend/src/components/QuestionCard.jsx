import React, { useState } from 'react';
import { Tag, HelpCircle, Eye, EyeOff } from 'lucide-react';

const QuestionCard = ({ question, index, total }) => {
  const [showHints, setShowHints] = useState(false);

  if (!question) return null;

  const categoryClass = `badge badge-${(question.category || 'mixed').toLowerCase().replace(' ', '')}`;
  const difficultyClass = `badge badge-${(question.difficulty || 'medium').toLowerCase()}`;

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={categoryClass}>{question.category}</span>
          <span className={difficultyClass}>{question.difficulty}</span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}>
            <Tag size={12} style={{ marginRight: '4px' }} />
            {question.role || 'General'}
          </span>
        </div>
        {typeof index === 'number' && typeof total === 'number' && (
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc' }}>
            Question {index + 1} of {total}
          </span>
        )}
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, color: '#f8fafc', marginBottom: '1rem' }}>
        {question.text}
      </h2>

      {question.idealPoints && question.idealPoints.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px border var(--border)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowHints(!showHints)}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            {showHints ? <EyeOff size={14} /> : <Eye size={14} />}
            {showHints ? 'Hide Target Key Points' : 'View Target Key Points'}
          </button>

          {showHints && (
            <div style={{ marginTop: '0.75rem', background: 'rgba(15,23,42,0.8)', padding: '0.85rem', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.4rem' }}>
                Ideal answer key points:
              </p>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                {question.idealPoints.map((pt, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
