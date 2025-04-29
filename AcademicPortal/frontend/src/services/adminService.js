import api from './api';

// Kullanıcı işlemleri
export const userService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/users/', { params });
      return Array.isArray(response.data?.results) ? response.data.results : 
             Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Kullanıcılar alınırken hata:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Kullanıcı (${id}) alınırken hata:`, error);
      throw error;
    }
  },
  
  create: async (userData) => {
    try {
      const response = await api.post('/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Kullanıcı oluşturulurken hata:', error);
      throw error;
    }
  },
  
  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}/`, userData);
      return response.data;
    } catch (error) {
      console.error(`Kullanıcı (${id}) güncellenirken hata:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Kullanıcı (${id}) silinirken hata:`, error);
      throw error;
    }
  }
};

// İlan işlemleri
export const advertisementService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/ilanlar/', { params });
      return Array.isArray(response.data?.results) ? response.data.results : 
             Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('İlanlar alınırken hata:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/ilanlar/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`İlan (${id}) alınırken hata:`, error);
      throw error;
    }
  },
  
  create: async (adData) => {
    try {
      const response = await api.post('/ilanlar/', adData);
      return response.data;
    } catch (error) {
      console.error('İlan oluşturulurken hata:', error);
      throw error;
    }
  },
  
  update: async (id, adData) => {
    try {
      const response = await api.put(`/ilanlar/${id}/`, adData);
      return response.data;
    } catch (error) {
      console.error(`İlan (${id}) güncellenirken hata:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/ilanlar/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`İlan (${id}) silinirken hata:`, error);
      throw error;
    }
  }
};

// Başvuru işlemleri
export const applicationService = {
  getAll: async (params) => {
    try {
      const response = await api.get('/basvurular/', { 
        params,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Yanıtın JSON formatında olduğunu kontrol et
      if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
        throw new Error('API yanıtı HTML formatında. Lütfen backend servisini kontrol edin.');
      }

      return Array.isArray(response.data?.results) ? response.data.results : 
             Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Başvurular alınırken hata:', error);
      if (error.response) {
        // Backend'den gelen hata mesajını göster
        throw new Error(`Sunucu hatası: ${error.response.status} - ${error.response.data?.message || 'Bilinmeyen hata'}`);
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        throw new Error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        // İstek oluşturulurken hata oluştu
        throw new Error(`Başvurular alınırken hata oluştu: ${error.message}`);
      }
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/basvurular/${id}/`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Başvuru (${id}) alınırken hata:`, error);
      throw error;
    }
  },
  
  update: async (id, applicationData) => {
    try {
      const response = await api.put(`/basvuru/${id}/`, applicationData);
      return response.data;
    } catch (error) {
      console.error(`Başvuru (${id}) güncellenirken hata:`, error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/basvuru/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Başvuru (${id}) silinirken hata:`, error);
      throw error;
    }
  }
};

// Dashboard verileri
export const dashboardService = {
  getStats: async () => {
    try {
      const response = await api.get('/admin-stats/');
      
      // Veri doğrulama
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Geçersiz dashboard verisi');
      }

      // Stats objesi kontrolü
      const stats = response.data.stats || {};

      // DepartmentApplications array kontrolü ve normalizasyonu
      let departmentApplications = [];
      if (Array.isArray(response.data.departmentApplications)) {
        departmentApplications = response.data.departmentApplications
          .filter(item => item && item.name) // Geçersiz verileri filtrele
          .map(item => ({
            name: item.name || 'Bilinmeyen',
            value: parseInt(item.value) || 0
          }))
          .filter(item => item.value > 0); // Sıfır değerli verileri filtrele
      }

      // Veriyi normalize et
      return {
        stats: {
          totalPostings: parseInt(stats.totalPostings) || 0,
          activePostings: parseInt(stats.activePostings) || 0,
          ongoingApplications: parseInt(stats.ongoingApplications) || 0,
          mostApplied: stats.mostApplied || '-',
          totalUsers: parseInt(stats.totalUsers) || 0,
          totalApplications: parseInt(stats.totalApplications) || 0
        },
        departmentApplications
      };
    } catch (error) {
      console.error('Dashboard verisi alınırken hata:', error);
      // Hata mesajını daha açıklayıcı hale getir
      if (error.response?.status === 403) {
        throw new Error('Bu sayfaya erişim yetkiniz yok');
      } else if (error.response?.status === 401) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın');
      } else if (!error.response) {
        throw new Error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin');
      }
      throw error;
    }
  },
  
  getRecentActivities: async () => {
    const response = await api.get('/dashboard/recent-activities/');
    return response.data;
  }
}; 