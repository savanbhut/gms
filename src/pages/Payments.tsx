import { useState, useEffect } from 'react';
import CustomerPayments from '@/pages/customer/Payments';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// import { mockPayments, mockBookings } from '@/data/mockData';
import { Search, Download, CreditCard, Wallet, Building, Smartphone } from 'lucide-react';
import html2pdf from 'html2pdf.js';
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

    const handleDownloadInvoice = async (pid: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/invoice/${pid}`);
            const data = await res.json();
            if (!data.success) {
                alert("Could not fetch invoice details");
                return;
            }

            const { invoice } = data;
            const element = document.createElement('div');
            
            const totalServicesCost = invoice.services.reduce((sum: number, s: any) => sum + s.cost, 0);
            
            // Generate HTML with Header and Footer
            element.innerHTML = `
                <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; min-height: 1040px; display: flex; flex-direction: column;">
                    <div style="flex-grow: 1;">
                        <!-- HEADER -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
                            <div>
                                <h1 style="color: #f97316; margin: 0; font-size: 28px;">${invoice.garage.name}</h1>
                                <p style="margin: 5px 0 0; color: #666;">${invoice.garage.address}</p>
                                <p style="margin: 5px 0 0; color: #666;">${invoice.garage.email} | ${invoice.garage.phone}</p>
                            </div>
                            <div style="text-align: right;">
                                <h2 style="margin: 0; color: #333; font-size: 24px;">INVOICE</h2>
                                <p style="margin: 5px 0 0; color: #666;"><strong>Invoice #:</strong> ${invoice.payment.pid}</p>
                                <p style="margin: 5px 0 0; color: #666;"><strong>Date:</strong> ${new Date(invoice.payment.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <!-- CUSTOMER INFO -->
                        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                            <div>
                                <h3 style="margin: 0 0 10px; color: #444; font-size: 16px;">Bill To:</h3>
                                <p style="margin: 0; color: #333; font-weight: bold;">${invoice.customer.name}</p>
                                <p style="margin: 5px 0 0; color: #666;">${invoice.customer.address}</p>
                                <p style="margin: 5px 0 0; color: #666;">${invoice.customer.email}</p>
                                <p style="margin: 5px 0 0; color: #666;">${invoice.customer.phone}</p>
                            </div>
                            <div style="text-align: right;">
                                <h3 style="margin: 0 0 10px; color: #444; font-size: 16px;">Booking Details:</h3>
                                <p style="margin: 0; color: #666;"><strong>Booking ID:</strong> #${invoice.booking.bid}</p>
                                <p style="margin: 5px 0 0; color: #666;"><strong>Service Date:</strong> ${new Date(invoice.booking.date).toLocaleDateString()}</p>
                                <p style="margin: 5px 0 0; color: #666;"><strong>Time:</strong> ${invoice.booking.time}</p>
                            </div>
                        </div>

                        <!-- SERVICES TABLE -->
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                            <thead>
                                <tr style="background-color: #f8f9fa;">
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; color: #555;">Description</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #555;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoice.services.map((s: any) => `
                                    <tr>
                                        <td style="padding: 12px; border-bottom: 1px solid #eee;">${s.name} (${s.vehicle_type})</td>
                                        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">₹${s.cost}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <!-- TOTALS -->
                        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
                            <div style="width: 300px;">
                                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid #ddd;">
                                    <span style="font-weight: bold; font-size: 18px;">Total Paid:</span>
                                    <span style="font-weight: bold; font-size: 18px; color: #f97316;">₹${totalServicesCost}</span>
                                </div>
                                <p style="text-align: right; color: #666; margin-top: 10px; font-size: 14px;">Paid via: ${invoice.payment.method}</p>
                                <p style="text-align: right; color: #666; margin-top: 5px; font-size: 14px;">Txn ID: ${invoice.payment.transaction_id || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div style="margin-top: auto; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #888; font-size: 14px;">
                        <p style="margin: 0;">Thank you for choosing ${invoice.garage.name}!</p>
                        <p style="margin: 5px 0 0;">If you have any questions about this invoice, please contact us at ${invoice.garage.email}</p>
                    </div>
                </div>
            `;

            const opt: any = {
                margin:       0,
                filename:     `Invoice_#${invoice.payment.pid}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error("Error generating invoice:", err);
            alert("An error occurred while generating the invoice.");
        }
    };

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
                  <th>Actions</th>
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
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td><StatusBadge status={payment.status} /></td>
                      <td>
                        {payment.status === 'Success' && (
                          <button 
                            onClick={() => handleDownloadInvoice(payment.pid)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--color-primary)', 
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                              fontSize: '0.875rem', fontWeight: '500'
                            }}
                            title="Download Invoice"
                          >
                            <Download size={16} />
                            Invoice
                          </button>
                        )}
                      </td>
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
