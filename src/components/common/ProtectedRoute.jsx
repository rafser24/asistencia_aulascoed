/**
 * components/common/ProtectedRoute.jsx
 * Guard de rutas. Redirige a /login si no hay sesión.
 * Si adminOnly=true, también verifica el custom claim de admin.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import PageLoader from "./PageLoader.jsx";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();

  // Mientras verifica la sesión
  if (loading) return <PageLoader message="Verificando sesión…" />;

  // Sin sesión → login
  if (!user) return <Navigate to="/login" replace />;

  // Ruta de admin sin claim de admin → login
  if (adminOnly && !isAdmin) return <Navigate to="/login" replace />;

  return children;
}
