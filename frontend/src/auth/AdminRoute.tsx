import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
