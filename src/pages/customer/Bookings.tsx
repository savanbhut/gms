import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import '../../styles/components.css';
import '../../styles/pages.css';

interface Booking {
    bid: number;
    date: string;
    time: string;
    status: string;
    description: string;
    customerName?: string; // Optional if not returned by backend for customer view
    serviceName?: string;
    totalCost?: number;
}

export default function CustomerBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // User Context
    const userUid = localStorage.getItem('userUid') || '1';

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${userUid}`);
            if (res.ok) setBookings(await res.json());
        } catch (err) { console.error("Failed to load bookings"); }
    };

    const openPaymentModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking) return;
        setIsLoading(true);
        try {
            const amount = selectedBooking.totalCost || 0;
            const res = await fetch('http://localhost:5000/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: userUid, bid: selectedBooking.bid, amount, paymentMethod: 'Credit Card' })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Payment Received!");
                setShowPaymentModal(false);
                fetchBookings(); // Update status
            } else { toast.error(data.message); }
        } catch (err) { toast.error("Payment Error"); }
        finally { setIsLoading(false); }
    };

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: userUid, message })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Feedback Sent!");
                setShowFeedbackModal(false);
            } else { toast.error(data.message); }
        } catch (e) { toast.error("Error sending feedback"); }
        finally { setIsLoading(false); }
    };

    const handleCancelClick = (bid: number) => {
        setBookingToCancel(bid);
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        if (!bookingToCancel) return;
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${bookingToCancel}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Cancelled' })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Booking Cancelled");
                setShowCancelModal(false);
                fetchBookings();
            } else {
                toast.error(data.message || "Failed to cancel booking");
            }
        } catch (err) {
            toast.error("Error cancelling booking");
        } finally {
            setIsLoading(false);
            setBookingToCancel(null);
        }
    };

    return (
        <DashboardLayout title="Your Bookings" subtitle="Track and manage your appointments">
            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.bid}>
                                <td>#{b.bid}</td>
                                <td>{b.description}</td>
                                <td>{new Date(b.date).toLocaleDateString()} {b.time}</td>
                                <td><span className={`badge ${b.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span></td>
                                <td>
                                    {b.status === 'Approved' && (
                                        <button onClick={() => openPaymentModal(b)} className="btn btn-primary btn-sm" style={{ marginRight: '0.5rem' }}>Pay Now</button>
                                    )}
                                    {b.status === 'Pending' && (
                                        <span className="text-xs text-yellow-600 font-medium mr-2">Waiting for Approval</span>
                                    )}
                                    {b.status === 'Confirmed' && (
                                        <button onClick={() => setShowFeedbackModal(true)} className="btn btn-outline btn-sm">Feedback</button>
                                    )}
                                    {b.status !== 'Confirmed' && b.status !== 'Completed' && b.status !== 'Rejected' && b.status !== 'Cancelled' && (
                                        <button onClick={() => handleCancelClick(b.bid)} className="btn btn-destructive btn-sm" style={{ marginLeft: '0.5rem' }}>Cancel</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>No bookings found.</p>}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedBooking && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Make Payment</h3>
                            <p>Booking #{selectedBooking.bid}</p>
                        </div>
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="modal-body">
                                <div className="card" style={{ padding: '1rem', backgroundColor: '#f8fafc', marginBottom: '1rem' }}>
                                    <p>Total Amount: <strong>₹{selectedBooking.totalCost?.toLocaleString() || 0}</strong></p>
                                </div>
                                <div className="form-group"><label className="label">Card Number</label><input type="text" className="input" placeholder="0000 0000 0000 0000" required /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group"><label className="label">Expiry</label><input type="text" className="input" placeholder="MM/YY" required /></div>
                                    <div className="form-group"><label className="label">CVV</label><input type="text" className="input" placeholder="123" required /></div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Processing...' : 'Pay Now'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3 className="modal-title">Share Feedback</h3></div>
                        <form onSubmit={handleFeedbackSubmit}>
                            <div className="modal-body">
                                <div className="form-group"><label className="label">Your Experience</label><textarea name="message" className="textarea" rows={4} placeholder="How was our service?" required></textarea></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Review'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title text-destructive">Cancel Booking</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline" onClick={() => setShowCancelModal(false)}>No, Keep It</button>
                            <button type="button" className="btn btn-destructive" onClick={confirmCancel} disabled={isLoading}>
                                {isLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
