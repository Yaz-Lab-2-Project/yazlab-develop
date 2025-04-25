// src/services/authService.js
import { getCookie } from '../utils/cookie';

const API_BASE = '/api';

export async function login({ username, password }) {
  const response = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    credentials: 'include',              // cookie’leri gönder
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Giriş başarısız');
  }
  return response.json();
}

export async function logout() {
  await fetch(`${API_BASE}/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
    },
  });
}
