import { useState, useEffect } from 'react';
import CustomerFeedback from '@/pages/customer/Feedback';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, MessageSquare, ThumbsUp } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Feedback } from '@/types/gms';

export default function FeedbackPage() {
  const role = localStorage.getItem('userRole');
  if (role === 'customer') return <CustomerFeedback />;

  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/feedback')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFeedbacks(data);
      })
      .catch(err => console.error("Error fetching feedback:", err));
  }, []);

  const filteredFeedback = feedbacks.filter((feedback) =>
    feedback.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Feedback" subtitle="Customer reviews">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="quick-stat" style={{ padding: '1.5rem' }}>
          <p className="quick-stat-label">Total Reviews</p>
          <p className="quick-stat-value">{feedbacks.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="actions-bar">
        <div className="search-wrapper">
          <Search />
          <input
            type="text"
            placeholder="Search feedback..."
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="page-grid page-grid-3">
        {filteredFeedback.map((feedback: any) => (
          <div key={feedback.fid} className="feedback-card">
            <div className="feedback-card-header">
              <div className="avatar" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                {feedback.customerName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </div>
              <div className="feedback-card-info">
                <h3>{feedback.customerName || 'Unknown'}</h3>
                <p>{new Date(feedback.date).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="feedback-card-text">"{feedback.description}"</p>
            {role !== 'admin' && role !== 'manager' && (
              <div className="feedback-card-actions">
                <button className="btn btn-outline btn-sm">
                  <ThumbsUp style={{ width: '0.75rem', height: '0.75rem' }} />
                  Helpful
                </button>
                <button className="btn btn-outline btn-sm">
                  <MessageSquare style={{ width: '0.75rem', height: '0.75rem' }} />
                  Reply
                </button>
              </div>
            )}
          </div>
        ))}
        {filteredFeedback.length === 0 && <p style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--color-muted-foreground)' }}>No feedback found</p>}
      </div>
    </DashboardLayout>
  );
}
