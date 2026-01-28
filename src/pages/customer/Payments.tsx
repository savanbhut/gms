import { useState, useEffect } from 'react';
import { BadgeIndianRupee } from 'lucide-react';
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

    return (
        <DashboardLayout title="Payment History" subtitle="View your transaction history">
            <div className="card">
                <table className="table">
                    <thead><tr><th>ID</th><th>Transaction ID</th><th>Booking ID</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.pid}>
                                <td>#{p.pid}</td>
                                <td>{p.transaction_id}</td>
                                <td>#{p.bid}</td>
                                <td>{new Date(p.date).toLocaleDateString()}</td>
                                <td style={{ fontWeight: 'bold' }}>₹{p.amount}</td>
                                <td><span className="badge badge-success">{p.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>No payments found.</p>}
            </div>
        </DashboardLayout>
    );
}
