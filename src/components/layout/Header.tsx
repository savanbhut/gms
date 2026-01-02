import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../../styles/layout.css';
import '../../styles/components.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="header">
      <div className="header-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-actions">
        {/* Search */}
        <div className="header-search">
          <div className="search-wrapper">
            <Search />
            <input
              type="text"
              placeholder="Search..."
              className="input"
            />
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="btn btn-ghost btn-icon"
          title="Toggle theme"
        >
          {isDark ? <Sun style={{ width: '1.25rem', height: '1.25rem' }} /> : <Moon style={{ width: '1.25rem', height: '1.25rem' }} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost btn-icon notification-btn">
          <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
          <span className="notification-dot" />
        </button>

        {/* Profile */}
        <div className="dropdown">
          <button
            className="header-user"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="avatar">{(localStorage.getItem('userName') || 'U')[0]}</div>
            <div className="header-user-info">
              <p>{localStorage.getItem('userName') || 'User'}</p>
            </div>
          </button>
          {showDropdown && (
            <div className="dropdown-content">
              <div className="dropdown-label">My Account</div>
              <div className="dropdown-divider" />
              <button className="dropdown-item">Profile</button>
              <button className="dropdown-item">Settings</button>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item"
                style={{ color: 'var(--color-destructive)' }}
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
