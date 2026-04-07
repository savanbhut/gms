import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search } from 'lucide-react';
import { ProfileDialog } from './ProfileDialog';
import '../../styles/layout.css';
import '../../styles/components.css';
import '../../styles/notifications.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const uid = localStorage.getItem('userUid');
    const role = localStorage.getItem('userRole');
    
    if (uid && role) {
      if (role === 'admin' || role === 'manager' || role === 'customer' || role === 'receptionist') {
        fetch(`http://localhost:5000/api/notifications/${uid}/${role}`)
          .then(res => res.json())
          .then(data => setNotifications(data || []))
          .catch(err => console.error("Error fetching notifications", err));
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-actions">
        {/* Search */}


        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            className="btn btn-ghost btn-icon notification-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
            {notifications.length > 0 && <span className="notification-dot" style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, backgroundColor: 'red', borderRadius: '50%' }} />}
          </button>
          
          {isNotifOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {notifications.length} New
                  </span>
                )}
              </div>
              
              <ul className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <li key={notif.id} className="notification-item">
                      <p className="notification-title">{notif.title}</p>
                      <p className="notification-message">{notif.message}</p>
                      <p className="notification-time">{new Date(notif.time).toLocaleString()}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Profile (Clickable) */}
        <div
          className="header-user clickable"
          onClick={() => setIsProfileOpen(true)}
          title="Edit Profile"
          style={{ cursor: 'pointer' }}
        >
          <div className="avatar">{(localStorage.getItem('userName') || 'U')[0]}</div>
          <div className="header-user-info">
            <p>{localStorage.getItem('userName') === 'Manager John' ? 'Manager' : (localStorage.getItem('userName') || 'User')}</p>
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
