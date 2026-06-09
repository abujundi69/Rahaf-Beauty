import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function CustomerRoute({ children }) {
  const { authLoading, isAdmin, isAuthenticated, isCustomer } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <div className="container-page py-16 text-center text-sm font-bold text-muted">جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isCustomer) {
    return <Navigate to={isAdmin ? "/admin" : "/login"} replace />;
  }

  return children;
}
