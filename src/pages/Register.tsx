import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/layout.css';
import '../styles/components.css';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // First Name & Last Name: String only (alphabets)
    const nameRegex = /^[A-Za-z]+$/;
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First Name must be at least 2 characters';
    } else if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName = 'First Name must contain only letters';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last Name must be at least 2 characters';
    } else if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName = 'Last Name must contain only letters';
    }

    // Phone: No longer than 10 digits
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length > 10) {
      newErrors.phone = 'Phone number must not exceed 10 digits';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must contain only digits';
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Password: Min 10, 1 digit, 1 special char
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 10) {
      newErrors.password = 'Password must be at least 10 characters long';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one digit';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        setErrors({ general: data.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration Error:', error);
      setErrors({ general: 'Server error. Is the backend running?' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="auth-form-container" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="auth-card card" style={{ margin: '0' }}>
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
                margin: '0 auto'
              }}>
                <Car style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
            </div>
            <h2 className="card-title" style={{ fontSize: '1.5rem' }}>Create Account</h2>
            <p className="card-description">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card-content">
              {errors.general && (
                <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {errors.general}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="firstName" className="label">First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      id="firstName"
                      placeholder="John"
                      className="input input-with-icon"
                      // required // Removed HTML validation to show custom errors
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.firstName && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName" className="label">Last Name</label>
                  <input
                    id="lastName"
                    placeholder="Doe"
                    className="input"
                    // required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="label">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="input input-with-icon"
                    // required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="label">Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    className="input input-with-icon"
                    // required
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
                {errors.phone && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.phone}</span>}
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
                    // required
                    value={formData.password}
                    onChange={handleChange}
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
                {errors.password && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address" className="label">Address</label>
                <input
                  id="address"
                  placeholder="Enter your address"
                  className="input"
                  // required
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.address}</span>}
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