// Funções auxiliares para chamadas à API

const API_BASE = '/api';

/**
 * Faz uma requisição autenticada à API
 */
async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    ...options.headers,
  };
  
  // Adiciona token se existir (exceto para auth endpoints)
  if (token && !endpoint.startsWith('/auth/')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Adiciona Content-Type se não for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  
  // Se não autorizado, redireciona para login
  if (response.status === 401) {
    logout();
    return;
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }
  
  return data;
}

/**
 * Formata data para exibição
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata telefone para exibição
 */
function formatPhone(phone) {
  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '');
  
  // Formata conforme o tamanho
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Mostra mensagem de erro
 */
function showError(message) {
  // Você pode implementar um toast/notification aqui
  alert(message);
}

/**
 * Mostra mensagem de sucesso
 */
function showSuccess(message) {
  // Você pode implementar um toast/notification aqui
  alert(message);
}

/**
 * Debounce para inputs de busca
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
