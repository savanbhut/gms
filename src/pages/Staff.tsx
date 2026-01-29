import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/components.css';
import '../styles/pages.css';

interface Staff {
  stfid: number;
  f_name: string;
  l_name: string;
  role: string;
  phone: string;
  email: string;
  salary: number;
  join_date: string;
  is_active: boolean;
  education?: string;
  address?: string;
}

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

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phone: '',
    email: '',
    salary: '',
    education: '',
    address: ''
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/staff');
      if (res.ok) {
        setStaffList(await res.json());
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async () => {
    const newErrors: any = {};
    let isValid = true;

    if (!formData.firstName.trim()) { newErrors.firstName = "First name is required"; isValid = false; }
    if (!formData.lastName.trim()) { newErrors.lastName = "Last name is required"; isValid = false; }
    if (!formData.role) { newErrors.role = "Role is required"; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = "Email is required"; isValid = false; }
    if (!formData.salary) { newErrors.salary = "Salary is required"; isValid = false; }

    if (!formData.phone) {
      newErrors.phone = "Phone is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        setIsDialogOpen(false);
        fetchStaff();
        setFormData({ firstName: '', lastName: '', role: '', phone: '', email: '', salary: '', education: '', address: '' });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to add staff");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      `${staff.f_name} ${staff.l_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Staff Management" subtitle="Manage your garage staff">
      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search staff..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => { setIsDialogOpen(true); setErrors({}); }}>
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="page-grid page-grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="quick-stat">
          <p className="quick-stat-label">Total Staff</p>
          <p className="quick-stat-value">{staffList.length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Active Staff</p>
          <p className="quick-stat-value success">{staffList.filter((s) => s.is_active).length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Total Salaries</p>
          <p className="quick-stat-value">₹{staffList.reduce((acc, s) => acc + s.salary, 0).toLocaleString()}</p>
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
                  <th>Name</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Salary</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.stfid}>
                    <td>{staff.stfid}</td>
                    <td>{staff.f_name} {staff.l_name}</td>
                    <td>{staff.role}</td>
                    <td>{staff.phone}</td>
                    <td>{staff.email}</td>
                    <td>₹{staff.salary.toLocaleString()}</td>
                    <td>{new Date(staff.join_date).toLocaleDateString()}</td>
                    <td><StatusBadge status={staff.is_active ? 'Active' : 'Inactive'} /></td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>No staff found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Dialog */}
      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Staff Member</h3>
              <p className="modal-description">Enter details of the new staff member</p>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">First Name *</label>
                  <input name="firstName" className={`input ${errors.firstName ? 'input-error' : ''}`} placeholder="First name" value={formData.firstName} onChange={handleChange} />
                  {errors.firstName && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label className="label">Last Name *</label>
                  <input name="lastName" className={`input ${errors.lastName ? 'input-error' : ''}`} placeholder="Last name" value={formData.lastName} onChange={handleChange} />
                  {errors.lastName && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.lastName}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Role *</label>
                <select name="role" className={`select ${errors.role ? 'input-error' : ''}`} value={formData.role} onChange={handleChange}>
                  <option value="">Select role</option>
                  <option value="Mechanic">Mechanic</option>
                  <option value="Senior Mechanic">Senior Mechanic</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Manager">Manager</option>
                </select>
                {errors.role && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.role}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Phone *</label>
                  <input name="phone" className={`input ${errors.phone ? 'input-error' : ''}`} placeholder="10 digit number" maxLength={10} value={formData.phone} onChange={handleChange} />
                  {errors.phone && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="label">Salary *</label>
                  <input name="salary" className={`input ${errors.salary ? 'input-error' : ''}`} type="number" placeholder="25000" value={formData.salary} onChange={handleChange} />
                  {errors.salary && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.salary}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="label">Email *</label>
                <input name="email" className={`input ${errors.email ? 'input-error' : ''}`} type="email" placeholder="staff@example.com" value={formData.email} onChange={handleChange} />
                {errors.email && <span style={{ color: 'var(--color-destructive)', fontSize: '0.8rem' }}>{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="label">Education</label>
                <input name="education" className="input" placeholder="ITI, Diploma, etc." value={formData.education} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="label">Address</label>
                <input name="address" className="input" placeholder="Full address" value={formData.address} onChange={handleChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsDialogOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
