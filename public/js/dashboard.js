// Dashboard - carrega estatísticas e dados

let stats = {
  customers: 0,
  documents: 0,
  chats: 0,
  phones: 0
};

/**
 * Carrega estatísticas do dashboard
 */
async function loadStats() {
  try {
    // Busca clientes
    const customersData = await fetchAPI('/customer?pageSize=1');
    stats.customers = customersData.pagination?.total || 0;
    document.getElementById('totalCustomers').textContent = stats.customers;
    
    // Busca documentos
    const documentsData = await fetchAPI('/document?pageSize=1');
    stats.documents = documentsData.pagination?.total || 0;
    document.getElementById('totalDocuments').textContent = stats.documents;
    
    // Busca chats ativos
    const chatsData = await fetchAPI('/chat?isOpen=true&pageSize=1');
    stats.chats = chatsData.pagination?.total || 0;
    document.getElementById('totalChats').textContent = stats.chats;
    
    // Busca telefones
    const phonesData = await fetchAPI('/phone_number?pageSize=1');
    stats.phones = phonesData.pagination?.total || 0;
    document.getElementById('totalPhones').textContent = stats.phones;
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

/**
 * Carrega clientes recentes
 */
async function loadRecentCustomers() {
  try {
    const data = await fetchAPI('/customer?pageSize=5');
    const container = document.getElementById('recentCustomers');
    
    if (!data.customers || data.customers.length === 0) {
      container.innerHTML = '<p class="loading">Nenhum cliente cadastrado ainda.</p>';
      return;
    }
    
    const table = `
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefones</th>
            <th>Status</th>
            <th>Cadastrado em</th>
          </tr>
        </thead>
        <tbody>
          ${data.customers.map(customer => `
            <tr>
              <td>
                <strong>${customer.firstName} ${customer.lastName}</strong>
                ${customer.nickname ? `<br><small>${customer.nickname}</small>` : ''}
              </td>
              <td>${customer.phoneNumbers?.length || 0} número(s)</td>
              <td>
                <span class="badge ${customer.isActive ? 'badge-success' : 'badge-danger'}">
                  ${customer.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>${formatDate(customer.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = table;
  } catch (error) {
    console.error('Erro ao carregar clientes recentes:', error);
    const container = document.getElementById('recentCustomers');
    container.innerHTML = '<p class="loading">Erro ao carregar clientes.</p>';
  }
}

// Carrega dados ao iniciar
loadStats();
loadRecentCustomers();

// Event listener para botão de logout
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
