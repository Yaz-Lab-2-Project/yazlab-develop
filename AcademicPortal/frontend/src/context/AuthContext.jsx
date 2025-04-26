// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

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
    const [user, setUser] = useState(null); // Giriş yapan kullanıcı bilgisi (veya null)
    const [isLoading, setIsLoading] = useState(true); // Oturum kontrolü yapılıyor mu?

    // Oturum Kontrolü - Uygulama ilk yüklendiğinde çalışır
    const checkUserSession = useCallback(async () => {
        console.log("AuthProvider: Checking user session...");
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/auth/user/', {
                method: 'GET',
                credentials: 'include', // Çerezleri göndermek için önemli!
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const userData = await response.json();
                console.log("AuthProvider: Session valid, user data:", userData);
                setUser(userData); // Kullanıcı varsa state'i güncelle
            } else {
                console.log("AuthProvider: No active session found (status:", response.status, ")");
                setUser(null); // Oturum yoksa kullanıcı null
            }
        } catch (error) {
            console.error("AuthProvider: Error checking session:", error);
            setUser(null); // Hata durumunda kullanıcı null
        } finally {
            setIsLoading(false); // Yükleme bitti
            console.log("AuthProvider: Session check finished.");
        }
    }, []); // Boş bağımlılık dizisi, sadece ilk mount'ta çalışır

    useEffect(() => {
        checkUserSession();
    }, [checkUserSession]); // checkUserSession'ı bağımlılık olarak ekle


    // Login fonksiyonu - Login.jsx tarafından çağrılacak
    const login = useCallback((userData) => {
        console.log("AuthProvider: Setting user data after login:", userData);
        setUser(userData);
        // İsteğe bağlı: Başarılı login sonrası session kontrolünü tekrar tetiklemek
        // yerine direkt state'i set etmek genellikle yeterlidir.
    }, []);

    // Logout fonksiyonu
    const logout = useCallback(async () => {
        console.log("AuthProvider: Logging out...");
        const csrftoken = getCookie('csrftoken');
        if (!csrftoken) {
            console.error('Logout için CSRF token bulunamadı.');
            // Yine de local state'i temizleyebiliriz
        }
        try {
            await fetch('http://localhost:8000/api/auth/logout/', {
                 method: 'POST',
                 credentials: 'include',
                 headers: {
                     'Content-Type': 'application/json',
                     'X-CSRFToken': csrftoken || "" // Token yoksa boş gönderilebilir, backend zaten session'ı siler
                 }
             });
             console.log("AuthProvider: Logout API call successful (or attempted).");
        } catch(err) {
             console.error("AuthProvider: Logout API call failed:", err);
         }
         finally {
               setUser(null); // Her durumda local kullanıcı state'ini temizle
               console.log("AuthProvider: User state set to null.");
         }
    }, []); // Bağımlılık yok


    // Context Provider'ın sağladığı değerler
    const value = {
        user, // Mevcut kullanıcı objesi veya null
        isAuthenticated: !!user, // user varsa true, yoksa false
        isLoading, // Oturum kontrolü devam ediyor mu?
        login, // Login fonksiyonu
        logout // Logout fonksiyonu
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