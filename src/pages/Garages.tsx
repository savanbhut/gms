import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockGarages } from '@/data/mockData';
import { Plus, Search, MapPin, Phone, Mail, X } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Garage } from '@/types/gms';

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

export default function Garages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredGarages = mockGarages.filter(
    (garage) =>
      garage.garageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      garage.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Garages" subtitle="Manage registered garages">
      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search garages..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setIsDialogOpen(true)}>
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Add Garage
        </button>
      </div>

      {/* Garages Grid */}
      <div className="page-grid page-grid-3" style={{ marginBottom: '2rem' }}>
        {filteredGarages.map((garage: Garage) => (
          <div key={garage.gid} className="garage-card">
            <div className="garage-card-header">
              <div>
                <h3>{garage.garageName}</h3>
                <p>{garage.ownerName}</p>
              </div>
              <StatusBadge status="Active" />
            </div>
            <div className="garage-card-details">
              <div className="garage-card-detail">
                <MapPin />
                <span className="line-clamp-1">{garage.address}</span>
              </div>
              <div className="garage-card-detail">
                <Phone />
                <span>{garage.phone}</span>
              </div>
              <div className="garage-card-detail">
                <Mail />
                <span>{garage.email}</span>
              </div>
            </div>
            <div className="garage-card-actions">
              <button className="btn btn-outline btn-sm">View</button>
              <button className="btn btn-outline btn-sm">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Table View */}
      <div className="card">
        <div className="card-content" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Garage Name</th>
                  <th>Owner</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Pincode</th>
                </tr>
              </thead>
              <tbody>
                {filteredGarages.map((garage: Garage) => (
                  <tr key={garage.gid}>
                    <td>{garage.gid}</td>
                    <td>{garage.garageName}</td>
                    <td>{garage.ownerName}</td>
                    <td>{garage.phone}</td>
                    <td>{garage.email}</td>
                    <td>{garage.pincode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Garage Dialog */}
      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Garage</h3>
              <p className="modal-description">Add a new garage to the system</p>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Garage Name</label>
                <input className="input" placeholder="Enter garage name" />
              </div>
              <div className="form-group">
                <label className="label">Owner Name</label>
                <input className="input" placeholder="Enter owner name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input className="input" placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label className="label">Pincode</label>
                  <input className="input" placeholder="380015" />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="garage@example.com" />
              </div>
              <div className="form-group">
                <label className="label">Address</label>
                <input className="input" placeholder="Full address" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsDialogOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setIsDialogOpen(false)}>Register Garage</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
