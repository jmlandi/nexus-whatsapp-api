// Gerenciamento de clientes

let customers = [];
let editingCustomerId = null;
let phoneFieldsCount = 0;

/**
 * Carrega lista de clientes
 */
async function loadCustomers() {
  try {
    const data = await fetchAPI('/customer');
    customers = data.customers || [];
    renderCustomers();
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    document.getElementById('customersContainer').innerHTML = 
      '<p class="loading">Erro ao carregar clientes.</p>';
  }
}

/**
 * Renderiza lista de clientes
 */
function renderCustomers() {
  const tbody = document.getElementById('customersTableBody');
  
  if (customers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div class="empty-state-title">Nenhum cliente cadastrado</div>
            <div class="empty-state-text">Clique em "Novo Cliente" para começar</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = customers.map(customer => `
    <tr>
      <td>
        <strong>${customer.firstName} ${customer.lastName}</strong>
      </td>
      <td>${customer.nickname || '-'}</td>
      <td>
        ${customer.phoneNumbers?.map(p => 
          `<span class="phone-badge">${formatPhone(p.phoneNumber)}</span>`
        ).join(' ') || '-'}
      </td>
      <td><span class="badge badge-primary">${customer.reports?.length || 0}</span></td>
      <td><span class="badge badge-success">${customer.chats?.filter(c => c.isOpen).length || 0}</span></td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn edit-customer-btn" data-customer-id="${customer.id}" title="Editar">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button class="table-action-btn danger delete-customer-btn" data-customer-id="${customer.id}" title="Excluir">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  // Adiciona event listeners aos botões de editar
  document.querySelectorAll('.edit-customer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const customerId = e.target.closest('button').dataset.customerId;
      editCustomer(customerId);
    });
  });
  
  // Adiciona event listeners aos botões de excluir
  document.querySelectorAll('.delete-customer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const customerId = e.target.closest('button').dataset.customerId;
      deleteCustomer(customerId);
    });
  });
}

/**
 * Abre modal para novo cliente
 */
function openCustomerModal() {
  editingCustomerId = null;
  document.getElementById('modalTitle').textContent = 'Novo Cliente';
  document.getElementById('customerForm').reset();
  document.getElementById('customerId').value = '';
  document.getElementById('phoneNumbersContainer').innerHTML = '';
  phoneFieldsCount = 0;
  addPhoneField(); // Adiciona um campo de telefone inicial
  document.getElementById('customerModal').classList.add('active');
}

/**
 * Fecha modal de cliente
 */
function closeCustomerModal() {
  document.getElementById('customerModal').classList.remove('active');
}

/**
 * Adiciona campo de telefone
 */
function addPhoneField(phoneNumber = '', phoneId = '') {
  phoneFieldsCount++;
  const container = document.getElementById('phoneNumbersContainer');
  
  const div = document.createElement('div');
  div.className = 'form-group';
  div.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: center;">
      <input 
        type="tel" 
        class="phone-input" 
        data-phone-id="${phoneId}"
        placeholder="(00) 00000-0000" 
        value="${phoneNumber}"
        required
      >
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2.5 4H13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.5 4L4.5 13H11.5L12.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.5 2H9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  `;
  
  container.appendChild(div);
}

/**
 * Edita cliente
 */
async function editCustomer(customerId) {
  try {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    editingCustomerId = customerId;
    document.getElementById('modalTitle').textContent = 'Editar Cliente';
    document.getElementById('customerId').value = customer.id;
    document.getElementById('firstName').value = customer.firstName;
    document.getElementById('lastName').value = customer.lastName;
    document.getElementById('nickname').value = customer.nickname || '';
    
    // Carrega telefones
    document.getElementById('phoneNumbersContainer').innerHTML = '';
    phoneFieldsCount = 0;
    
    if (customer.phoneNumbers && customer.phoneNumbers.length > 0) {
      customer.phoneNumbers.forEach(phone => {
        addPhoneField(phone.phoneNumber, phone.id);
      });
    } else {
      addPhoneField();
    }
    
    document.getElementById('customerModal').classList.add('active');
  } catch (error) {
    console.error('Erro ao editar cliente:', error);
    showError('Erro ao carregar dados do cliente');
  }
}

/**
 * Deleta cliente
 */
async function deleteCustomer(customerId) {
  if (!confirm('Deseja realmente excluir este cliente?')) {
    return;
  }
  
  try {
    await fetchAPI(`/customer/${customerId}`, {
      method: 'DELETE'
    });
    
    showSuccess('Cliente excluído com sucesso!');
    loadCustomers();
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    showError(error.message || 'Erro ao excluir cliente');
  }
}

/**
 * Salva cliente (criar ou atualizar)
 */
document.getElementById('customerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const nickname = document.getElementById('nickname').value;
  
  // Coleta telefones
  const phoneInputs = document.querySelectorAll('.phone-input');
  const phoneNumbers = Array.from(phoneInputs)
    .map(input => input.value.replace(/\D/g, ''))
    .filter(phone => phone.length >= 10);
  
  if (phoneNumbers.length === 0) {
    showError('Adicione pelo menos um telefone válido');
    return;
  }
  
  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.textContent = 'Salvando...';
  
  try {
    if (editingCustomerId) {
      // Atualizar cliente existente
      await fetchAPI(`/customer/${editingCustomerId}`, {
        method: 'PUT',
        body: JSON.stringify({ firstName, lastName, nickname })
      });
      
      // Atualizar telefones (simplificado - deleta e recria)
      // Em produção, você faria um diff e apenas atualizaria as mudanças
      const customer = customers.find(c => c.id === editingCustomerId);
      if (customer && customer.phoneNumbers) {
        for (const phone of customer.phoneNumbers) {
          await fetchAPI(`/phone_number/${phone.id}`, { method: 'DELETE' });
        }
      }
      
      for (const phoneNumber of phoneNumbers) {
        await fetchAPI('/phone_number', {
          method: 'POST',
          body: JSON.stringify({
            customerId: editingCustomerId,
            phoneNumber
          })
        });
      }
      
      showSuccess('Cliente atualizado com sucesso!');
    } else {
      // Criar novo cliente
      const customerData = await fetchAPI('/customer', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, nickname })
      });
      
      // Adicionar telefones
      for (const phoneNumber of phoneNumbers) {
        await fetchAPI('/phone_number', {
          method: 'POST',
          body: JSON.stringify({
            customerId: customerData.customer.id,
            phoneNumber
          })
        });
      }
      
      showSuccess('Cliente criado com sucesso!');
    }
    
    closeCustomerModal();
    loadCustomers();
  } catch (error) {
    console.error('Erro ao salvar cliente:', error);
    showError(error.message || 'Erro ao salvar cliente');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar';
  }
});

/**
 * Busca clientes
 */
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', debounce((e) => {
    const search = e.target.value.toLowerCase();
    
    if (!search) {
      renderCustomers();
      return;
    }
    
    const filtered = customers.filter(customer => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      const nickname = (customer.nickname || '').toLowerCase();
      return fullName.includes(search) || nickname.includes(search);
    });
    
    const originalCustomers = customers;
    customers = filtered;
    renderCustomers();
    customers = originalCustomers;
  }, 300));
}

// Carrega clientes ao iniciar
loadCustomers();

// Event listeners para botões
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  const newCustomerBtn = document.getElementById('newCustomerBtn');
  if (newCustomerBtn) {
    newCustomerBtn.addEventListener('click', openCustomerModal);
  }
  
  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeCustomerModal);
  }
  
  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeCustomerModal);
  }
  
  const addPhoneBtn = document.getElementById('addPhoneBtn');
  if (addPhoneBtn) {
    addPhoneBtn.addEventListener('click', addPhoneField);
  }
});

// Verifica se deve abrir modal automaticamente
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('action') === 'new') {
  setTimeout(openCustomerModal, 100);
}
