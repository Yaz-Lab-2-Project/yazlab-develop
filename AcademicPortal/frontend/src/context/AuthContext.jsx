// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

// CSRF token'ı çerezden okumak için yardımcı fonksiyon
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// 1. Context'i oluştur
const AuthContext = createContext(null);

// 2. Provider Component'i oluştur
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

    const checkUserSession = useCallback(async () => {
        console.log("AuthProvider: Checking user session...");
        setIsLoading(true);
        
        if (!authToken) {
            console.log("AuthProvider: No auth token found");
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/user/');
            
            if (response.data) {
                console.log("AuthProvider: Session valid, user data:", response.data);
                setUser(response.data);
            } else {
                console.log("AuthProvider: Invalid session, clearing auth data");
                localStorage.removeItem('authToken');
                setAuthToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error("AuthProvider: Error checking session:", error);
            localStorage.removeItem('authToken');
            setAuthToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        checkUserSession();
    }, [checkUserSession]);

    const login = useCallback((userData, token) => {
        console.log("AuthProvider: Setting user data after login:", userData);
        if (token) {
            localStorage.setItem('authToken', token);
            setAuthToken(token);
        }
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        console.log("AuthProvider: Logging out...");
        try {
            await api.post('/auth/logout/');
        } catch (err) {
            console.error("AuthProvider: Logout API call failed:", err);
        } finally {
            localStorage.removeItem('authToken');
            setAuthToken(null);
            setUser(null);
        }
    }, []);

    const hasRole = useCallback((requiredRole) => {
        if (!user) return false;
        if (requiredRole === 'admin') return user.user_type === 'ADMIN';
        if (requiredRole === 'manager') return user.user_type === 'YONETICI';
        if (requiredRole === 'jury') return user.user_type === 'JURI';
        if (requiredRole === 'candidate') return user.user_type === 'ADAY';
        return false;
    }, [user]);

    // Context Provider'ın sağladığı değerler
    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        authToken,
        hasRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Context'i kolayca kullanmak için özel bir hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};