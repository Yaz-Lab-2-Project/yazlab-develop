import axios from 'axios';

// Birleştirilmiş sunucu için API URL'i
const API_URL = '/api';

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

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // CSRF token'ı ekle
        const csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }

        // Auth token'ı ekle
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            config.headers['Authorization'] = `Token ${authToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Başarılı yanıtları doğrudan dön
        return response;
    },
    async (error) => {
        if (error.response?.status === 403) {
            // CSRF token'ı yenile
            try {
                await fetch('/api/set-csrf/', {
                    method: 'GET',
                    credentials: 'include'
                });
                // İsteği tekrar dene
                const config = error.config;
                // CSRF token'ı güncelle
                config.headers['X-CSRFToken'] = getCookie('csrftoken');
                return api(config);
            } catch (e) {
                console.error('CSRF token yenileme hatası:', e);
            }
        }
        if (error.response?.status === 401) {
            // Token geçersiz veya süresi dolmuş
            localStorage.removeItem('authToken');
            window.location.href = '/login';
            return Promise.reject(new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.'));
        }
        // Diğer hataları işle
        const errorMessage = error.response?.data?.detail || error.message || 'Bir hata oluştu';
        return Promise.reject(new Error(errorMessage));
    }
);

export default api; 