import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarDays, CreditCard, MessageSquare, Plus, Clock, CheckCircle, XCircle, ShoppingBag, BadgeIndianRupee, Star, Search } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/components.css';
import '../styles/pages.css';

interface Service {
    sid: number;
    gid: number;
    service_name: string;
    vehicle_type: string;
    price: number;
    description: string;
    duration: string;
}

interface Booking {
    bid: number;
    date: string;
    time: string;
    status: string;
    description: string;
}

export default function CustomerDashboard() {
    const [activeTab, setActiveTab] = useState<'services' | 'bookings' | 'payments' | 'feedback'>('services');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Data State
    const [services, setServices] = useState<Service[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Cart State
    const [cart, setCart] = useState<Service[]>([]);

    // Selection Context
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // User Context
    const userUid = localStorage.getItem('userUid') || '1';

    useEffect(() => {
        fetchServices();
        fetchBookings();
        fetchPayments();
        fetchFeedbacks();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/services');
            if (res.ok) setServices(await res.json());
        } catch (err) { console.error("Failed to load services"); }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${userUid}`);
            if (res.ok) setBookings(await res.json());
        } catch (err) { console.error("Failed to load bookings"); }
    };

    const fetchPayments = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/payments/${userUid}`);
            if (res.ok) setPayments(await res.json());
        } catch (err) { console.error("Failed payments"); }
    };

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/feedback/${userUid}`);
            if (res.ok) setFeedbacks(await res.json());
        } catch (err) { console.error("Failed feedback"); }
    };

    const handleSeedServices = async () => {
        try {
            await fetch('http://localhost:5000/api/seed', { method: 'POST' });
            toast.success("Demo services loaded!");
            fetchServices();
        } catch (e) {
            toast.error("Failed to seed services");
        }
    };

    const toggleCart = (service: Service) => {
        if (cart.find(s => s.sid === service.sid)) {
            setCart(prev => prev.filter(s => s.sid !== service.sid));
            toast.info("Removed from cart");
        } else {
            setCart(prev => [...prev, service]);
            toast.success("Added to cart");
        }
    };

    const openCheckoutModal = () => {
        if (cart.length === 0) {
            toast.warning("Cart is empty");
            return;
        }
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const date = (form.elements.namedItem('date') as HTMLInputElement).value;
        const time = (form.elements.namedItem('time') as HTMLInputElement).value;
        const desc = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

        if (cart.length === 0) {
            toast.error("No services selected");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: userUid,
                    serviceIds: cart.map(s => s.sid),
                    date,
                    time,
                    description: desc
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setShowBookingModal(false);
                setCart([]);
                fetchBookings();
                setActiveTab('bookings');
            } else {
                toast.error(data.message || "Booking failed");
            }
        } catch (err) {
            toast.error("Error creating booking");
        } finally {
            setIsLoading(false);
        }
    };

    // --- PAYMENT & FEEDBACK HANDLERS ---

    const openPaymentModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking) return;
        setIsLoading(true);
        try {
            // Calculate mock amount (In real app, fetch from booking cost)
            const amount = 3000;
            const res = await fetch('http://localhost:5000/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: userUid, bid: selectedBooking.bid, amount, paymentMethod: 'Credit Card' })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Payment Received!");
                setShowPaymentModal(false);
                fetchPayments();
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
                fetchFeedbacks();
            } else { toast.error(data.message); }
        } catch (e) { toast.error("Error sending feedback"); }
        finally { setIsLoading(false); }
    };

    // --- RENDERERS ---

    const renderServices = () => {
        const filteredServices = services.filter(service =>
            service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div style={{ paddingBottom: '80px' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 className="card-title">Available Services</h3>
                            <p className="card-description">Browse and book premium car services</p>
                        </div>
                        {services.length === 0 && (
                            <button onClick={handleSeedServices} className="btn btn-outline btn-sm">Load Demo Services</button>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="actions-bar" style={{ marginBottom: '0' }}>
                        <div className="search-wrapper" style={{ maxWidth: '100%', width: '100%' }}>
                            <Search />
                            <input
                                type="text"
                                placeholder="Search for services..."
                                className="input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredServices.map(service => {
                        const isInCart = cart.some(s => s.sid === service.sid);
                        return (
                            <div key={service.sid} className="card service-hover-card" style={{
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: isInCart ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                transform: isInCart ? 'scale(1.02)' : 'none',
                                transition: 'all 0.2s'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                            color: 'var(--color-primary)'
                                        }}>
                                            <ShoppingBag size={24} />
                                        </div>
                                        <span className="badge badge-default" style={{ fontSize: '0.875rem' }}>{service.duration}</span>
                                    </div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{service.service_name}</h4>
                                    <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                                        {service.description}
                                    </p>
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{service.price}</span>
                                    <button
                                        onClick={() => toggleCart(service)}
                                        className={`btn ${isInCart ? 'btn-destructive' : 'btn-primary'}`}
                                    >
                                        {isInCart ? 'Remove' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {services.length === 0 && <p className="text-center" style={{ color: 'var(--color-muted-foreground)', marginTop: '3rem' }}>No services available at the moment.</p>}

                {/* Sticky Cart Footer - Hide when Modal is Open */}
                {cart.length > 0 && !showBookingModal && (
                    <div style={{
                        position: 'fixed',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'white',
                        padding: '1rem 2rem',
                        borderRadius: '50px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2rem',
                        zIndex: 100,
                        border: '1px solid var(--color-border)',
                        width: '90%',
                        maxWidth: '600px',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{cart.length} Services Selected</p>
                            <p style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Total: ₹{cart.reduce((sum, s) => sum + s.price, 0)}</p>
                        </div>
                        <button onClick={openCheckoutModal} className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '30px' }}>
                            Proceed to Book
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderBookings = () => (
        <div>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Your Bookings</h3>
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
                                    {b.status === 'Pending' && (
                                        <button onClick={() => openPaymentModal(b)} className="btn btn-primary btn-sm" style={{ marginRight: '0.5rem' }}>Pay Now</button>
                                    )}
                                    {b.status === 'Confirmed' && (
                                        <button onClick={() => setShowFeedbackModal(true)} className="btn btn-outline btn-sm">Feedback</button>
                                    )}
                                    <button className="btn btn-destructive btn-sm" style={{ marginLeft: '0.5rem' }}>Cancel</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>No bookings found.</p>}
            </div>
        </div>
    );

    const renderPayments = () => (
        <div>
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Payment History</h3>
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
        </div>
    );

    const renderFeedback = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="card-title">Feedback History</h3>
                <button onClick={() => setShowFeedbackModal(true)} className="btn btn-primary">Write Review</button>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {feedbacks.map(f => (
                    <div key={f.fid} className="card" style={{ padding: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted-foreground)', marginBottom: '0.5rem' }}>{new Date(f.date).toLocaleDateString()}</p>
                        <p style={{ fontSize: '1rem' }}>"{f.description}"</p>
                    </div>
                ))}
            </div>
            {feedbacks.length === 0 && <p className="text-center" style={{ color: 'var(--color-muted-foreground)', marginTop: '2rem' }}>No feedback submitted yet.</p>}
        </div>
    );

    return (
        <DashboardLayout title="Customer Portal" subtitle="Easy service booking & management">
            <div className="filter-tabs" style={{ marginBottom: '2rem' }}>
                <button className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('services')}>
                    <ShoppingBag size={16} /> Services
                </button>
                <button className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('bookings')}>
                    <CalendarDays size={16} /> Bookings
                </button>
                <button className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('payments')}>
                    <BadgeIndianRupee size={16} /> Payments
                </button>
                <button className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('feedback')}>
                    <MessageSquare size={16} /> Feedback
                </button>
            </div>

            {activeTab === 'services' && renderServices()}
            {activeTab === 'bookings' && renderBookings()}
            {activeTab === 'payments' && renderPayments()}
            {activeTab === 'feedback' && renderFeedback()}

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Confirm Booking</h3>
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--color-muted)', borderRadius: '0.5rem' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Selected Services:</p>
                                <ul style={{ fontSize: '0.85rem', color: 'var(--color-muted-foreground)', paddingLeft: '1.2rem', margin: '0.25rem 0' }}>
                                    {cart.map(s => (
                                        <li key={s.sid}>{s.service_name} (₹{s.price})</li>
                                    ))}
                                </ul>
                                <p style={{ fontWeight: 700, color: 'var(--color-primary)', textAlign: 'right' }}>
                                    Total: ₹{cart.reduce((sum, s) => sum + s.price, 0)}
                                </p>
                            </div>
                        </div>
                        <form onSubmit={handleBookingSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="label">Preferred Date</label>
                                    <input name="date" type="date" className="input" required min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Preferred Time</label>
                                    <input name="time" type="time" className="input" required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Notes / Issues</label>
                                    <textarea name="description" className="textarea" placeholder="Describ any specific issues..." rows={3}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowBookingModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                    {isLoading ? 'Processing...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                    <p>Total Amount: <strong>₹3000</strong></p>
                                    <p style={{ fontSize: '0.8rem', color: 'gray' }}>(Mock Amount)</p>
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
        </DashboardLayout>
    );
}

