import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
    const user = localStorage.getItem('userUid');
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
    const user = localStorage.getItem('userUid');
    // If user is already logged in, redirect them away from public pages like /login or /register
    // Redirect to dashboard (or wherever appropriate)
    return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
