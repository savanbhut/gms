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
  ChevronDown,
  BarChart3,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { useEffect } from 'react';
import '../../styles/layout.css';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Garage', path: '/garages' },
  { icon: Users, label: 'Staff', path: '/staff' },
  { icon: UserCircle, label: 'Customers', path: '/customers' },
  { icon: Wrench, label: 'Services', path: '/services' },
  { icon: CalendarDays, label: 'Bookings', path: '/bookings' },
  { icon: CreditCard, label: 'Payments', path: '/payments' },
  { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

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
        {menuItems.filter(item => {
          const role = localStorage.getItem('userRole');

          if (role === 'customer') {
            return ['/services', '/bookings', '/payments', '/feedback'].includes(item.path);
          }

          if (role === 'manager') {
            // Managers can't access Garages or Reports
            return item.path !== '/garages' && item.path !== '/reports';
          }

          // Admins see everything
          return true;
        }).map((item) => {
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
        <Collapsible
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <button className="sidebar-nav-item w-full flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Settings className="sidebar-nav-icon" />
                {!collapsed && <span className="sidebar-nav-label">Settings</span>}
              </div>
              {!collapsed && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isSettingsOpen ? "rotate-180" : ""
                    }`}
                />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="sidebar-sub-menu space-y-1">
            {!collapsed && (
              <div className="ml-9 mt-1 flex flex-col gap-1 border-l border-border/50 pl-2">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-gray-300 hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Theme</span>
                  <span className="text-xs font-medium">{isDark ? "Dark" : "Light"}</span>
                </button>
                <button
                  onClick={() => setShowPasswordDialog(true)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-gray-300 hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Change Password</span>
                </button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="sidebar-nav-item logout"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <LogOut className="sidebar-nav-icon" />
          {!collapsed && <span className="sidebar-nav-label">Logout</span>}
        </button>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
      >
        <ChevronLeft />
      </button>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </aside>
  );
}
