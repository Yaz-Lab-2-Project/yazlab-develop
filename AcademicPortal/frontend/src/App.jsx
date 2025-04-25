// src/App.jsx

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Login from "./pages/auth/Login";

// User Pages
import Listings from "./pages/user/Listings";
import Apply from "./pages/user/Apply";
import MyApplications from "./pages/user/MyApplications";
import Profile from "./pages/user/Profile";
import UserDashboard from "./pages/user/Dashboard";

// Admin Pages
import AdminAdvertisements from "./pages/admin/Advertisements";
import AdminApplications from "./pages/admin/Applications";
import AdminUsers from "./pages/admin/Users";
import AdminDashboard from "./pages/admin/Dashboard";

// Jury Pages
import UserApplication from "./pages/jury/User-Application";
import Reviews from "./pages/jury/Reviews";
import Applications from "./pages/jury/Applications";
import Rapor from "./pages/jury/Rapor";
import JuryDashboard from "./pages/jury/Dashboard";

// Manager Pages
import ManagerDashboard from "./pages/manager/Dashboard";
import İlan from "./pages/manager/İlan";
import JuriAtama from "./pages/manager/JuriAtama";
import Basvurular from "./pages/manager/Basvurular";
import CriteriaPage from "./pages/manager/CriteriaPage";
import ManagerProfile from "./pages/manager/Profile";

function ProtectedRoute({ children, allowedRole }) {
  const [status, setStatus] = useState({ loading: true, role: null });

  useEffect(() => {
    fetch("/api/current-user/", {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(user => {
        // Django tarafında `user_type` alanı gelir: "ADAY", "ADMIN", "YONETICI", "JURI"
        setStatus({ loading: false, role: user.user_type.toLowerCase() });
      })
      .catch(() => {
        setStatus({ loading: false, role: null });
      });
  }, []);

  if (status.loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!status.role || status.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login or user dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* User */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRole="aday">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listing"
          element={
            <ProtectedRoute allowedRole="aday">
              <Listings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply"
          element={
            <ProtectedRoute allowedRole="aday">
              <Apply />
            </ProtectedRoute>
          }
        />
        <Route
          path="/basvurularim"
          element={
            <ProtectedRoute allowedRole="aday">
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRole="aday">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-applications"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-advertisements"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminAdvertisements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* Manager */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRole="yonetici">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-ilan"
          element={
            <ProtectedRoute allowedRole="yonetici">
              <İlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-juri-atama"
          element={
            <ProtectedRoute allowedRole="yonetici">
              <JuriAtama />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-basvurular"
          element={
            <ProtectedRoute allowedRole="yonetici">
              <Basvurular />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-criteriapage"
          element={
            <ProtectedRoute allowedRole="yonetici">
              <CriteriaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-profile"
          element={
            <ProtectedRoute allowedRole="yonetici">
              <ManagerProfile />
            </ProtectedRoute>
          }
        />

        {/* Jury */}
        <Route
          path="/jury"
          element={
            <ProtectedRoute allowedRole="juri">
              <JuryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jury-rapor"
          element={
            <ProtectedRoute allowedRole="juri">
              <Rapor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jury-reviews"
          element={
            <ProtectedRoute allowedRole="juri">
              <Reviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jury-applications"
          element={
            <ProtectedRoute allowedRole="juri">
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jury-userapplication"
          element={
            <ProtectedRoute allowedRole="juri">
              <UserApplication />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
