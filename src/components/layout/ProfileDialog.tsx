import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import '../../styles/components.css'; // Ensure we reuse existing styles
import clsx from 'clsx';

interface ProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
}

export function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState<Partial<ProfileData>>({});

    // Corrected key from Login.tsx
    const uid = localStorage.getItem('userUid');

    useEffect(() => {
        if (isOpen && uid) {
            fetchProfile();
        }
    }, [isOpen, uid]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/profile/${uid}`);
            const result = await response.json();
            if (result.success) {
                setData(result.profile);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors: Partial<ProfileData> = {};
        let isValid = true;

        // Name Validation: No digits allowed
        const nameRegex = /^([^0-9]*)$/;

        if (!data.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        } else if (!nameRegex.test(data.firstName)) {
            newErrors.firstName = 'Digits are not allowed in name';
            isValid = false;
        }

        if (!data.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        } else if (!nameRegex.test(data.lastName)) {
            newErrors.lastName = 'Digits are not allowed in name';
            isValid = false;
        }

        if (!data.phone.trim()) {
            newErrors.phone = 'Phone is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(data.phone)) {
            newErrors.phone = 'Phone must be 10 digits';
            isValid = false;
        }

        if (!data.address.trim()) {
            newErrors.address = 'Address is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/profile/${uid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (result.success) {
                toast.success("Profile updated successfully!");
                // Update local storage name if changed, so header updates on refresh
                localStorage.setItem('userName', `${data.firstName} ${data.lastName}`);
                setTimeout(() => {
                    onClose();
                    window.location.reload(); // Refresh to update header name
                }, 1500);
            } else {
                toast.error(result.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update failed", error);
            toast.error("An error occurred while saving");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Edit Profile</h2>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body profile-form">

                    <div className="form-row">
                        <div className="form-group">
                            <label className="label flex items-center gap-2">
                                <User size={16} /> First Name
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={data.firstName}
                                    onChange={(e) => setData({ ...data, firstName: e.target.value })}
                                    className={clsx('input', errors.firstName && 'input-error')}
                                />
                            </div>
                            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                        </div>

                        <div className="form-group">
                            <label className="label flex items-center gap-2">
                                <User size={16} /> Last Name
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={data.lastName}
                                    onChange={(e) => setData({ ...data, lastName: e.target.value })}
                                    className={clsx('input', errors.lastName && 'input-error')}
                                />
                            </div>
                            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label flex items-center gap-2">
                            <Phone size={16} /> Phone Number
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData({ ...data, phone: e.target.value })}
                                placeholder="10 digit mobile number"
                                className={clsx('input', errors.phone && 'input-error')}
                                maxLength={10}
                            />
                        </div>
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                    </div>

                    {/* Read Only Email */}
                    <div className="form-group">
                        <label className="label flex items-center gap-2">
                            <Mail size={16} /> Email
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                value={data.email}
                                disabled
                                className="input input-disabled"
                            />
                        </div>
                        <small className="hint-text" style={{ color: 'var(--color-error)' }}>Email cannot be changed</small>
                    </div>

                    <div className="form-group">
                        <label className="label flex items-center gap-2">
                            <MapPin size={16} /> Address
                        </label>
                        <div className="input-wrapper">
                            <textarea
                                value={data.address}
                                onChange={(e) => setData({ ...data, address: e.target.value })}
                                className={clsx('input', errors.address && 'input-error')}
                                rows={3}
                            />
                        </div>
                        {errors.address && <span className="error-text">{errors.address}</span>}
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
