import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/layout.css';
import '../styles/components.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Login successful!');
      navigate('/dashboard');
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
          <h1>Garage Management System</h1>
          <p>
            Streamline your garage operations with our comprehensive management solution.
            Track bookings, manage staff, and grow your business.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="auth-form-container">
        <div className="auth-card card">
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
            <h2 className="card-title" style={{ fontSize: '1.5rem' }}>Welcome Back</h2>
            <p className="card-description">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="email" className="label">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@garage.com"
                    className="input input-with-icon"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="input input-with-icon input-with-right-icon"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <input type="checkbox" style={{ borderRadius: '0.25rem' }} />
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="card-footer">
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', textAlign: 'center' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
