import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockPayments, mockBookings } from '@/data/mockData';
import { Search, Download, CreditCard, Wallet, Building, Smartphone } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Payment, PaymentStatus } from '@/types/gms';

function StatusBadge({ status }: { status: string }) {
  const getClass = () => {
    switch (status) {
      case 'Success': return 'badge badge-success';
      case 'Pending': return 'badge badge-warning';
      case 'Failed': return 'badge badge-error';
      default: return 'badge badge-default';
    }
  };
  return <span className={getClass()}>{status}</span>;
}

const paymentIcons: Record<string, React.ReactNode> = {
  UPI: <Smartphone style={{ width: '1rem', height: '1rem' }} />,
  'Credit Card': <CreditCard style={{ width: '1rem', height: '1rem' }} />,
  'Debit Card': <CreditCard style={{ width: '1rem', height: '1rem' }} />,
  'Net Banking': <Building style={{ width: '1rem', height: '1rem' }} />,
  Wallet: <Wallet style={{ width: '1rem', height: '1rem' }} />,
};

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch = payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = mockPayments
    .filter((p) => p.status === 'Success')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingAmount = mockPayments
    .filter((p) => p.status === 'Pending')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <DashboardLayout title="Payments" subtitle="Track payment transactions">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="stat-card stat-card-primary">
          <p className="stat-title">Total Revenue</p>
          <p className="stat-value">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card-colored warning" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-warning)' }}>Pending</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-warning)', marginTop: '0.25rem' }}>₹{pendingAmount.toLocaleString()}</p>
        </div>
        <div className="quick-stat" style={{ padding: '1.5rem' }}>
          <p className="quick-stat-label">Total Transactions</p>
          <p className="quick-stat-value">{mockPayments.length}</p>
        </div>
        <div className="quick-stat" style={{ padding: '1.5rem' }}>
          <p className="quick-stat-label">Success Rate</p>
          <p className="quick-stat-value success">
            {Math.round((mockPayments.filter((p) => p.status === 'Success').length / mockPayments.length) * 100)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {(['all', 'Success', 'Pending', 'Failed'] as const).map((status) => (
          <button
            key={status}
            className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search by transaction ID..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-outline">
          <Download style={{ width: '1rem', height: '1rem' }} />
          Export
        </button>
      </div>

      {/* Payment Methods Summary */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Payment Methods</h3>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => {
              const count = mockPayments.filter((p) => p.paymentType === method).length;
              return (
                <div key={method} className="payment-method-card">
                  <div className="payment-method-icon">
                    {paymentIcons[method]}
                  </div>
                  <div className="payment-method-info">
                    <p>{method}</p>
                    <p>{count} transactions</p>
                  </div>
                </div>
              );
            })}
          </div>
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
                  <th>Transaction ID</th>
                  <th>Method</th>
                  <th>Booking</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment: Payment) => {
                  const booking = mockBookings.find((b) => b.bid === payment.bid);
                  return (
                    <tr key={payment.pid}>
                      <td>{payment.pid}</td>
                      <td>{payment.transactionId}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {paymentIcons[payment.paymentType]}
                          <span>{payment.paymentType}</span>
                        </div>
                      </td>
                      <td>{booking?.customerName || `#${payment.bid}`}</td>
                      <td style={{ fontWeight: 600 }}>₹{payment.amount.toLocaleString()}</td>
                      <td>{payment.date}</td>
                      <td><StatusBadge status={payment.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
