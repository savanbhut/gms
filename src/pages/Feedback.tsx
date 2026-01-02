import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockFeedback } from '@/data/mockData';
import { Search, Star, MessageSquare, ThumbsUp } from 'lucide-react';
import '../styles/components.css';
import '../styles/pages.css';
import type { Feedback } from '@/types/gms';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: '1rem', height: '1rem' }}
          className={i < rating ? 'filled' : 'empty'}
        />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeedback = mockFeedback.filter((feedback) =>
    feedback.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageRating = mockFeedback.reduce((acc, f) => acc + (f.rating || 0), 0) / mockFeedback.length;
  const fiveStarCount = mockFeedback.filter((f) => f.rating === 5).length;

  return (
    <DashboardLayout title="Feedback" subtitle="Customer reviews and ratings">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="stat-card stat-card-primary">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Star style={{ width: '2rem', height: '2rem', fill: 'currentColor' }} />
            <div>
              <p className="stat-title">Average Rating</p>
              <p className="stat-value">{averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="quick-stat" style={{ padding: '1.5rem' }}>
          <p className="quick-stat-label">Total Reviews</p>
          <p className="quick-stat-value">{mockFeedback.length}</p>
        </div>
        <div className="quick-stat" style={{ padding: '1.5rem' }}>
          <p className="quick-stat-label">5-Star Reviews</p>
          <p className="quick-stat-value warning">{fiveStarCount}</p>
        </div>
        <div className="quick-stat" style={{ padding: '1.5rem' }}>
          <p className="quick-stat-label">Response Rate</p>
          <p className="quick-stat-value success">100%</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Rating Distribution</h3>
        </div>
        <div className="card-content">
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = mockFeedback.filter((f) => f.rating === rating).length;
              const percentage = (count / mockFeedback.length) * 100;
              return (
                <div key={rating} className="rating-row">
                  <div className="rating-label">
                    <span>{rating}</span>
                    <Star style={{ width: '1rem', height: '1rem', color: 'var(--color-warning)', fill: 'var(--color-warning)' }} />
                  </div>
                  <div className="rating-bar">
                    <div className="rating-bar-fill" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              );
            })}
          </div>
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
        {filteredFeedback.map((feedback: Feedback) => (
          <div key={feedback.fid} className="feedback-card">
            <div className="feedback-card-header">
              <div className="avatar" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                {feedback.customerName?.split(' ').map((n) => n[0]).join('') || 'U'}
              </div>
              <div className="feedback-card-info">
                <h3>{feedback.customerName}</h3>
                <p>{feedback.date}</p>
              </div>
              <StarRating rating={feedback.rating || 0} />
            </div>
            <p className="feedback-card-text">"{feedback.description}"</p>
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
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
