import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockServices } from '@/data/mockData';
import { Plus, Search, Clock, Car, Wrench } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Service } from '@/types/gms';

function StatusBadge({ status }: { status: string }) {
  const getClass = () => {
    switch (status) {
      case 'Active': return 'badge badge-success';
      case 'Inactive': return 'badge badge-error';
      default: return 'badge badge-default';
    }
  };
  return <span className={getClass()}>{status}</span>;
}

export default function Services() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredServices = mockServices.filter(
    (service) =>
      service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vehicleType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeServices = mockServices.filter((s) => s.isActive);

  return (
    <DashboardLayout title="Services" subtitle="Manage garage services">
      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search services..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setIsDialogOpen(true)}>
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="page-grid page-grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="quick-stat">
          <p className="quick-stat-label">Total Services</p>
          <p className="quick-stat-value">{mockServices.length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Active Services</p>
          <p className="quick-stat-value success">{activeServices.length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Avg. Price</p>
          <p className="quick-stat-value">
            ₹{Math.round(activeServices.reduce((acc, s) => acc + s.price, 0) / activeServices.length).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="page-grid page-grid-3" style={{ marginBottom: '2rem' }}>
        {filteredServices.map((service: Service) => (
          <div key={service.sid} className={`service-card ${!service.isActive ? 'inactive' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="service-card-icon">
                <Wrench />
              </div>
              <StatusBadge status={service.isActive ? 'Active' : 'Inactive'} />
            </div>
            <h3>{service.serviceName}</h3>
            <p className="service-card-description line-clamp-2">{service.description}</p>
            <div className="service-card-meta">
              <div className="service-card-meta-item">
                <Car />
                <span>{service.vehicleType}</span>
              </div>
              <div className="service-card-meta-item">
                <Clock />
                <span>{service.duration}</span>
              </div>
            </div>
            <div className="service-card-footer">
              <span className="service-card-price">₹{service.price.toLocaleString()}</span>
              <button className="btn btn-outline btn-sm">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-content" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>Vehicle Type</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service: Service) => (
                  <tr key={service.sid}>
                    <td>{service.sid}</td>
                    <td>{service.serviceName}</td>
                    <td>{service.vehicleType}</td>
                    <td>₹{service.price.toLocaleString()}</td>
                    <td>{service.duration}</td>
                    <td><StatusBadge status={service.isActive ? 'Active' : 'Inactive'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Service Dialog */}
      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Service</h3>
              <p className="modal-description">Create a new service offering</p>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Service Name</label>
                <input className="input" placeholder="e.g. Oil Change" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Vehicle Type</label>
                  <select className="select">
                    <option value="">Select</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="truck">Truck</option>
                    <option value="all">All Vehicles</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Price (₹)</label>
                  <input className="input" type="number" placeholder="1500" />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Duration</label>
                <input className="input" placeholder="e.g. 30 mins, 2 hours" />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea className="textarea" placeholder="Describe what this service includes..." rows={3}></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsDialogOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setIsDialogOpen(false)}>Add Service</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
