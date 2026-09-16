import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ active = true, onTick }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (active) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [active, onTick]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.85rem',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#6366f1',
      }}
    >
      <Clock size={16} />
      <span>{formatTime(seconds)}</span>
    </div>
  );
};

export default Timer;
