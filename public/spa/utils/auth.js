// Auth Utility - Autenticação
const authUtils = {
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  getToken() {
    return localStorage.getItem('token');
  },
  
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  async login(email, password) {
    try {
      const data = await api.post('/api/auth/login', { email, password });
      store.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  logout() {
    store.logout();
  }
};
