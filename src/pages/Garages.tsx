import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  const [garage, setGarage] = useState<any>(null); // Single garage for Admin
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Fetch Garage Details (Hardcoded GID 1 for single Admin)
  useEffect(() => {
    fetch('http://localhost:5000/api/garage/1')
      .then(res => res.json())
      .then(data => {
        if (data.gid) setGarage(data);
      })
      .catch(err => console.error("Error fetching garage:", err));
  }, []);

  const handleEditClick = () => {
    setFormData({ ...garage });
    setIsEditOpen(true);
  };

  const handleSaveGarage = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/garage/${garage.gid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Garage updated successfully');
        setGarage({ ...formData });
        setIsEditOpen(false);
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  if (!garage) return (
    <DashboardLayout title="Garages" subtitle="Manage registered garages">
      <div style={{ padding: '2rem' }}>Loading Garage Details...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Garages" subtitle="Manage registered garages">

      {/* Search Bar - Optional for single garage but kept for UI consistency */}
      <div className="actions-bar">
        <div className="search-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search garages..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled
          />
        </div>
      </div>

      {/* Garages Grid (Single Card) */}
      <div className="page-grid page-grid-3" style={{ marginBottom: '2rem' }}>
        <div className="garage-card">
          <div className="garage-card-header">
            <div>
              <h3>{garage.g_name}</h3>
              <p>{garage.owner_name}</p>
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
            <button className="btn btn-outline btn-sm" onClick={handleEditClick}>Edit</button>
          </div>
        </div>
      </div>

      {/* Edit Garage Dialog */}
      {isEditOpen && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Garage Details</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Garage Name</label>
                <input
                  className="input"
                  value={formData.g_name || ''}
                  onChange={(e) => setFormData({ ...formData, g_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Owner Name</label>
                <input
                  className="input"
                  value={formData.owner_name || ''}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input
                    className="input"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Pincode</label>
                  <input
                    className="input"
                    value={formData.pincode || ''}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input
                  className="input"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Address</label>
                <input
                  className="input"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsEditOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveGarage}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
