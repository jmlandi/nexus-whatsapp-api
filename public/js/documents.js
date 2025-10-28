// Gerenciamento de documentos

let documents = [];
let customers = [];

/**
 * Carrega lista de documentos
 */
async function loadDocuments(customerId = null) {
  try {
    const endpoint = customerId 
      ? `/document/customer/${customerId}` 
      : '/document';
    
    const data = await fetchAPI(endpoint);
    documents = data.documents || [];
    renderDocuments();
  } catch (error) {
    console.error('Erro ao carregar documentos:', error);
    document.getElementById('documentsContainer').innerHTML = 
      '<p class="loading">Erro ao carregar documentos.</p>';
  }
}

/**
 * Carrega lista de clientes para os selects
 */
async function loadCustomersForSelect() {
  try {
    const data = await fetchAPI('/customer?pageSize=1000');
    customers = data.customers || [];
    
    // Popula os selects
    populateCustomerSelect('customerFilter', '', 'Todos os clientes');
    populateCustomerSelect('uploadCustomerId', '', 'Selecione um cliente');
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
  }
}

/**
 * Popula um select com clientes
 */
function populateCustomerSelect(selectId, defaultValue = '', defaultText = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  let options = defaultText ? `<option value="">${defaultText}</option>` : '';
  
  options += customers.map(customer => `
    <option value="${customer.id}">
      ${customer.firstName} ${customer.lastName}${customer.nickname ? ` (${customer.nickname})` : ''}
    </option>
  `).join('');
  
  select.innerHTML = options;
  if (defaultValue) select.value = defaultValue;
}

/**
 * Renderiza lista de documentos
 */
function renderDocuments() {
  const container = document.getElementById('documentsContainer');
  
  if (documents.length === 0) {
    container.innerHTML = '<p class="loading">Nenhum documento encontrado.</p>';
    return;
  }
  
  const table = `
    <table class="table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Data do Relatório</th>
          <th>Observações</th>
          <th>Upload em</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${documents.map(doc => `
          <tr>
            <td>
              <strong>${doc.customer.firstName} ${doc.customer.lastName}</strong>
              ${doc.customer.nickname ? `<br><small style="color: var(--text-light);">${doc.customer.nickname}</small>` : ''}
            </td>
            <td>${formatDate(doc.reportTimestamp)}</td>
            <td>${doc.observations || '<em>Sem observações</em>'}</td>
            <td>${formatDate(doc.createdAt)}</td>
            <td>
              <button class="btn btn-secondary btn-sm view-doc-btn" data-url="${doc.reportUrl}">
                👁️ Ver
              </button>
              <button class="btn btn-danger btn-sm delete-doc-btn" data-doc-id="${doc.id}">
                🗑️
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = table;
  
  // Adiciona event listeners aos botões
  document.querySelectorAll('.view-doc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.target.closest('button').dataset.url;
      window.open(url, '_blank');
    });
  });
  
  document.querySelectorAll('.delete-doc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const docId = e.target.closest('button').dataset.docId;
      deleteDocument(docId);
    });
  });
}

/**
 * Abre modal de upload
 */
function openUploadModal() {
  document.getElementById('uploadForm').reset();
  document.getElementById('fileName').textContent = 'Nenhum arquivo selecionado';
  document.getElementById('uploadProgress').style.display = 'none';
  
  // Define data de hoje como padrão
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('reportTimestamp').value = today;
  
  document.getElementById('uploadModal').classList.add('active');
}

/**
 * Fecha modal de upload
 */
function closeUploadModal() {
  document.getElementById('uploadModal').classList.remove('active');
}

/**
 * Atualiza nome do arquivo selecionado
 */
document.getElementById('documentFile')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const fileNameDisplay = document.getElementById('fileName');
  
  if (file) {
    fileNameDisplay.textContent = file.name;
  } else {
    fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
  }
});

/**
 * Faz upload do documento
 */
document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const customerId = document.getElementById('uploadCustomerId').value;
  const file = document.getElementById('documentFile').files[0];
  const reportTimestamp = document.getElementById('reportTimestamp').value;
  const observations = document.getElementById('observations').value;
  
  if (!customerId) {
    showError('Selecione um cliente');
    return;
  }
  
  if (!file) {
    showError('Selecione um arquivo PDF');
    return;
  }
  
  const btn = document.getElementById('uploadBtn');
  const progress = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  progress.style.display = 'block';
  
  try {
    // Cria FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customerId', customerId);
    if (reportTimestamp) {
      formData.append('reportTimestamp', new Date(reportTimestamp).toISOString());
    }
    if (observations) {
      formData.append('observations', observations);
    }
    
    // Simula progresso
    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue += 10;
      if (progressValue <= 90) {
        progressFill.style.width = progressValue + '%';
      }
    }, 200);
    
    // Faz upload
    await fetchAPI('/document/upload', {
      method: 'POST',
      body: formData
    });
    
    clearInterval(progressInterval);
    progressFill.style.width = '100%';
    progressText.textContent = 'Enviado com sucesso!';
    
    showSuccess('Documento enviado com sucesso!');
    
    setTimeout(() => {
      closeUploadModal();
      loadDocuments();
    }, 1000);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    showError(error.message || 'Erro ao enviar documento');
    progress.style.display = 'none';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar Documento';
  }
});

/**
 * Deleta um documento
 */
async function deleteDocument(documentId) {
  if (!confirm('Tem certeza que deseja deletar este documento?')) {
    return;
  }
  
  try {
    await fetchAPI(`/document/${documentId}`, {
      method: 'DELETE'
    });
    
    showSuccess('Documento deletado com sucesso!');
    loadDocuments();
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    showError(error.message || 'Erro ao deletar documento');
  }
}

/**
 * Filtra documentos por cliente
 */
document.getElementById('customerFilter')?.addEventListener('change', (e) => {
  const customerId = e.target.value;
  loadDocuments(customerId || null);
});

/**
 * Busca documentos
 */
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', debounce((e) => {
    const search = e.target.value.toLowerCase();
    
    if (!search) {
      renderDocuments();
      return;
    }
    
    const filtered = documents.filter(doc => {
      const customerName = `${doc.customer.firstName} ${doc.customer.lastName}`.toLowerCase();
      const nickname = (doc.customer.nickname || '').toLowerCase();
      const observations = (doc.observations || '').toLowerCase();
      return customerName.includes(search) || nickname.includes(search) || observations.includes(search);
    });
    
    const originalDocs = documents;
    documents = filtered;
    renderDocuments();
    documents = originalDocs;
  }, 300));
}

// Carrega dados ao iniciar
loadCustomersForSelect();
loadDocuments();

// Event listeners para botões
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  const uploadDocBtn = document.getElementById('uploadDocBtn');
  if (uploadDocBtn) {
    uploadDocBtn.addEventListener('click', openUploadModal);
  }
  
  const closeUploadModalBtn = document.getElementById('closeUploadModalBtn');
  if (closeUploadModalBtn) {
    closeUploadModalBtn.addEventListener('click', closeUploadModal);
  }
  
  const cancelUploadBtn = document.getElementById('cancelUploadBtn');
  if (cancelUploadBtn) {
    cancelUploadBtn.addEventListener('click', closeUploadModal);
  }
});

// Verifica se deve abrir modal automaticamente
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('action') === 'upload') {
  setTimeout(openUploadModal, 100);
}
