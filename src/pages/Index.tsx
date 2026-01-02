import { Link } from 'react-router-dom';
import { Car, ArrowRight, Star, Quote, Wrench, Calendar, CheckCircle } from 'lucide-react';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/pages.css';

export default function Index() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-card)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
          }}>
            <Car style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.025em' }}>GMS</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 600 }}>Sign In</Link>

        </div>
      </nav>

      <main style={{ flex: 1 }}>
        {/* Hero Section - Simplified & Aesthetic */}
        <section style={{
          padding: '8rem 2rem 6rem',
          textAlign: 'center',
          background: 'radial-gradient(circle at top center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="badge badge-primary" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              #1 Garage Management Solution
            </div>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              background: 'linear-gradient(to right, var(--color-foreground), var(--color-primary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Premium Auto Care<br />Simplified.
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-muted-foreground)', marginBottom: '2.5rem', maxWidth: '36rem', marginInline: 'auto' }}>
              Book top-tier car services, track repairs, and manage your garage experience all in one place.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ borderRadius: '2rem', paddingInline: '2rem' }}>
                Book a Service <ArrowRight style={{ width: '1.25rem', height: '1.25rem', marginLeft: '0.5rem' }} />
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section - Clean Cards */}
        <section style={{ padding: '6rem 2rem', backgroundColor: 'var(--color-card)' }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>Expert Services</h2>
              <p style={{ color: 'var(--color-muted-foreground)', fontSize: '1.125rem' }}>Professional care for your vehicle</p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {[
                { title: 'Oil Change', price: '₹1,500', icon: Wrench, desc: 'Premium synthetic oil change with filter replacement and multi-point inspection.' },
                { title: 'Brake Service', price: '₹3,500', icon: Car, desc: 'Complete brake pad replacement, rotor resurfacing (if needed), and fluid check.' },
                { title: 'AC Service', price: '₹2,500', icon: Calendar, desc: 'AC system diagnostic, leak test, gas refill, and cabin filter cleaning.' }
              ].map((service, index) => (
                <div key={index} className="card service-hover-card" style={{
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--color-border)',
                  borderRadius: '1.5rem',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      padding: '1rem',
                      borderRadius: '1rem',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--color-primary)'
                    }}>
                      <service.icon style={{ width: '2rem', height: '2rem' }} />
                    </div>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      backgroundColor: 'var(--color-background)',
                      padding: '0.5rem 1rem',
                      borderRadius: '2rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}>{service.price}</span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{service.title}</h3>
                  <p style={{ color: 'var(--color-muted-foreground)', marginBottom: '2rem', flex: 1, lineHeight: '1.6' }}>{service.desc}</p>

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                      <CheckCircle style={{ width: '1rem', height: '1rem', color: 'var(--color-success)' }} /> Expert Mechanics
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback Section - Modern Look */}
        <section style={{ padding: '6rem 2rem', position: 'relative' }}>
          <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>Client Stories</h2>
              <p style={{ color: 'var(--color-muted-foreground)', fontSize: '1.125rem' }}>Trusted by hundreds of happy customers</p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {[
                { name: 'Ravi Patel', role: 'Business Owner', rating: 5, text: 'The AC service was incredibly fast. I booked online, dropped my car off, and it was ready in 2 hours. Superb status tracking!' },
                { name: 'Sneha Joshi', role: 'Daily Commuter', rating: 4, text: 'Honest pricing and very professional staff. I really liked how I could pay online and just pick up my keys.' }
              ].map((feedback, index) => (
                <div key={index} className="card" style={{
                  padding: '2.5rem',
                  border: 'none',
                  backgroundColor: 'var(--color-background)',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700
                    }}>
                      {feedback.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>{feedback.name}</p>
                    </div>
                  </div>

                  <Quote style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem',
                    width: '3rem',
                    height: '3rem',
                    color: 'var(--color-muted)',
                    opacity: 0.5
                  }} />
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        style={{ width: '1.25rem', height: '1.25rem' }}
                        fill={i < feedback.rating ? '#eab308' : 'none'}
                        color={i < feedback.rating ? '#eab308' : 'var(--color-border)'}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '1.125rem', lineHeight: '1.7', position: 'relative', zIndex: 1 }}>"{feedback.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-card)',
        color: 'var(--color-muted-foreground)',
        fontSize: '0.875rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Car style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>GMS</span>
        </div>
        <p>© 2025 Garage Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
