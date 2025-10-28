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
    showError('Erro ao carregar documentos');
  }
}

/**
 * Carrega lista de clientes para o select
 */
async function loadCustomersForSelect() {
  try {
    const data = await fetchAPI('/customer?pageSize=1000');
    customers = data.customers || [];
    
    // Popula o select do modal
    const select = document.getElementById('customerSelect');
    if (select) {
      select.innerHTML = '<option value="">Selecione um cliente...</option>' +
        customers.map(customer => `
          <option value="${customer.id}">
            ${customer.firstName} ${customer.lastName}${customer.nickname ? ` (${customer.nickname})` : ''}
          </option>
        `).join('');
    }
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
  }
}

/**
 * Renderiza lista de documentos em grid
 */
function renderDocuments() {
  const grid = document.getElementById('documentsGrid');
  
  if (documents.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div class="empty-state-title">Nenhum documento encontrado</div>
        <div class="empty-state-text">Faça upload de PDFs para começar</div>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = documents.map(doc => `
    <div class="document-card">
      <div class="document-card-icon">
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
      </div>
      <div class="document-card-content">
        <div class="document-card-title">${doc.customer.firstName} ${doc.customer.lastName}</div>
        ${doc.customer.nickname ? `<div class="document-card-subtitle">${doc.customer.nickname}</div>` : ''}
        <div class="document-card-meta">
          <span class="document-card-date">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            ${formatDate(doc.reportTimestamp)}
          </span>
        </div>
        ${doc.observations ? `<div class="document-card-description">${doc.observations}</div>` : ''}
      </div>
      <div class="document-card-actions">
        <button class="btn btn-secondary btn-sm view-doc-btn" data-url="${doc.reportUrl}" title="Ver PDF">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </button>
        <button class="btn btn-danger btn-sm delete-doc-btn" data-doc-id="${doc.id}" title="Excluir">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
  
  // Adiciona event listeners
  document.querySelectorAll('.view-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      window.open(url, '_blank');
    });
  });
  
  document.querySelectorAll('.delete-doc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const docId = parseInt(btn.dataset.docId);
      deleteDocument(docId);
    });
  });
}

/**
 * Abre modal de upload
 */
function openUploadModal() {
  document.getElementById('uploadForm').reset();
  document.getElementById('uploadModal').classList.remove('hidden');
}

/**
 * Fecha modal de upload
 */
function closeUploadModal() {
  document.getElementById('uploadModal').classList.add('hidden');
}

/**
 * Faz upload de documento
 */
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const customerId = parseInt(document.getElementById('customerSelect').value);
  const reportDate = document.getElementById('reportDate').value;
  const observations = document.getElementById('observations').value;
  const fileInput = document.getElementById('fileInput');
  
  if (!fileInput.files[0]) {
    showError('Selecione um arquivo PDF');
    return;
  }
  
  const btn = document.getElementById('confirmUploadBtn');
  const btnText = btn.querySelector('span');
  const originalText = btnText.textContent;
  btn.disabled = true;
  btnText.textContent = 'Enviando...';
  
  try {
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('customerId', customerId);
    formData.append('reportTimestamp', new Date(reportDate).toISOString());
    if (observations) {
      formData.append('observations', observations);
    }
    
    const response = await fetch('/document', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload');
    }
    
    showSuccess('Documento enviado com sucesso!');
    closeUploadModal();
    loadDocuments();
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    showError(error.message || 'Erro ao fazer upload do documento');
  } finally {
    btn.disabled = false;
    btnText.textContent = originalText;
  }
});

/**
 * Deleta documento
 */
async function deleteDocument(documentId) {
  if (!confirm('Deseja realmente excluir este documento?')) {
    return;
  }
  
  try {
    await fetchAPI(`/document/${documentId}`, {
      method: 'DELETE'
    });
    
    showSuccess('Documento excluído com sucesso!');
    loadDocuments();
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    showError(error.message || 'Erro ao excluir documento');
  }
}

/**
 * Formata data
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

/**
 * Mostra mensagem de sucesso
 */
function showSuccess(message) {
  // Implementar toast/notification
  alert(message);
}

/**
 * Mostra mensagem de erro
 */
function showError(message) {
  // Implementar toast/notification
  alert(message);
}

// Carrega dados ao iniciar
loadCustomersForSelect();
loadDocuments();

// Event listeners
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
  
  // Define data padrão como hoje
  const reportDateInput = document.getElementById('reportDate');
  if (reportDateInput) {
    reportDateInput.valueAsDate = new Date();
  }
});
