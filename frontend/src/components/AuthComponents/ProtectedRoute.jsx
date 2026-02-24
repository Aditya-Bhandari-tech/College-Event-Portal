import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

/**
 * ProtectedRoute – only lets authenticated users through.
 * If not logged in → redirect to /login.
 * While auth is still loading → show nothing (avoids flash).
 */
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // or a spinner

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
