import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null); // For Edit Mode
  const [formData, setFormData] = useState<any>({});

  // Fetch Services from Backend
  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditClick = (service: any) => {
    setEditingService(service);
    setFormData({ ...service });
    setIsDialogOpen(true);
  };

  const handleSaveService = async () => {
    if (!editingService) return; // Only handling edit for now

    try {
      const res = await fetch(`http://localhost:5000/api/services/${editingService.sid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Service updated!');
        setIsDialogOpen(false);
        setEditingService(null);
        fetchServices(); // Refresh list
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vehicle_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeServices = services.filter((s) => s.is_active);

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
        {/* Hide Add button for now or keep mock */}
        {['admin', 'manager'].includes(localStorage.getItem('userRole') || '') && (
          <button className="btn btn-primary" onClick={() => { setEditingService(null); setFormData({}); setIsDialogOpen(true); }}>
            <Plus style={{ width: '1rem', height: '1rem' }} />
            Add Service
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="page-grid page-grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="quick-stat">
          <p className="quick-stat-label">Total Services</p>
          <p className="quick-stat-value">{services.length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Active Services</p>
          <p className="quick-stat-value success">{activeServices.length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Avg. Price</p>
          <p className="quick-stat-value">
            ₹{activeServices.length > 0 ? Math.round(activeServices.reduce((acc, s) => acc + s.price, 0) / activeServices.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="page-grid page-grid-3" style={{ marginBottom: '2rem' }}>
        {filteredServices.map((service: any) => (
          <div key={service.sid} className={`service-card ${!service.is_active ? 'inactive' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="service-card-icon">
                <Wrench />
              </div>
              <StatusBadge status={service.is_active ? 'Active' : 'Inactive'} />
            </div>
            <h3>{service.service_name}</h3>
            <p className="service-card-description line-clamp-2">{service.description}</p>
            <div className="service-card-meta">
              <div className="service-card-meta-item">
                <Car />
                <span>{service.vehicle_type}</span>
              </div>
              <div className="service-card-meta-item">
                <Clock />
                <span>{service.duration}</span>
              </div>
            </div>
            <div className="service-card-footer">
              <span className="service-card-price">₹{service.price.toLocaleString()}</span>
              <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(service)}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Service Dialog */}
      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Service Name</label>
                <input
                  className="input"
                  value={formData.service_name || ''}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Vehicle Type</label>
                  <select
                    className="select"
                    value={formData.vehicle_type || ''}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Price (₹)</label>
                  <input
                    className="input"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Duration</label>
                <input
                  className="input"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              {editingService && (
                <div className="form-group">
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Is Active
                  </label>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsDialogOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveService}>
                {editingService ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
