import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LayoutDashboard, PlayCircle, TrendingUp, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-logo">
          <Sparkles className="w-6 h-6 text-indigo-500" style={{ color: '#6366f1' }} />
          Intteree<span>AI</span>
        </Link>

        {isAuthenticated ? (
          <nav>
            <ul className="nav-links">
              <li>
                <Link
                  to="/"
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={18} style={{ display: 'inline', marginRight: '6px' }} />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}
                >
                  <PlayCircle size={18} style={{ display: 'inline', marginRight: '6px' }} />
                  New Session
                </Link>
              </li>
              <li>
                <Link
                  to="/progress"
                  className={`nav-link ${location.pathname === '/progress' ? 'active' : ''}`}
                >
                  <TrendingUp size={18} style={{ display: 'inline', marginRight: '6px' }} />
                  Progress
                </Link>
              </li>
              <li className="user-badge">
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</span>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  style={{ background: 'transparent', color: '#94a3b8', marginLeft: '6px' }}
                >
                  <LogOut size={16} />
                </button>
              </li>
            </ul>
          </nav>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
