import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { current?: string; new?: string; confirm?: string } = {};
        let hasError = false;

        if (!currentPassword) {
            newErrors.current = "Current password is required";
            hasError = true;
        }

        if (!newPassword) {
            newErrors.new = "New password is required";
            hasError = true;
        } else if (newPassword.length < 6) {
            newErrors.new = "Password must be at least 6 characters";
            hasError = true;
        }

        if (!confirmPassword) {
            newErrors.confirm = "Please confirm your new password";
            hasError = true;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirm = "New passwords do not match";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        setLoading(true);
        try {
            const uid = localStorage.getItem('userUid');

            if (!uid) {
                toast.error("User not found (No UID). Please login again.");
                return;
            }

            const response = await fetch('http://localhost:5000/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid,
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Password changed successfully");
                onOpenChange(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setErrors({});
            } else {
                if (data.message === "Incorrect current password") {
                    setErrors({ current: data.message });
                } else {
                    toast.error(data.message || "Failed to change password");
                }
            }
        } catch (error: any) {
            console.error("Change Password Error:", error);
            toast.error("Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="current">Current Password</Label>
                        <Input
                            id="current"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        {errors.current && <span className="error-text">{errors.current}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new">New Password</Label>
                        <Input
                            id="new"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        {errors.new && <span className="error-text">{errors.new}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm New Password</Label>
                        <Input
                            id="confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {errors.confirm && <span className="error-text">{errors.confirm}</span>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
