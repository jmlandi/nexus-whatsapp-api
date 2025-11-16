// View: Customers
const Customers = {
  name: 'Customers',
  components: { AppSidebar, PageHeader, Loading, EmptyState, Modal },
  data() {
    return {
      loading: true,
      customers: [],
      showModal: false,
      form: {
        firstName: '',
        lastName: '',
        nickname: '',
        phoneNumbers: ['']
      },
      editingId: null,
      saving: false
    };
  },
  template: `
    <div class="flex h-screen">
      <app-sidebar current-page="customers"></app-sidebar>
      
      <main class="flex-1 flex flex-col overflow-hidden">
        <page-header 
          title="Clientes" 
          subtitle="Gerencie seus clientes e telefones de contato"
          action-label="Novo Cliente"
          @action="openModal">
        </page-header>
        
        <div class="flex-1 overflow-y-auto p-8">
          <loading v-if="loading"></loading>
          
          <div v-else-if="customers.length > 0" class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nome</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Apelido</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Telefones</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <span class="font-semibold text-gray-900">{{ customer.firstName }} {{ customer.lastName }}</span>
                  </td>
                  <td class="px-6 py-4 text-gray-600">{{ customer.nickname || '-' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-2">
                      <div v-for="phone in customer.phoneNumbers" :key="phone.id" class="flex items-center gap-2">
                        <span :class="['phone-badge', !phone.isActive && 'opacity-50 line-through']">
                          {{ phone.phoneNumber }}
                        </span>
                        <button 
                          @click="togglePhoneStatus(phone)"
                          :title="phone.isActive ? 'Desativar' : 'Ativar'"
                          class="p-1 rounded transition-colors"
                          :class="phone.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="phone.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                      <button @click="editCustomer(customer)" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button @click="deleteCustomer(customer.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <empty-state 
            v-else
            icon="users"
            title="Nenhum cliente cadastrado"
            description="Clique em 'Novo Cliente' para começar">
          </empty-state>
        </div>
      </main>
      
      <modal 
        :show="showModal" 
        :title="editingId ? 'Editar Cliente' : 'Novo Cliente'"
        :loading="saving"
        @close="closeModal"
        @confirm="saveCustomer">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
            <input 
              type="text" 
              v-model="form.firstName" 
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" 
              placeholder="Digite o nome"
              required>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Sobrenome *</label>
            <input 
              type="text" 
              v-model="form.lastName" 
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" 
              placeholder="Digite o sobrenome"
              required>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Apelido</label>
            <input 
              type="text" 
              v-model="form.nickname" 
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Digite o apelido (opcional)">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Telefones *</label>
            <div class="space-y-2">
              <div v-for="(phone, index) in form.phoneNumbers" :key="index" class="flex gap-2">
                <input 
                  type="tel" 
                  v-model="form.phoneNumbers[index]" 
                  @input="updatePhone(index, $event.target.value)"
                  class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" 
                  placeholder="+5511999999999"
                  required>
                <button 
                  v-if="form.phoneNumbers.length > 1"
                  @click="removePhone(index)"
                  type="button"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
              <button 
                @click="addPhone"
                type="button"
                class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors font-medium">
                + Adicionar Telefone
              </button>
            </div>
          </div>
        </div>
      </modal>
    </div>
  `,
  async mounted() {
    await this.loadCustomers();
  },
  methods: {
    async loadCustomers() {
      try {
        const response = await api.get('/api/customers');
        this.customers = response.customers || [];
      } catch (error) {
        store.showToast('Erro ao carregar clientes', 'error');
      } finally {
        this.loading = false;
      }
    },
    openModal() {
      this.showModal = true;
      this.editingId = null;
      this.form = { firstName: '', lastName: '', nickname: '', phoneNumbers: [''] };
    },
    closeModal() {
      this.showModal = false;
    },
    editCustomer(customer) {
      this.editingId = customer.id;
      this.form = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        nickname: customer.nickname || '',
        phoneNumbers: customer.phoneNumbers?.length 
          ? customer.phoneNumbers.map(p => p.phoneNumber) 
          : ['']
      };
      this.showModal = true;
    },
    addPhone() {
      this.form.phoneNumbers.push('');
    },
    removePhone(index) {
      this.form.phoneNumbers.splice(index, 1);
    },
    updatePhone(index, value) {
      // Força a atualização reativa do array
      this.$set ? this.$set(this.form.phoneNumbers, index, value) : (this.form.phoneNumbers[index] = value);
      console.log('Phone updated:', index, value, this.form.phoneNumbers);
    },
    async togglePhoneStatus(phone) {
      try {
        const newStatus = !phone.isActive;
        const action = newStatus ? 'ativar' : 'desativar';
        
        if (!confirm(`Tem certeza que deseja ${action} este telefone?`)) {
          return;
        }
        
        await api.put(`/api/phone-numbers/${phone.id}`, {
          isActive: newStatus
        });
        
        // Atualiza localmente
        phone.isActive = newStatus;
        
        store.showToast(`Telefone ${newStatus ? 'ativado' : 'desativado'} com sucesso!`, 'success');
      } catch (error) {
        console.error('Erro ao alterar status do telefone:', error);
        store.showToast('Erro ao alterar status do telefone', 'error');
      }
    },
    async saveCustomer() {
      console.log('=== SALVANDO CLIENTE ===');
      console.log('Form completo:', JSON.parse(JSON.stringify(this.form)));
      
      this.saving = true;
      try {
        // Validações básicas
        if (!this.form.firstName || !this.form.firstName.trim()) {
          store.showToast('Nome é obrigatório', 'error');
          this.saving = false;
          return;
        }
        
        if (!this.form.lastName || !this.form.lastName.trim()) {
          store.showToast('Sobrenome é obrigatório', 'error');
          this.saving = false;
          return;
        }
        
        // Filtra telefones vazios e remove espaços
        const validPhones = this.form.phoneNumbers
          .map(p => String(p).trim())
          .filter(p => p.length > 0);
        
        console.log('Telefones válidos após filtro:', validPhones);
        
        if (validPhones.length === 0) {
          store.showToast('Adicione pelo menos um telefone', 'error');
          this.saving = false;
          return;
        }
        
        const data = {
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          nickname: this.form.nickname,
          phoneNumbers: validPhones
        };
        
        console.log('Dados a serem enviados:', JSON.stringify(data, null, 2));
        
        if (this.editingId) {
          console.log('Atualizando cliente ID:', this.editingId);
          const response = await api.put('/api/customers/' + this.editingId, data);
          console.log('Resposta do servidor (update):', response);
          store.showToast('Cliente atualizado com sucesso!', 'success');
        } else {
          console.log('Criando novo cliente');
          const response = await api.post('/api/customers', data);
          console.log('Resposta do servidor (create):', response);
          store.showToast('Cliente criado com sucesso!', 'success');
        }
        
        this.closeModal();
        await this.loadCustomers();
      } catch (error) {
        store.showToast(error.message, 'error');
      } finally {
        this.saving = false;
      }
    },
    async deleteCustomer(id) {
      if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
      
      try {
        await api.delete('/api/customers/' + id);
        store.showToast('Cliente excluído com sucesso!', 'success');
        await this.loadCustomers();
      } catch (error) {
        store.showToast(error.message, 'error');
      }
    }
  }
};
