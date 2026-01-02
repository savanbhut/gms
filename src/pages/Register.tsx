import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff, User, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/layout.css';
import '../styles/components.css';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('customer');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="auth-layout">
      {/* Left side - Branding */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-branding-logo">
            <Car style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
          </div>
          <h1>Join GMS Today</h1>
          <p>
            Register your garage or become a customer to book services online.
            Experience seamless garage management.
          </p>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="auth-form-container">
        <div className="auth-card card" style={{ margin: '2rem 0' }}>
          <div className="card-header text-center">
            <div className="auth-card-mobile-logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ 
                width: '3rem', 
                height: '3rem', 
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Car style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
            </div>
            <h2 className="card-title" style={{ fontSize: '1.5rem' }}>Create Account</h2>
            <p className="card-description">Fill in your details to get started</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="userType" className="label">Account Type</label>
                <select
                  id="userType"
                  className="select"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                >
                  <option value="customer">Customer</option>
                  <option value="garage">Garage Owner</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="firstName" className="label">First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input id="firstName" placeholder="John" className="input input-with-icon" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="label">Last Name</label>
                  <input id="lastName" placeholder="Doe" className="input" required />
                </div>
              </div>

              {userType === 'garage' && (
                <div className="form-group">
                  <label htmlFor="garageName" className="label">Garage Name</label>
                  <div className="input-wrapper">
                    <Building2 className="input-icon" />
                    <input id="garageName" placeholder="AutoCare Pro" className="input input-with-icon" required />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="label">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input id="email" type="email" placeholder="john@example.com" className="input input-with-icon" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="label">Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" />
                  <input id="phone" type="tel" placeholder="+91 9876543210" className="input input-with-icon" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className="input input-with-icon input-with-right-icon"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-muted-foreground)'
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address" className="label">Address</label>
                <input id="address" placeholder="Enter your address" className="input" required />
              </div>
            </div>
            
            <div className="card-footer">
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', textAlign: 'center' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
