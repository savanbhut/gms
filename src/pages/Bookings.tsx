import { useState, useEffect } from 'react';
import CustomerBookings from '@/pages/customer/Bookings';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// import { mockBookings } from '@/data/mockData';
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
  const [bookings, setBookings] = useState<any[]>([]); // Use any for now or Booking type
  const [isLoading, setIsLoading] = useState(false);

  // Determine Role
  const role = localStorage.getItem('userRole');
  if (role === 'customer') return <CustomerBookings />;

  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  // Fetch Bookings on Mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bid: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bid}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings(); // Refresh
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: bookings.length,
    Pending: bookings.filter((b) => b.status === 'Pending').length,
    Cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
  };

  return (
    <DashboardLayout title="Bookings" subtitle="Manage service appointments">
      {/* Status Tabs */}
      <div className="filter-tabs">
        {(['all', 'Pending', 'Cancelled'] as const).map((status) => (
          <button
            key={status}
            className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all' ? 'All' : status} ({statusCounts[status] || 0})
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking: any) => (
                  <tr key={booking.bid}>
                    <td>{booking.bid}</td>
                    <td>{booking.customerName}</td>
                    <td>{booking.serviceName}</td>
                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                    <td>{(() => {
                      if (!booking.time) return '';
                      const [h, m] = booking.time.split(':');
                      const hour = parseInt(h);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const hour12 = hour % 12 || 12;
                      return `${hour12}:${m} ${ampm}`;
                    })()}</td>
                    <td><StatusBadge status={booking.status} /></td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {booking.status === 'Pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              style={{ backgroundColor: '#22c55e', color: 'white', border: 'none' }}
                              onClick={() => handleUpdateStatus(booking.bid, 'Approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-destructive"
                              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                              onClick={() => handleUpdateStatus(booking.bid, 'Rejected')}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === 'In Progress' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleUpdateStatus(booking.bid, 'Completed')}
                          >
                            Complete
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Booking Dialog */}

    </DashboardLayout >
  );
}