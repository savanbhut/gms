import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff } from 'lucide-react'; // Added Users icon
import { toast } from 'sonner';
import '../styles/layout.css';
import '../styles/components.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New State for Role - Removed manual selection
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

    // Simulate API call and Auto-detect Role
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Save role and user info to localStorage
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userUid', data.user.uid); // Save UID for fetching bookings
        localStorage.setItem('userName', data.user.name);

        toast.success(`Login successful as ${data.user.role}!`);
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Invalid Credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast.error('Server error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Added inline styles to center the content and remove the split layout feel
    <div className="auth-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>

      {/* Removed "auth-branding" div completely */}

      {/* Login form - Added maxWidth to keep it centered and nice looking */}
      <div className="auth-form-container" style={{ width: '100%', maxWidth: '480px' }}>
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
                justifyContent: 'center',
                margin: '0 auto' // Ensure logo is centered
              }}>
                <Car style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
            </div>
            <h2 className="card-title" style={{ fontSize: '1.5rem' }}>Welcome Back</h2>
            <p className="card-description">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card-content">

              {/* Role Dropdown Removed - Auto-detected */}

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