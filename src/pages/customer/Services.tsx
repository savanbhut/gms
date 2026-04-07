import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Car, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import '../../styles/components.css';
import '../../styles/pages.css';

const getLocalDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getLocalTimeStr = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

interface Service {
    sid: number;
    gid: number;
    service_name: string;
    vehicle_type: string;
    price: number;
    description: string;
    duration: string;
}

export default function CustomerServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<Service[]>([]);
    const [bookingErrors, setBookingErrors] = useState<{ date?: string; time?: string }>({});
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDateStr, setSelectedDateStr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const userUid = localStorage.getItem('userUid') || '1';

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/services');
            if (res.ok) setServices(await res.json());
        } catch (err) { console.error("Failed to load services"); }
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
            toast.info("Service removed");
        } else {
            setCart(prev => [...prev, service]);
            toast.success("Service selected");
        }
    };

    const openCheckoutModal = () => {
        if (cart.length === 0) {
            toast.warning("No services selected");
            return;
        }
        setSelectedDateStr('');
        setBookingErrors({});
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const date = (form.elements.namedItem('date') as HTMLInputElement).value;
        const time = (form.elements.namedItem('time') as HTMLInputElement).value;
        const desc = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

        if (cart.length === 0) return;

        // Validation
        const newErrors: { date?: string; time?: string } = {};
        let hasError = false;

        if (!date) {
            newErrors.date = "Date is required";
            hasError = true;
        }

        if (!time) {
            newErrors.time = "Time is required";
            hasError = true;
        }

        if (date && time) {
            const selectedDateTime = new Date(`${date}T${time}`);
            const now = new Date();

            if (selectedDateTime <= now) {
                newErrors.date = "Booking date and time must be in the future";
                hasError = true;
            }

            const hours = selectedDateTime.getHours();
            if (hours < 9 || hours >= 18) {
                newErrors.time = "Please select a time between 9:00 AM and 6:00 PM";
                hasError = true;
            }
        }

        if (hasError) {
            setBookingErrors(newErrors);
            return;
        }

        setBookingErrors({}); // Clear errors if valid

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
                navigate('/bookings');
            } else {
                toast.error(data.message || "Booking failed");
            }
        } catch (err) {
            toast.error("Error creating booking");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredServices = services.filter(service =>
        service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout title="Customer Services" subtitle="Browse and book premium car services">
            <div style={{ paddingBottom: '80px' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div></div>
                        {services.length === 0 && (
                            <button onClick={handleSeedServices} className="btn btn-outline btn-sm">Load Demo Services</button>
                        )}
                    </div>

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
                                    </div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{service.service_name}</h4>
                                    <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                                        {service.description}
                                    </p>
                                    <div className="service-card-meta">
                                        <div className="service-card-meta-item">
                                            <Car />
                                            <span>{service.vehicle_type}</span>
                                        </div>
                                        <div className="service-card-meta-item">
                                            <Clock />
                                            <span>{service.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{service.price}</span>
                                    <button
                                        onClick={() => toggleCart(service)}
                                        className={`btn ${isInCart ? 'btn-destructive' : 'btn-primary'}`}
                                    >
                                        {isInCart ? 'Remove' : 'Book Service'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {services.length === 0 && <p className="text-center" style={{ color: 'var(--color-muted-foreground)', marginTop: '3rem' }}>No services available at the moment.</p>}

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
                                        <input
                                            name="date"
                                            type="date"
                                            className="input"
                                            min={getLocalDateStr()}
                                            onChange={(e) => setSelectedDateStr(e.target.value)}
                                        />
                                        {bookingErrors.date && <span className="error-text">{bookingErrors.date}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Preferred Time</label>
                                        <input
                                            name="time"
                                            type="time"
                                            className="input"
                                            min={selectedDateStr === getLocalDateStr() ? getLocalTimeStr() : "09:00"}
                                            max="18:00"
                                        />
                                        {bookingErrors.time && <span className="error-text">{bookingErrors.time}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Notes / Issues</label>
                                        <textarea name="description" className="textarea" placeholder="Describe any specific issues..." rows={3}></textarea>
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
            </div>
        </DashboardLayout>
    );
}
