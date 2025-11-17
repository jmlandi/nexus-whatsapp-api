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
    const response = await fetch(endpoint, config);

    // Clone the response so we can read it multiple times if needed
    const responseClone = response.clone();

    // Tenta fazer parse do JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Se não conseguir fazer parse, usa o clone para ler como texto
      try {
        const text = await responseClone.text();
        console.error('Response is not JSON:', text);
        throw new Error(`Erro na resposta do servidor: ${response.statusText || 'Unknown error'}`);
      } catch (textError) {
        console.error('Could not read response as text:', textError);
        throw new Error(`Erro na resposta do servidor: ${response.statusText || 'Unknown error'}`);
      }
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
