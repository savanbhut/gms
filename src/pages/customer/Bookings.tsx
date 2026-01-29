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

    const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking) return;
        setIsLoading(true);

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create Order
            const amount = selectedBooking.totalCost || 0;
            const orderRes = await fetch('http://localhost:5000/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            const orderData = await orderRes.json();

            if (!orderData.success) {
                toast.error("Order creation failed");
                setIsLoading(false);
                return;
            }

            // 2. Open Razorpay
            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: "INR",
                name: "Garage Hub",
                description: `Payment for Booking #${selectedBooking.bid}`,
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bid: selectedBooking.bid,
                                uid: userUid,
                                amount: amount
                            })
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            toast.success("Payment Successful!");
                            setShowPaymentModal(false);
                            fetchBookings();
                        } else {
                            toast.error("Payment Verification Failed");
                        }
                    } catch (err) {
                        toast.error("Server error during verification");
                    }
                },
                prefill: {
                    name: "Customer Name", // Could be dynamic
                    email: "customer@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (err) {
            toast.error("Payment initiation failed");
        } finally {
            setIsLoading(false);
        }
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
                                <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--color-muted-foreground)' }}>
                                    <p>Secure payment via Razorpay</p>
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
