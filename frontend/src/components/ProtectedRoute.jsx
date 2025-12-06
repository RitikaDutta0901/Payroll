import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // redirect based on role
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "employee") return <Navigate to="/employee" replace />;
  }

  return children;
}

export default ProtectedRoute;
