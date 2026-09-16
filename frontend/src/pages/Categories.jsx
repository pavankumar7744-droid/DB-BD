import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Play, Sliders, Check, Layers } from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('Mixed');
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [numQuestions, setNumQuestions] = useState(5);
  const [proctoringEnabled, setProctoringEnabled] = useState(false);

  const [categoriesList, setCategoriesList] = useState([
    'Technical',
    'Behavioral',
    'HR',
    'System Design',
    'Mixed',
  ]);
  const [rolesList, setRolesList] = useState([
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
  ]);

  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const { data } = await API.get('/questions/meta/filters');
        if (data.categories) setCategoriesList(data.categories);
        if (data.roles) setRolesList(data.roles);
      } catch (err) {
        console.error('[Categories] Failed to load metadata filters:', err);
      }
    };

    fetchFilters();
  }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setStarting(true);
    setErrorMsg('');

    try {
      const { data: session } = await API.post('/interviews/start', {
        category: selectedCategory,
        role: selectedRole,
        numQuestions: Number(numQuestions),
        proctoringEnabled,
      });

      navigate(`/session/${session._id}`, {
        state: { session },
      });
    } catch (err) {
      console.error('[Categories] Failed to start interview:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to initialize session. Please check backend connection.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '1rem auto 0', width: '100%' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(79,70,229,0.15)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Sliders size={32} style={{ color: '#6366f1' }} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff' }}>
            Configure Interview Session
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Customize category, role target, and number of practice questions
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleStartInterview}>
          {/* Category Chip Selector */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem' }}>
              Select Interview Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '30px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      background: isSelected
                        ? 'linear-gradient(135deg, #6366f1, #4338ca)'
                        : 'rgba(15, 23, 42, 0.7)',
                      color: isSelected ? '#fff' : '#94a3b8',
                      border: isSelected ? '1px solid #818cf8' : '1px solid var(--border)',
                      boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                      transition: 'var(--transition)',
                    }}
                  >
                    {isSelected && <Check size={16} />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {/* Target Role Dropdown */}
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="General">General / Any Role</option>
                {rolesList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Count Input */}
            <div className="form-group">
              <label className="form-label">Number of Questions (1 – 10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                required
              />
            </div>
          </div>

          {/* AI Proctoring Opt-In Toggle */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: proctoringEnabled ? 'rgba(79, 70, 229, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              border: proctoringEnabled ? '1px solid #818cf8' : '1px solid var(--border)',
              borderRadius: '10px',
              marginBottom: '2rem',
              transition: 'var(--transition)',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'block' }}>
                  Enable AI Video & Attention Proctoring (Optional)
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                  Monitors eye contact, head orientation, and focus via webcam. Only enabled if you check this box.
                </span>
              </div>
              <input
                type="checkbox"
                checked={proctoringEnabled}
                onChange={(e) => setProctoringEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Session Summary Card */}
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              marginBottom: '2rem',
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '0.5rem' }}>
              Session Overview:
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>• <strong>Category:</strong> {selectedCategory}</li>
              <li>• <strong>Role Focus:</strong> {selectedRole}</li>
              <li>• <strong>Questions Count:</strong> {numQuestions} questions</li>
              <li>• <strong>AI Engine:</strong> Gemini API real-time evaluation</li>
            </ul>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            disabled={starting}
          >
            <Play size={20} fill="#fff" />
            {starting ? 'Initializing Session...' : 'Start Interview Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Categories;
