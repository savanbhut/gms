import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockBookings } from '@/data/mockData';
import { Plus, Search } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Booking, BookingStatus } from '@/types/gms';

function StatusBadge({ status }: { status: string }) {
  const getClass = () => {
    switch (status) {
      case 'Completed': return 'badge badge-success';
      case 'Pending': return 'badge badge-warning';
      case 'In Progress': return 'badge badge-info';
      case 'Cancelled': return 'badge badge-error';
      default: return 'badge badge-default';
    }
  };
  return <span className={getClass()}>{status}</span>;
}

export default function Bookings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesSearch =
      booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockBookings.length,
    Pending: mockBookings.filter((b) => b.status === 'Pending').length,
    'In Progress': mockBookings.filter((b) => b.status === 'In Progress').length,
    Completed: mockBookings.filter((b) => b.status === 'Completed').length,
    Cancelled: mockBookings.filter((b) => b.status === 'Cancelled').length,
  };

  return (
    <DashboardLayout title="Bookings" subtitle="Manage service appointments">
      {/* Status Tabs */}
      <div className="filter-tabs">
        {(['all', 'Pending', 'In Progress', 'Completed', 'Cancelled'] as const).map((status) => (
          <button
            key={status}
            className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all' ? 'All' : status} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search bookings..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setIsDialogOpen(true)}>
          <Plus style={{ width: '1rem', height: '1rem' }} />
          New Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="quick-stat">
          <p className="quick-stat-label">Today's Bookings</p>
          <p className="quick-stat-value">3</p>
        </div>
        <div className="stat-card-colored warning">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-warning)' }}>Pending</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-warning)' }}>{statusCounts.Pending}</p>
        </div>
        <div className="stat-card-colored info">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-info)' }}>In Progress</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-info)' }}>{statusCounts['In Progress']}</p>
        </div>
        <div className="stat-card-colored success">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-success)' }}>Completed</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{statusCounts.Completed}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-content" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking: Booking) => (
                  <tr key={booking.bid}>
                    <td>{booking.bid}</td>
                    <td>{booking.customerName}</td>
                    <td>{booking.serviceName}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td className="line-clamp-1" style={{ maxWidth: '300px' }}>{booking.description}</td>
                    <td><StatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Booking Dialog */}
      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Booking</h3>
              <p className="modal-description">Schedule a new service appointment</p>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Customer</label>
                <select className="select">
                  <option value="">Select customer</option>
                  <option value="1">Anil Gupta</option>
                  <option value="2">Neha Sharma</option>
                  <option value="3">Ravi Patel</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Service</label>
                <select className="select">
                  <option value="">Select service</option>
                  <option value="1">Oil Change - ₹1,500</option>
                  <option value="2">Brake Service - ₹3,500</option>
                  <option value="3">AC Service - ₹2,500</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Date</label>
                  <input className="input" type="date" />
                </div>
                <div className="form-group">
                  <label className="label">Time</label>
                  <input className="input" type="time" />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Notes</label>
                <textarea className="textarea" placeholder="Any special requests or notes..." rows={3}></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsDialogOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setIsDialogOpen(false)}>Create Booking</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
