import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockStaff } from '@/data/mockData';
import { Plus, Search } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Staff } from '@/types/gms';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredStaff = mockStaff.filter(
    (staff) =>
      `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <button className="btn btn-primary" onClick={() => setIsDialogOpen(true)}>
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="page-grid page-grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="quick-stat">
          <p className="quick-stat-label">Total Staff</p>
          <p className="quick-stat-value">{mockStaff.length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Active Staff</p>
          <p className="quick-stat-value success">{mockStaff.filter((s) => s.isActive).length}</p>
        </div>
        <div className="quick-stat">
          <p className="quick-stat-label">Total Salaries</p>
          <p className="quick-stat-value">₹{mockStaff.reduce((acc, s) => acc + s.salary, 0).toLocaleString()}</p>
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
                {filteredStaff.map((staff: Staff) => (
                  <tr key={staff.stfid}>
                    <td>{staff.stfid}</td>
                    <td>{staff.firstName} {staff.lastName}</td>
                    <td>{staff.role}</td>
                    <td>{staff.phone}</td>
                    <td>{staff.email}</td>
                    <td>₹{staff.salary.toLocaleString()}</td>
                    <td>{staff.joinDate}</td>
                    <td><StatusBadge status={staff.isActive ? 'Active' : 'Inactive'} /></td>
                  </tr>
                ))}
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
                  <label className="label">First Name</label>
                  <input className="input" placeholder="First name" />
                </div>
                <div className="form-group">
                  <label className="label">Last Name</label>
                  <input className="input" placeholder="Last name" />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Role</label>
                <select className="select">
                  <option value="">Select role</option>
                  <option value="mechanic">Mechanic</option>
                  <option value="senior_mechanic">Senior Mechanic</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input className="input" placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label className="label">Salary</label>
                  <input className="input" type="number" placeholder="25000" />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="staff@example.com" />
              </div>
              <div className="form-group">
                <label className="label">Education</label>
                <input className="input" placeholder="ITI, Diploma, etc." />
              </div>
              <div className="form-group">
                <label className="label">Address</label>
                <input className="input" placeholder="Full address" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsDialogOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setIsDialogOpen(false)}>Add Staff</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
