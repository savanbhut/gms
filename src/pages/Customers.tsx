import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// import { mockCustomers, mockBookings } from '@/data/mockData';
import { Search, Mail, Phone, MapPin } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Customer } from '@/types/gms';

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<any[]>([]); // Use booking type if available

  useEffect(() => {
    fetch('http://localhost:5000/api/customers')
      .then(res => res.json())
      .then(data => {
        const sorted = Array.isArray(data) ? [...data].reverse() : [];
        setCustomers(sorted);
      })
      .catch(err => console.error(err));

    fetch('http://localhost:5000/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error(err));
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Stats
  const activeBookingsCount = bookings.filter(b => b.status === 'Pending' || b.status === 'In Progress').length;
  const newCustomersCount = customers.length; // Simply showing total count as 'new' for now or 0

  return (
    <DashboardLayout title="Customers" subtitle="View and manage customer profiles">
      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search customers..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="page-grid page-grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="quick-stat">
          <p className="quick-stat-label">Total Customers</p>
          <p className="quick-stat-value">{customers.length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">New This Month</p>
          <p className="quick-stat-value success">{newCustomersCount}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Active Bookings</p>
          <p className="quick-stat-value primary">{activeBookingsCount}</p>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="page-grid page-grid-3">
          {filteredCustomers.map((customer: Customer) => (
            <div key={customer.cid} className="customer-card">
              <div className="customer-card-header">
                <div className="avatar avatar-lg" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                  {customer.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3>{customer.name}</h3>
                  <p>Customer ID: {customer.cid}</p>
                </div>
              </div>
              <div className="garage-card-details">
                <div className="garage-card-detail">
                  <Phone />
                  <span>{customer.phone}</span>
                </div>
                <div className="garage-card-detail">
                  <Mail />
                  <span>{customer.email}</span>
                </div>
                <div className="garage-card-detail">
                  <MapPin />
                  <span className="line-clamp-1">{customer.address}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-content" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th style={{ width: '200px' }}>Name</th>
                    <th style={{ width: '150px' }}>Phone</th>
                    <th style={{ width: '250px' }}>Email</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer: Customer) => (
                    <tr key={customer.cid}>
                      <td>{customer.cid}</td>
                      <td>{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.email}</td>
                      <td>{customer.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
