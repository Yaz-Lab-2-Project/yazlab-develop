import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Login from "./pages/auth/Login";

//User Pages
import Listings from "./pages/user/Listings";
import Apply from "./pages/user/Apply";
import MyApplications from "./pages/user/MyApplications";
import Profile from "./pages/user/Profile";
import UserDashboard from "./pages/user/Dashboard";

//Admin Pages
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

const ProtectedRoute = ({ children, allowedRole }) => {
  const role = localStorage.getItem("role");
  if (!role || role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />
        <Route path="/login" element={<Login />} />

        {/* User Links */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listing"
          element={
            <ProtectedRoute allowedRole="user">
              <Listings />
            </ProtectedRoute>
          }
        />
        <Route path="/apply" element={<Apply />} />
        <Route path="/basvurularim" element={<MyApplications />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin Links */}
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

        {/* Manager Links */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-ilan"
          element={
            <ProtectedRoute allowedRole="manager">
              <İlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-juri-atama"
          element={
            <ProtectedRoute allowedRole="manager">
              <JuriAtama />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-basvurular"
          element={
            <ProtectedRoute allowedRole="manager">
              <Basvurular />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-criteriapage"
          element={
            <ProtectedRoute allowedRole="manager">
              <CriteriaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager-profile"
          element={
            <ProtectedRoute allowedRole="manager">
              <ManagerProfile />
            </ProtectedRoute>
          }
        />

        {/* Jury Links */}
        <Route
          path="/jury"
          element={
            <ProtectedRoute allowedRole="jury">
              <JuryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jury-rapor"
          element={
            <ProtectedRoute allowedRole="jury">
              <Rapor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jury-reviews"
          element={
            <ProtectedRoute allowedRole="jury">
              <Reviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jury-applications"
          element={
            <ProtectedRoute allowedRole="jury">
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jury-userapplication"
          element={
            <ProtectedRoute allowedRole="jury">
              <UserApplication />
            </ProtectedRoute>
          }
        />
        <Route path="/applications" element={<Applications />} />
        <Route path="/user-application/:id" element={<UserApplication />} />
      </Routes>
    </Router>
  );
}
