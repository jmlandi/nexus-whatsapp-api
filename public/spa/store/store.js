// Store - Gerenciamento de Estado Global
const store = {
  // Estado
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: false,
    toast: {
      show: false,
      message: '',
      type: 'info'
    }
  },
  
  // Getters
  get user() {
    return this.state.user;
  },
  
  get token() {
    return this.state.token;
  },
  
  get isAuthenticated() {
    return this.state.isAuthenticated;
  },
  
  get toast() {
    return this.state.toast;
  },
  
  // Actions
  init() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      this.state.token = token;
      this.state.user = JSON.parse(userStr);
      this.state.isAuthenticated = true;
    }
  },
  
  setAuth(token, user) {
    this.state.token = token;
    this.state.user = user;
    this.state.isAuthenticated = true;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  logout() {
    this.state.token = null;
    this.state.user = null;
    this.state.isAuthenticated = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  showToast(message, type = 'info') {
    this.state.toast.show = true;
    this.state.toast.message = message;
    this.state.toast.type = type;
    
    setTimeout(() => {
      this.state.toast.show = false;
    }, 3000);
  }
};

// Inicializar store
store.init();
