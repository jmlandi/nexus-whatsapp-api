// Funções de autenticação e verificação de token

/**
 * Verifica se o usuário está autenticado
 */
function isAuthenticated() {
  const token = localStorage.getItem('token');
  return !!token;
}

/**
 * Obtém o token do localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Obtém os dados do usuário do localStorage
 */
function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Faz logout do usuário
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

/**
 * Redireciona para login se não estiver autenticado
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

/**
 * Carrega informações do usuário na interface
 */
function loadUserInfo() {
  const user = getUser();
  if (user) {
    const userInfoElements = document.querySelectorAll('#userInfo .user-name');
    userInfoElements.forEach(el => {
      el.textContent = user.name;
    });
  }
}

// Verifica autenticação ao carregar páginas protegidas
if (window.location.pathname !== '/login.html' && 
    window.location.pathname !== '/register.html' &&
    window.location.pathname !== '/chat.html') {
  if (requireAuth()) {
    loadUserInfo();
  }
}

// Redireciona para dashboard se já estiver autenticado (nas páginas de login/registro)
if ((window.location.pathname === '/login.html' || 
     window.location.pathname === '/register.html') && 
    isAuthenticated()) {
  window.location.href = '/dashboard.html';
}
