import { useState, useEffect } from 'react';
import { BadgeIndianRupee, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import '../../styles/components.css';
import '../../styles/pages.css';

export default function CustomerPayments() {
    const [payments, setPayments] = useState<any[]>([]);
    const userUid = localStorage.getItem('userUid') || '1';

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/payments/${userUid}`);
                if (res.ok) setPayments(await res.json());
            } catch (err) { console.error("Failed payments"); }
        };
        fetchPayments();
    }, [userUid]);

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

    return (
        <DashboardLayout title="Payment History" subtitle="View your transaction history">
            <div className="card">
                <table className="table">
                    <thead><tr><th>ID</th><th>Transaction ID</th><th>Booking ID</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.pid}>
                                <td>#{p.pid}</td>
                                <td>{p.transaction_id}</td>
                                <td>#{p.bid}</td>
                                <td>{new Date(p.date).toLocaleDateString()}</td>
                                <td style={{ fontWeight: 'bold' }}>₹{p.amount}</td>
                                <td><span className="badge badge-success">{p.status}</span></td>
                                <td>
                                    {p.status === 'Success' && (
                                        <button 
                                            onClick={() => handleDownloadInvoice(p.pid)}
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
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>No payments found.</p>}
            </div>
        </DashboardLayout>
    );
}
