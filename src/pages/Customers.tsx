import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockCustomers } from '@/data/mockData';
import { Search, Mail, Phone, MapPin } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Customer } from '@/types/gms';

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <p className="quick-stat-value">{mockCustomers.length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">New This Month</p>
          <p className="quick-stat-value success">12</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Active Bookings</p>
          <p className="quick-stat-value primary">8</p>
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
              <div className="garage-card-actions">
                <button className="btn btn-outline btn-sm">View Profile</button>
                <button className="btn btn-outline btn-sm">Bookings</button>
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
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
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
                      <td className="line-clamp-1" style={{ maxWidth: '200px' }}>{customer.address}</td>
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
