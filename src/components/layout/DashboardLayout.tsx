import { Sidebar } from './Sidebar';
import { Header } from './Header';
import '../../styles/layout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Header title={title} subtitle={subtitle} />
        <main>{children}</main>
      </div>
    </div>
  );
}
