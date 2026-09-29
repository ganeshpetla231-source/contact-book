import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function PrivateRoute() {
  const auth = useAuth();
  const token = auth?.token ?? null;
  const loading = auth?.loading ?? false;
  const location = useLocation();

  if (loading) return <Loader label="Opening your book..." />;
  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
