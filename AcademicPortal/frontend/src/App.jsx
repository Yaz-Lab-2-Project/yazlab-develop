// src/App.jsx

import React, { useEffect } from "react"; // useEffect eklendi (AuthHandler için)
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,     // useNavigate eklendi (AuthHandler için)
    useLocation      // useLocation eklendi (AuthHandler için)
} from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // useAuth import edildi

// Sayfa Bileşenleri
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Listings from "./pages/user/Listings";
import Apply from "./pages/user/Apply";
import MyApplications from "./pages/user/MyApplications";
import Profile from "./pages/user/Profile";
import UserDashboard from "./pages/user/Dashboard";
import AdminAdvertisements from "./pages/admin/Advertisements";
import AdminApplications from "./pages/admin/Applications";
import AdminUsers from "./pages/admin/Users";
import AdminDashboard from "./pages/admin/Dashboard";
import UserApplication from "./pages/jury/User-Application";
import Reviews from "./pages/jury/Reviews";
import Applications from "./pages/jury/Applications";
import Rapor from "./pages/jury/Rapor";
import JuryDashboard from "./pages/jury/Dashboard";
import ManagerDashboard from "./pages/manager/Dashboard";
import Basvurular from "./pages/manager/Basvurular";
import CriteriaPage from "./pages/manager/CriteriaPage";
import ManagerProfile from "./pages/manager/Profile";

// İlan Listesi Sayfası
import Ilan from "./pages/manager/Ilan";
// İlan Kriter Sayfası (ilan id ile görüntülenecek)
import IlanKriter from "./pages/manager/IlanKriter";

// --- ProtectedRoute (Context Kullanan Versiyon) ---
// Bu bileşeni ayrı bir dosyaya (örn: src/components/ProtectedRoute.jsx) taşımanız önerilir.
function ProtectedRoute({ children, allowedRole }) {
    const { isAuthenticated, user, isLoading } = useAuth(); // Sadece context'i oku

    console.log("ProtectedRoute Check for:", window.location.pathname, { isLoading, isAuthenticated, userRole: user?.user_type?.toLowerCase(), allowedRole });

    // console.log("ProtectedRoute Check:", { isLoading, isAuthenticated, user, allowedRole });

    if (isLoading) {
        // console.log("ProtectedRoute: Rendering loading state from context.");
        return <div>Oturum kontrol ediliyor...</div>;
    }

    if (!isAuthenticated) {
        // console.log("ProtectedRoute: Not authenticated, redirecting to login.");
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.user_type ? user.user_type.toLowerCase() : null;
    if (userRole !== allowedRole) {
        // console.log(`ProtectedRoute: Role mismatch (User: ${userRole}, Allowed: ${allowedRole}), redirecting.`);
        return <Navigate to="/login" replace />; // Veya Yetkisiz Erişim sayfasına
    }

    // console.log("ProtectedRoute: Access granted, rendering children.");
    return children;
}


// --- Auth Durumunu Dinleyip Yönlendiren Bileşen ---
function AuthHandler() {
    const { isAuthenticated, user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoading) return; // Yükleme bitene kadar bekle

        if (isAuthenticated && user) {
            // Kullanıcı giriş yapmışsa
            const onLoginPage = location.pathname === '/login';
            const userRole = user.user_type ? user.user_type.toLowerCase() : null;
            let targetPath = '/'; // Default fallback

            if (userRole === "admin") targetPath = "/admin";
            else if (userRole === "aday") targetPath = "/user";
            else if (userRole === "yonetici") targetPath = "/manager";
            else if (userRole === "juri") targetPath = "/jury";

            // Tüm dashboard ve ilgili alt sayfaları kapsayan path'ler
            const dashboardPaths = [
              // User
              '/user', '/listing', '/apply', '/basvurularim', '/profile',
              // Admin
              '/admin', '/admin-applications', '/admin-advertisements', '/admin-users',
              // Manager
              '/manager', '/manager-ilan', '/manager-ilan/', '/manager-basvurular', '/manager-criteriapage', '/manager-profile',
              // Jury
              '/jury', '/jury-rapor', '/jury-reviews', '/jury-applications', '/jury-userapplication'
            ];
            const isOnDashboard = dashboardPaths.some(path => location.pathname.startsWith(path));

            if (targetPath !== '/' && (onLoginPage || !isOnDashboard)) {
                console.log(`AuthHandler: User authenticated (Role: ${userRole}). Navigating to ${targetPath}`);
                navigate(targetPath, { replace: true });
            }
        } else {
            // Kullanıcı giriş yapmamışsa ve korumalı olmayan bir sayfada değilse (örn: /login değilse) login'e yönlendir
            // Bu kısım isteğe bağlı, belki ProtectedRoute yeterlidir.
            // if (location.pathname !== '/login') {
            //     console.log("AuthHandler: User not authenticated. Navigating to /login");
            //     navigate('/login', { replace: true });
            // }
        }

    }, [isAuthenticated, user, isLoading, navigate, location]);

    return null; // Bu bileşen bir şey render etmez
}


