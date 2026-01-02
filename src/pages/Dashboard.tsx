import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { dashboardStats, mockBookings, mockFeedback } from '@/data/mockData';
import { CalendarDays, Users, Clock, CheckCircle, TrendingUp, Star } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Booking, Feedback } from '@/types/gms';
import CustomerDashboard from './CustomerDashboard';

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

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Dashboard() {
  const userRole = localStorage.getItem('userRole');
  const [garageDetails, setGarageDetails] = useState<any>(null);
  const [isEditGarageOpen, setIsEditGarageOpen] = useState(false);

  useEffect(() => {
    // Fetch Garage Details (Assuming GID 1 for single admin for now)
    fetch('http://localhost:5000/api/garage/1')
      .then(res => res.json())
      .then(data => setGarageDetails(data))
      .catch(err => console.error("Failed to fetch garage details", err));
  }, []);

  const handleSaveGarage = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/garage/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(garageDetails)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Garage details updated!');
        setIsEditGarageOpen(false);
      } else {
        toast.error('Failed to update');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  if (userRole === 'customer') {
    return <CustomerDashboard />;
  }

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

      {/* Secondary Stats & Garage Details */}
      <div className="page-grid page-grid-2" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Active Customers"
          value={dashboardStats.activeCustomers}
          icon={Users}
        />

        {/* Garage Details Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Garage Details</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setIsEditGarageOpen(true)}>Edit</button>
          </div>
          <div className="card-content">
            {garageDetails ? (
              <div style={{ fontSize: '0.9rem' }}>
                <p><strong>Name:</strong> {garageDetails.g_name}</p>
                <p><strong>Owner:</strong> {garageDetails.owner_name}</p>
                <p><strong>Phone:</strong> {garageDetails.phone}</p>
                <p><strong>Address:</strong> {garageDetails.address}</p>
              </div>
            ) : (
              <p>Loading details...</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Garage Modal */}
      {isEditGarageOpen && garageDetails && (
        <div className="modal-overlay" onClick={() => setIsEditGarageOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Garage Details</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Garage Name</label>
                <input
                  className="input"
                  value={garageDetails.g_name}
                  onChange={(e) => setGarageDetails({ ...garageDetails, g_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Owner Name</label>
                <input
                  className="input"
                  value={garageDetails.owner_name}
                  onChange={(e) => setGarageDetails({ ...garageDetails, owner_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={garageDetails.phone}
                  onChange={(e) => setGarageDetails({ ...garageDetails, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Address</label>
                <input
                  className="input"
                  value={garageDetails.address}
                  onChange={(e) => setGarageDetails({ ...garageDetails, address: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsEditGarageOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveGarage}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

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
                      <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{feedback.description}</td>
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
