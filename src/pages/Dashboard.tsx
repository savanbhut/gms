import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { dashboardStats, mockBookings, mockFeedback } from '@/data/mockData';
import { CalendarDays, Users, Clock, CheckCircle, TrendingUp, Star } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Booking, Feedback } from '@/types/gms';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default' 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ style?: React.CSSProperties }>; 
  trend?: { value: number; isPositive: boolean }; 
  variant?: 'default' | 'primary' | 'success' | 'warning' 
}) {
  const variantClass = variant === 'primary' ? 'stat-card-primary' : 
                       variant === 'success' ? 'stat-card-success' : 
                       variant === 'warning' ? 'stat-card-warning' : '';
  
  return (
    <div className={`stat-card ${variantClass}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p className="stat-title">{title}</p>
          <p className="stat-value">{value}</p>
          {trend && (
            <p className="stat-trend" style={{ color: trend.isPositive ? 'var(--color-success)' : 'var(--color-error)' }}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="stat-icon" style={{ 
          backgroundColor: variant === 'default' ? 'var(--color-muted)' : 'rgba(255,255,255,0.2)',
          padding: '0.75rem',
          borderRadius: '0.75rem'
        }}>
          <Icon style={{ width: '1.5rem', height: '1.5rem' }} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getClass = () => {
    switch (status) {
      case 'Completed': case 'Success': case 'Active': return 'badge badge-success';
      case 'Pending': return 'badge badge-warning';
      case 'In Progress': return 'badge badge-info';
      case 'Cancelled': case 'Failed': case 'Inactive': return 'badge badge-error';
      default: return 'badge badge-default';
    }
  };
  return <span className={getClass()}>{status}</span>;
}

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back, Rajesh!">
      {/* Stats Grid */}
      <div className="page-grid page-grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Bookings"
          value={dashboardStats.totalBookings}
          icon={CalendarDays}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Pending Bookings"
          value={dashboardStats.pendingBookings}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Completed Today"
          value={dashboardStats.completedToday}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${dashboardStats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Secondary Stats */}
      <div className="page-grid page-grid-2" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Active Customers"
          value={dashboardStats.activeCustomers}
          icon={Users}
        />
        <StatCard
          title="Active Staff"
          value={dashboardStats.activeStaff}
          icon={Users}
        />
      </div>

      {/* Recent Data */}
      <div className="page-grid page-grid-2">
        {/* Recent Bookings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Bookings</h3>
            <p className="card-description">Latest service appointments</p>
          </div>
          <div className="card-content">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBookings.slice(0, 4).map((booking: Booking) => (
                    <tr key={booking.bid}>
                      <td>{booking.customerName}</td>
                      <td>{booking.serviceName}</td>
                      <td>{booking.date}</td>
                      <td><StatusBadge status={booking.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Feedback</h3>
            <p className="card-description">Customer reviews and ratings</p>
          </div>
          <div className="card-content">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFeedback.map((feedback: Feedback) => (
                    <tr key={feedback.fid}>
                      <td>{feedback.customerName}</td>
                      <td>
                        <div className="star-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              style={{ width: '0.875rem', height: '0.875rem' }}
                              className={i < (feedback.rating || 0) ? 'filled' : 'empty'}
                            />
                          ))}
                        </div>
                      </td>
                      <td style={{ maxWidth: '150px' }} className="line-clamp-1">{feedback.description}</td>
                      <td>{feedback.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
