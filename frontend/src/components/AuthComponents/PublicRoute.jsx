import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

/**
 * PublicRoute – only lets unauthenticated users through (login / signup / welcome).
 * If already logged in → redirect to their dashboard.
 * While auth is loading → shows a spinner, with a "reload" fallback after 5 s.
 */
export default function PublicRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();
    const [showReload, setShowReload] = useState(false);

    // If loading takes > 5 seconds, show a reload prompt
    useEffect(() => {
        if (!loading) return;
        const t = setTimeout(() => setShowReload(true), 5000);
        return () => clearTimeout(t);
    }, [loading]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#06060c",
                    gap: "16px",
                }}
            >
                {/* Spinner */}
                <div
                    style={{
                        width: 40,
                        height: 40,
                        border: "3px solid rgba(99,102,241,0.2)",
                        borderTopColor: "#6366f1",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                {showReload && (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 12 }}>
                            Taking too long? Try reloading.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: "10px 24px",
                                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (isAuthenticated) {
        const role = user?.role;
        let dashboardPath = "/student";
        if (role === "admin") dashboardPath = "/admin";
        else if (role === "faculty") dashboardPath = "/faculty";
        return <Navigate to={dashboardPath} replace />;
    }

    return children;
}
