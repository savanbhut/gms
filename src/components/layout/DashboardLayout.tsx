import { Sidebar } from './Sidebar';
import { Header } from './Header';
import '../../styles/layout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

import { useState } from 'react';

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-layout" style={{ display: 'flex' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`} style={{ flex: 1, minWidth: 0, marginLeft: collapsed ? '5rem' : '16rem', width: '100%' }}>
        <Header title={title} subtitle={subtitle} />
        <main>{children}</main>
      </div>
    </div>
  );
}
