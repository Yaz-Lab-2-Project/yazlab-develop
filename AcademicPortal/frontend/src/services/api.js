import axios from 'axios';

const getBaseURL = () => {
  // Eğer window.location.host 8000 ise, tam adres kullan
  if (window.location.port === '8000') {
    return 'http://127.0.0.1:8000/api';
  }
  // Geliştirme ortamı için proxy
  return '/api';
};

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
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
        // Yanıtın JSON formatında olduğunu kontrol et
        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
            return Promise.reject(new Error('API yanıtı HTML formatında. Lütfen backend servisini kontrol edin.'));
        }
        return response;
    },
    (error) => {
        if (error.response) {
            // Backend'den gelen hata
            if (error.response.status === 401) {
                // Kayıt endpointi için yönlendirmeyi atla (401 beklenebilir)
                if (error.config.url && 
                   (error.config.url.includes('/users/register') || 
                    error.config.url.includes('/auth/register'))) {
                    return Promise.reject(error);
                }
                
                // Diğer 401 hataları için logout
                localStorage.removeItem('authToken');
                // Eğer zaten login sayfasında değilse yönlendir
                if (!window.location.pathname.includes('/login') && 
                    !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api; 