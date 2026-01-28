import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import '../../styles/components.css';
import '../../styles/pages.css';

export default function CustomerFeedback() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const userUid = localStorage.getItem('userUid') || '1';

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/feedback/${userUid}`);
            if (res.ok) setFeedbacks(await res.json());
        } catch (err) { console.error("Failed feedback"); }
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

    return (
        <DashboardLayout title="Feedback History" subtitle="Your reviews and ratings">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div></div>
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
