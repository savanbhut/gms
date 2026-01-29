import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockGarages } from '@/data/mockData';
import { Plus, MapPin, Phone, Mail, X } from 'lucide-react';
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

  const [garage, setGarage] = useState<any>(null); // Single garage for Admin
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

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
    setErrors({});
    setIsEditOpen(true);
  };

  const handleSaveGarage = async () => {
    // Validation
    const { g_name, owner_name, phone, pincode, email, address } = formData;
    const newErrors: any = {};
    let isValid = true;

    if (!g_name?.trim()) { newErrors.g_name = "Garage Name is required"; isValid = false; }
    if (!owner_name?.trim()) { newErrors.owner_name = "Owner Name is required"; isValid = false; }
    if (!pincode) { newErrors.pincode = "Pincode is required"; isValid = false; }
    if (!email?.trim()) { newErrors.email = "Email is required"; isValid = false; }
    if (!address?.trim()) { newErrors.address = "Address is required"; isValid = false; }

    // Phone Validation
    if (!phone) {
      newErrors.phone = "Phone is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(String(phone))) {
      newErrors.phone = "Phone must be exactly 10 digits";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.error("Please fix the errors");
      return;
    }

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
    <DashboardLayout title="Garage" subtitle="Manage registered garage">



      {/* Full Width Profile View */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', overflow: 'hidden' }}>

        {/* Banner / Header Section */}
        <div style={{
          height: '140px',
          background: 'var(--color-primary)',
          position: 'relative',
          padding: '2rem',
          color: 'white'
        }}>
          <div style={{ position: 'absolute', bottom: '-2rem', left: '2rem', display: 'flex', alignItems: 'end', gap: '1.5rem' }}>
            <div style={{
              width: '5rem',
              height: '5rem',
              background: 'white',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {garage.g_name ? garage.g_name[0] : 'G'}
              </span>
            </div>
            <div style={{ paddingBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{garage.g_name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Main Branch</span>
              </div>
            </div>
          </div>

          <button
            className="btn"
            onClick={handleEditClick}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            Edit Details
          </button>
        </div>

        {/* Content Section */}
        <div style={{ padding: '4rem 2rem 2rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Contact Information
              </h3>
              <div className="space-y-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-muted-foreground)' }}>
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{garage.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-muted-foreground)' }}>
                  <Phone className="w-5 h-5 text-primary" />
                  <span>{garage.phone}</span>
                </div>
              </div>
            </div>

            {/* Location & Owner */}
            <div className="space-y-4">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                Location & Management
              </h3>
              <div className="space-y-3">
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', color: 'var(--color-muted-foreground)' }}>
                  <MapPin className="w-5 h-5 text-primary shrink-0" style={{ marginTop: '0.25rem' }} />
                  <div>
                    <p>{garage.address}</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Pincode: {garage.pincode}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-muted-foreground)' }}>
                  <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem' }}>O</div>
                  <span>Owner: {garage.owner_name}</span>
                </div>
              </div>
            </div>

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
                  className={`input ${errors.g_name ? 'input-error' : ''}`}
                  value={formData.g_name || ''}
                  onChange={(e) => setFormData({ ...formData, g_name: e.target.value })}
                />
                {errors.g_name && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.g_name}</span>}
              </div>
              <div className="form-group">
                <label className="label">Owner Name</label>
                <input
                  className={`input ${errors.owner_name ? 'input-error' : ''}`}
                  value={formData.owner_name || ''}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                />
                {errors.owner_name && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.owner_name}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input
                    className={`input ${errors.phone ? 'input-error' : ''}`}
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {errors.phone && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="label">Pincode</label>
                  <input
                    className={`input ${errors.pincode ? 'input-error' : ''}`}
                    value={formData.pincode || ''}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                  {errors.pincode && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.pincode}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="label">Address</label>
                <input
                  className={`input ${errors.address ? 'input-error' : ''}`}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                {errors.address && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.address}</span>}
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
