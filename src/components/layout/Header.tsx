import React from 'react';
import { Bell, Search } from 'lucide-react';
import { ProfileDialog } from './ProfileDialog';
import '../../styles/layout.css';
import '../../styles/components.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return (
    <header className="header">
      <div className="header-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-actions">
        {/* Search */}


        {/* Notifications */}
        <button className="btn btn-ghost btn-icon notification-btn">
          <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
          <span className="notification-dot" />
        </button>

        {/* Profile (Clickable) */}
        <div
          className="header-user clickable"
          onClick={() => setIsProfileOpen(true)}
          title="Edit Profile"
          style={{ cursor: 'pointer' }}
        >
          <div className="avatar">{(localStorage.getItem('userName') || 'U')[0]}</div>
          <div className="header-user-info">
            <p>{localStorage.getItem('userName') || 'User'}</p>
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </header>
  );
}