// --- Ana App Fonksiyonu ---
export default function App() {
    return (
        <Router>
            {/* AuthHandler, Router içinde ama Routes dışında olmalı */}
            <AuthHandler />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* User Routes */}
                <Route path="/user" element={<ProtectedRoute allowedRole="aday"><UserDashboard /></ProtectedRoute>} />
                <Route path="/listing" element={<ProtectedRoute allowedRole="aday"><Listings /></ProtectedRoute>} />
                <Route path="/apply/:ilanId" element={<ProtectedRoute allowedRole="aday"><Apply /></ProtectedRoute>} />
                <Route path="/basvurularim" element={<ProtectedRoute allowedRole="aday"><MyApplications /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute allowedRole="aday"><Profile /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin-applications" element={<ProtectedRoute allowedRole="admin"><AdminApplications /></ProtectedRoute>} />
                <Route path="/admin-advertisements" element={<ProtectedRoute allowedRole="admin"><AdminAdvertisements /></ProtectedRoute>} />
                <Route path="/admin-users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />

                {/* Manager Routes */}
                <Route path="/manager" element={<ProtectedRoute allowedRole="yonetici"><ManagerDashboard /></ProtectedRoute>} />
                <Route path="/manager-ilan" element={<ProtectedRoute allowedRole="yonetici"><Ilan /></ProtectedRoute>} /> {/* Ilan listesi */}
                <Route path="/manager-ilan/:id" element={<ProtectedRoute allowedRole="yonetici"><IlanKriter /></ProtectedRoute>} /> {/* Ilan kriter sayfası */}
                <Route path="/manager-basvurular" element={<ProtectedRoute allowedRole="yonetici"><Basvurular /></ProtectedRoute>} />
                <Route path="/manager-criteriapage" element={<ProtectedRoute allowedRole="yonetici"><CriteriaPage /></ProtectedRoute>} />
                <Route path="/manager-profile" element={<ProtectedRoute allowedRole="yonetici"><ManagerProfile /></ProtectedRoute>} />

                {/* Jury Routes */}
                <Route path="/jury" element={<ProtectedRoute allowedRole="juri"><JuryDashboard /></ProtectedRoute>} />
                <Route path="/jury-rapor" element={<ProtectedRoute allowedRole="juri"><Rapor /></ProtectedRoute>} />
                <Route path="/jury-reviews" element={<ProtectedRoute allowedRole="juri"><Reviews /></ProtectedRoute>} />
                <Route path="/jury-applications" element={<ProtectedRoute allowedRole="juri"><Applications /></ProtectedRoute>} />
                <Route path="/jury-userapplication/:id" element={<ProtectedRoute allowedRole="juri"><UserApplication /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}