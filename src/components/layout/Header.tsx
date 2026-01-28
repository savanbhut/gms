import { Bell, Search } from 'lucide-react';
import '../../styles/layout.css';
import '../../styles/components.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {

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

        {/* Notifications */}
        <button className="btn btn-ghost btn-icon notification-btn">
          <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
          <span className="notification-dot" />
        </button>

        {/* Profile (Static) */}
        <div className="header-user">
          <div className="avatar">{(localStorage.getItem('userName') || 'U')[0]}</div>
          <div className="header-user-info">
            <p>{localStorage.getItem('userName') || 'User'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
