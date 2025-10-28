// Simulador de chat com cliente

let customers = [];
let selectedCustomer = null;
let currentSessionId = null;
let messages = [];

/**
 * Carrega lista de clientes para o simulador
 */
async function loadCustomersForSimulator() {
  try {
    const data = await fetchAPI('/customer?pageSize=1000');
    customers = data.customers || [];
    
    const select = document.getElementById('customerSelect');
    const options = '<option value="">Escolha um cliente...</option>' +
      customers
        .filter(c => c.isActive && c.phoneNumbers && c.phoneNumbers.length > 0)
        .map(customer => `
          <option value="${customer.id}">
            ${customer.firstName} ${customer.lastName}${customer.nickname ? ` (${customer.nickname})` : ''}
          </option>
        `).join('');
    
    select.innerHTML = options;
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    showError('Erro ao carregar clientes');
  }
}

/**
 * Quando seleciona um cliente
 */
document.getElementById('customerSelect')?.addEventListener('change', async (e) => {
  const customerId = e.target.value;
  
  if (!customerId) {
    document.getElementById('customerInfo').style.display = 'none';
    document.getElementById('startChatBtn').style.display = 'none';
    return;
  }
  
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;
  
  selectedCustomer = customer;
  
  // Atualiza informações do cliente
  document.getElementById('customerName').textContent = 
    `${customer.firstName} ${customer.lastName}`;
  
  const phone = customer.phoneNumbers && customer.phoneNumbers.length > 0 
    ? formatPhone(customer.phoneNumbers[0].phoneNumber)
    : 'Sem telefone';
  document.getElementById('customerPhone').textContent = phone;
  
  // Conta documentos e conversas
  const docsCount = customer.reports?.length || 0;
  const chatsCount = customer.chats?.filter(c => c.isOpen).length || 0;
  
  document.getElementById('documentsCount').textContent = `${docsCount} documento${docsCount !== 1 ? 's' : ''}`;
  document.getElementById('chatsCount').textContent = `${chatsCount} conversa${chatsCount !== 1 ? 's' : ''}`;
  
  // Mostra informações e botão
  document.getElementById('customerInfo').style.display = 'block';
  document.getElementById('startChatBtn').style.display = 'block';
});

/**
 * Inicia simulação de chat
 */
async function startSimulation() {
  if (!selectedCustomer) return;
  
  try {
    // Cria uma sessão de webchat com o customerId
    const data = await fetchAPI('/webchat/session', {
      method: 'POST',
      body: JSON.stringify({
        customerId: selectedCustomer.id
      })
    });
    
    currentSessionId = data.sessionId;
    messages = [];
    
    // Atualiza interface
    document.querySelector('.simulator-selector').style.display = 'none';
    document.getElementById('chatSimulator').style.display = 'flex';
    document.getElementById('chatCustomerName').textContent = 
      `${selectedCustomer.firstName} ${selectedCustomer.lastName}`;
    
    // Limpa mensagens
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = `
      <div class="system-message">
        <p>💬 Simulação iniciada com ${selectedCustomer.firstName}. Digite sua mensagem como se fosse o cliente.</p>
      </div>
    `;
    
    // Foca no input
    document.getElementById('messageInput').focus();
  } catch (error) {
    console.error('Erro ao iniciar simulação:', error);
    showError('Erro ao iniciar simulação');
  }
}

/**
 * Encerra simulação
 */
async function endSimulation() {
  if (currentSessionId) {
    try {
      await fetchAPI(`/webchat/close/${currentSessionId}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    }
  }
  
  // Reset interface
  document.querySelector('.simulator-selector').style.display = 'block';
  document.getElementById('chatSimulator').style.display = 'none';
  document.getElementById('customerSelect').value = '';
  document.getElementById('customerInfo').style.display = 'none';
  document.getElementById('startChatBtn').style.display = 'none';
  
  currentSessionId = null;
  selectedCustomer = null;
  messages = [];
}

/**
 * Adiciona mensagem à interface
 */
function addMessageToUI(message, type) {
  const messagesContainer = document.getElementById('chatMessages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = message;
  
  messagesContainer.appendChild(messageDiv);
  
  // Scroll para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Envia mensagem
 */
document.getElementById('messageForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message || !currentSessionId) return;
  
  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;
  input.disabled = true;
  
  // Adiciona mensagem do usuário
  addMessageToUI(message, 'user');
  input.value = '';
  
  try {
    // Envia para a API
    const data = await fetchAPI('/webchat/message', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: currentSessionId,
        message
      })
    });
    
    // Adiciona resposta da IA
    if (data.reply) {
      addMessageToUI(data.reply, 'agent');
    } else if (data.response) {
      // Fallback para compatibilidade
      addMessageToUI(data.response, 'agent');
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    addMessageToUI('❌ Erro ao processar mensagem', 'agent');
  } finally {
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
  }
});

/**
 * Permite enviar com Enter
 */
document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('messageForm').dispatchEvent(new Event('submit'));
  }
});

// Carrega clientes ao iniciar
loadCustomersForSimulator();

// Event listeners para botões
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  const startChatBtn = document.getElementById('startChatBtn');
  if (startChatBtn) {
    startChatBtn.addEventListener('click', startSimulation);
  }
  
  const endSimulationBtn = document.getElementById('endSimulationBtn');
  if (endSimulationBtn) {
    endSimulationBtn.addEventListener('click', endSimulation);
  }
});
