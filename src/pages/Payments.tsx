import { useState, useEffect } from 'react';
import CustomerPayments from '@/pages/customer/Payments';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// import { mockPayments, mockBookings } from '@/data/mockData';
import { Search, Download, CreditCard, Wallet, Building, Smartphone } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Payment, PaymentStatus, Booking } from '@/types/gms';

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
  const role = localStorage.getItem('userRole');
  if (role === 'customer') return <CustomerPayments />;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Fetch Payments
    fetch('http://localhost:5000/api/payments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Map backend snake_case to frontend camelCase
          const mappedData = data.map((p: any) => ({
            ...p,
            paymentType: p.payment_type || p.paymentType,
            transactionId: p.transaction_id || p.transactionId
          }));
          setPayments(mappedData);
        } else console.error("Invalid payments response:", data);
      })
      .catch(err => console.error("Error fetching payments", err));

    // Fetch Bookings (for names)
    fetch('http://localhost:5000/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
        else console.error("Invalid bookings response:", data);
      })
      .catch(err => console.error("Error fetching bookings", err));
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments
    .filter((p) => p.status === 'Success')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingAmount = payments
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
          <p className="quick-stat-value">{payments.length}</p>
        </div>
        <div className="quick-stat" style={{ padding: '1.5rem' }}>
          <p className="quick-stat-label">Success Rate</p>
          <p className="quick-stat-value success">
            {payments.length ? Math.round((payments.filter((p) => p.status === 'Success').length / payments.length) * 100) : 0}%
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
                  <th>Booking</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment: Payment) => {
                  const booking = bookings.find((b) => b.bid === payment.bid);
                  return (
                    <tr key={payment.pid}>
                      <td>{payment.pid}</td>
                      <td>{payment.transactionId}</td>
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
