// src/main.jsx (veya index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // AuthProvider'ı import et
import './index.css'; // Global stilleriniz

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode'u test için geçici olarak kaldırmıştık, isterseniz geri ekleyebilirsiniz
  // <React.StrictMode>
    <AuthProvider> {/* Uygulamanın tamamını AuthProvider ile sar */}
      <App />
    </AuthProvider>
  // </React.StrictMode>
);