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
  const container = document.getElementById('customersContainer');
  
  if (customers.length === 0) {
    container.innerHTML = '<p class="loading">Nenhum cliente cadastrado ainda.</p>';
    return;
  }
  
  const table = `
    <table class="table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Telefones</th>
          <th>Documentos</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${customers.map(customer => `
          <tr>
            <td>
              <strong>${customer.firstName} ${customer.lastName}</strong>
              ${customer.nickname ? `<br><small style="color: var(--text-light);">${customer.nickname}</small>` : ''}
            </td>
            <td>
              ${customer.phoneNumbers?.map(p => 
                `<div>${formatPhone(p.phoneNumber)}</div>`
              ).join('') || '<em>Nenhum</em>'}
            </td>
            <td>${customer.reports?.length || 0} documento(s)</td>
            <td>
              <span class="badge ${customer.isActive ? 'badge-success' : 'badge-danger'}">
                ${customer.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td>
              <button class="btn btn-secondary btn-sm edit-customer-btn" data-customer-id="${customer.id}">
                ✏️ Editar
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = table;
  
  // Adiciona event listeners aos botões de editar
  document.querySelectorAll('.edit-customer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const customerId = e.target.closest('button').dataset.customerId;
      editCustomer(customerId);
    });
  });
}

/**
 * Abre modal de novo cliente
 */
function openCustomerModal() {
  editingCustomerId = null;
  document.getElementById('modalTitle').textContent = 'Novo Cliente';
  document.getElementById('customerForm').reset();
  document.getElementById('customerId').value = '';
  document.getElementById('phonesContainer').innerHTML = '';
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
  const container = document.getElementById('phonesContainer');
  
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
        🗑️
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
    document.getElementById('phonesContainer').innerHTML = '';
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
  
  const btn = document.getElementById('saveCustomerBtn');
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
