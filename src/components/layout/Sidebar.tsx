import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCircle,
  Wrench,
  CalendarDays,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  Car,
} from 'lucide-react';
import '../../styles/layout.css';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Garages', path: '/garages' },
  { icon: Users, label: 'Staff', path: '/staff' },
  { icon: UserCircle, label: 'Customers', path: '/customers' },
  { icon: Wrench, label: 'Services', path: '/services' },
  { icon: CalendarDays, label: 'Bookings', path: '/bookings' },
  { icon: CreditCard, label: 'Payments', path: '/payments' },
  { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Car style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text animate-fade-in">
            <h1>GMS</h1>
            <p>Garage Management</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="sidebar-nav-icon" />
              {!collapsed && (
                <span className="sidebar-nav-label animate-fade-in">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <Link to="/settings" className="sidebar-nav-item">
          <Settings className="sidebar-nav-icon" />
          {!collapsed && <span className="sidebar-nav-label">Settings</span>}
        </Link>
        <Link to="/login" className="sidebar-nav-item logout">
          <LogOut className="sidebar-nav-icon" />
          {!collapsed && <span className="sidebar-nav-label">Logout</span>}
        </Link>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
      >
        <ChevronLeft />
      </button>
    </aside>
  );
}
