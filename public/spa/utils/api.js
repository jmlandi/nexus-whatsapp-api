// API Utility - Requisições HTTP
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const defaultHeaders = {};

  // Only add Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type from custom headers if body is FormData
  const customHeaders = { ...options.headers };
  if (options.body instanceof FormData && customHeaders['Content-Type']) {
    delete customHeaders['Content-Type'];
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...customHeaders
    }
  };

  try {
    console.log('🌐 API Request:', config.method || 'GET', endpoint);
    if (options.body && !(options.body instanceof FormData)) {
      console.log('📤 Request body:', JSON.stringify(JSON.parse(options.body), null, 2));
    }
    
    const response = await fetch(endpoint, config);

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    // Handle non-JSON responses (like HTML error pages)
    if (!isJson) {
      const text = await response.text();
      const isHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');

      if (isHtml) {
        console.error(`Server returned HTML instead of JSON (${response.status} ${response.statusText})`);
        console.error('HTML Response preview:', text.substring(0, 500));
        console.error('Request URL:', endpoint);
        console.error('Request method:', config.method || 'GET');
      } else {
        console.error('Non-JSON response:', text.substring(0, 200));
        console.error('Request URL:', endpoint);
      }

      throw new Error(
        `Erro no servidor: ${response.status} ${response.statusText || 'Erro desconhecido'}`
      );
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error(`Erro ao processar resposta do servidor: ${response.statusText || 'Invalid JSON'}`);
    }

    if (!response.ok) {
      // Cria um erro customizado com informações completas
      const error = new Error(data.message || data.error || 'Erro na requisição');
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: data
      };
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    // Se o erro não tem response, adiciona informações básicas
    if (!error.response) {
      error.response = {
        status: undefined,
        statusText: undefined,
        data: undefined
      };
    }
    throw error;
  }
}

// Métodos HTTP
const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

  post: (endpoint, body, options = {}) => apiRequest(endpoint, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options
  }),

  put: (endpoint, body) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
  }),

  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};
