import { Link } from 'react-router-dom';
import { Car, ArrowRight, Shield, Users, Calendar, CreditCard } from 'lucide-react';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/pages.css';

const features = [
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Schedule service appointments with just a few clicks'
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Manage your team efficiently with role-based access'
  },
  {
    icon: CreditCard,
    title: 'Payment Tracking',
    description: 'Track all transactions and generate reports'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Your data is protected with enterprise-grade security'
  }
];

export default function Index() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Car style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>GMS</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-outline">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-muted) 100%)'
      }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Complete Garage Management Solution
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--color-muted-foreground)', marginBottom: '2rem' }}>
            Streamline your garage operations with our all-in-one platform. 
            Manage bookings, staff, customers, and payments effortlessly.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Start Free Trial <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
            </Link>
            <Link to="/dashboard" className="btn btn-outline btn-lg">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>
            Everything You Need to Run Your Garage
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <div key={index} className="card" style={{ padding: '2rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <feature.icon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)' }} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Ready to Transform Your Garage?
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: 0.8, marginBottom: '2rem' }}>
            Join hundreds of garage owners who trust GMS for their daily operations.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--color-border)',
        color: 'var(--color-muted-foreground)',
        fontSize: '0.875rem'
      }}>
        © 2025 Garage Management System. All rights reserved.
      </footer>
    </div>
  );
}
