// View: Documents
const Documents = {
  name: 'Documents',
  components: { AppSidebar, PageHeader, Loading, EmptyState, Modal },
  data() {
    return {
      loading: true,
      documents: [],
      showUploadModal: false,
      customers: [],
      uploadForm: {
        customerId: '',
        file: null,
        fileName: '',
        startDate: '',
        endDate: '',
        observations: ''
      },
      uploading: false
    };
  },
  template: `
    <div class="flex h-screen">
      <app-sidebar current-page="documents"></app-sidebar>
      
      <main class="flex-1 flex flex-col overflow-hidden">
        <page-header 
          title="Documentos" 
          subtitle="Gerencie documentos e relatórios"
          action-label="Enviar Documento"
          action-icon="upload"
          @action="handleUpload">
        </page-header>
        
        <div class="flex-1 overflow-y-auto p-8">
          <loading v-if="loading"></loading>
          
          <div v-else-if="documents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="doc in documents" :key="doc.id" class="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 mb-1 truncate">{{ doc.customer?.firstName }} {{ doc.customer?.lastName }}</h3>
                  <p class="text-xs text-gray-500 mb-1">{{ formatDateRange(doc.startDate, doc.endDate) }}</p>
                  <p class="text-xs text-gray-400">Criado em {{ formatDate(doc.createdAt) }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <a :href="doc.reportUrl" target="_blank" class="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium">
                  Ver PDF
                </a>
                <button @click="deleteDocument(doc.id)" class="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <empty-state 
            v-else
            icon="document"
            title="Nenhum documento enviado"
            description="Clique em 'Enviar Documento' para começar">
          </empty-state>
        </div>
        
        <Modal :show="showUploadModal" @close="showUploadModal = false" title="Enviar Documento">
          <form @submit.prevent="uploadDocument" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              <select v-model="uploadForm.customerId" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Selecione um cliente</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.firstName }} {{ customer.lastName }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Arquivo PDF *</label>
              <input type="file" @change="fileSelected" accept=".pdf" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <p v-if="uploadForm.fileName" class="text-sm text-gray-500 mt-1">Arquivo: {{ uploadForm.fileName }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data Início *</label>
                <input type="date" v-model="uploadForm.startDate" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Data Fim *</label>
                <input type="date" v-model="uploadForm.endDate" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
              <textarea v-model="uploadForm.observations" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
            </div>
            
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="showUploadModal = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                Cancelar
              </button>
              <button type="submit" :disabled="uploading" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ uploading ? 'Enviando...' : 'Enviar Documento' }}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  `,
  async mounted() {
    await this.loadDocuments();
  },
  methods: {
    async loadDocuments() {
      try {
        const response = await api.get('/api/reports');
        this.documents = response.reports || [];
      } catch (error) {
        store.showToast('Erro ao carregar documentos', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async handleUpload() {
      try {
        const response = await api.get('/api/customers');
        this.customers = response.customers || [];
        this.showUploadModal = true;
      } catch (error) {
        store.showToast('Erro ao carregar clientes', 'error');
      }
    },
    
    fileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type !== 'application/pdf') {
          store.showToast('Apenas arquivos PDF são permitidos', 'error');
          event.target.value = '';
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          store.showToast('Arquivo muito grande. Máximo 50MB', 'error');
          event.target.value = '';
          return;
        }
        this.uploadForm.file = file;
        this.uploadForm.fileName = file.name;
      }
    },
    
    async uploadDocument() {
      if (!this.uploadForm.file || !this.uploadForm.customerId || !this.uploadForm.startDate || !this.uploadForm.endDate) {
        store.showToast('Preencha todos os campos obrigatórios', 'error');
        return;
      }
      
      this.uploading = true;
      
      try {
        const formData = new FormData();
        formData.append('file', this.uploadForm.file);
        formData.append('customerId', this.uploadForm.customerId);
        formData.append('startDate', this.uploadForm.startDate);
        formData.append('endDate', this.uploadForm.endDate);
        if (this.uploadForm.observations) {
          formData.append('observations', this.uploadForm.observations);
        }
        
        await api.post('/api/documents/upload', formData);
        
        store.showToast('Documento enviado com sucesso!', 'success');
        this.showUploadModal = false;
        this.resetUploadForm();
        await this.loadDocuments();
      } catch (error) {
        console.error('Upload error:', error);
        store.showToast(error.response?.data?.message || 'Erro ao enviar documento', 'error');
      } finally {
        this.uploading = false;
      }
    },
    
    resetUploadForm() {
      this.uploadForm = {
        customerId: '',
        file: null,
        fileName: '',
        startDate: '',
        endDate: '',
        observations: ''
      };
    },
    
    async deleteDocument(id) {
      if (!confirm('Deseja realmente excluir este documento?')) {
        return;
      }
      
      try {
        await api.delete(`/api/documents/${id}`);
        store.showToast('Documento excluído com sucesso', 'success');
        await this.loadDocuments();
      } catch (error) {
        store.showToast('Erro ao excluir documento', 'error');
      }
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('pt-BR');
    },
    
    formatDateRange(startDate, endDate) {
      const start = new Date(startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      const end = new Date(endDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      return `${start} - ${end}`;
    }
  }
};
