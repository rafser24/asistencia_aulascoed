import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import PageLoader from "./components/common/PageLoader.jsx";

// Lazy loading por ruta para optimizar bundle
const Login = lazy(() => import("./pages/Login.jsx"));
const MarcarAsistencia = lazy(() => import("./pages/MarcarAsistencia.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<Login />} />

            {/* Alumno: requiere sesión, validación geofencing interna */}
            <Route
              path="/marcar"
              element={
                <ProtectedRoute>
                  <MarcarAsistencia />
                </ProtectedRoute>
              }
            />

            {/* Admin: requiere sesión + claim de admin */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
