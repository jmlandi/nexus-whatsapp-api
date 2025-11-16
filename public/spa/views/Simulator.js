// View: Simulator
const Simulator = {
  name: 'Simulator',
  components: { AppSidebar, PageHeader, Loading },
  data() {
    return {
      loading: false,
      customers: [],
      selectedCustomer: null,
      customerContext: '',
      messages: [],
      newMessage: '',
      sending: false,
      loadingContext: false,
      showContext: false
    };
  },
  template: `
    <div class="flex h-screen">
      <app-sidebar current-page="simulator"></app-sidebar>
      
      <main class="flex-1 flex flex-col overflow-hidden">
        <page-header 
          title="Simulador de Chat" 
          subtitle="Teste conversas com a IA Nexus">
        </page-header>
        
        <div class="flex-1 overflow-hidden p-8">
          <div class="h-full flex gap-6">
            <!-- Painel de Seleção de Cliente -->
            <div class="w-80 bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Selecione um Cliente</h3>
              
              <div v-if="loading" class="flex-1 flex items-center justify-center">
                <loading></loading>
              </div>
              
              <div v-else class="flex-1 overflow-y-auto space-y-2">
                <button
                  v-for="customer in customers"
                  :key="customer.id"
                  @click="selectCustomer(customer)"
                  :class="[
                    'w-full p-3 rounded-lg text-left transition-colors',
                    selectedCustomer?.id === customer.id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  ]"
                >
                  <div class="font-medium text-gray-900">
                    {{ customer.firstName }} {{ customer.lastName }}
                  </div>
                  <div v-if="customer.nickname" class="text-sm text-gray-500">
                    {{ customer.nickname }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ customer._count?.reports || 0 }} relatórios
                  </div>
                </button>
              </div>
              
              <div v-if="selectedCustomer" class="mt-4 pt-4 border-t border-gray-200">
                <button
                  @click="showContext = !showContext"
                  class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  {{ showContext ? '🔼 Ocultar' : '🔽 Ver' }} Contexto da IA
                </button>
              </div>
            </div>
            
            <!-- Painel de Chat -->
            <div class="flex-1 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col">
              <div v-if="!selectedCustomer" class="flex-1 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-6xl mb-4">💬</div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Selecione um Cliente</h3>
                  <p class="text-gray-600">Escolha um cliente ao lado para iniciar uma conversa</p>
                </div>
              </div>
              
              <template v-else>
                <!-- Header do Chat -->
                <div class="p-4 border-b border-gray-200">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-semibold text-gray-900">
                        {{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}
                      </h3>
                      <p class="text-sm text-gray-500">Simulando conversa com Nexus AI</p>
                    </div>
                    <button
                      @click="clearChat"
                      class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      🗑️ Limpar Chat
                    </button>
                  </div>
                </div>
                
                <!-- Contexto da IA (expansível) -->
                <div v-if="showContext" class="p-4 bg-amber-50 border-b border-amber-200">
                  <div class="flex items-start gap-2">
                    <span class="text-amber-600">🧠</span>
                    <div class="flex-1">
                      <h4 class="font-semibold text-amber-900 mb-2">Contexto que a IA possui:</h4>
                      <div v-if="loadingContext" class="text-sm text-amber-700">
                        Carregando contexto...
                      </div>
                      <pre v-else class="text-xs text-amber-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-amber-200 max-h-64 overflow-y-auto">{{ customerContext }}</pre>
                    </div>
                  </div>
                </div>
                
                <!-- Mensagens -->
                <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4">
                  <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
                    <p class="mb-2">👋 Olá! Sou o Nexus.</p>
                    <p class="text-sm">Envie uma mensagem para começar a conversa.</p>
                  </div>
                  
                  <div
                    v-for="(msg, index) in messages"
                    :key="index"
                    :class="[
                      'flex',
                      msg.type === 'user' ? 'justify-end' : 'justify-start'
                    ]"
                  >
                    <div
                      :class="[
                        'max-w-[70%] rounded-lg px-4 py-2',
                        msg.type === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      ]"
                    >
                      <div class="whitespace-pre-wrap">{{ msg.content }}</div>
                      <div
                        :class="[
                          'text-xs mt-1',
                          msg.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
                        ]"
                      >
                        {{ formatTime(msg.timestamp) }}
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="sending" class="flex justify-start">
                    <div class="bg-gray-100 rounded-lg px-4 py-2">
                      <div class="flex items-center gap-2">
                        <div class="flex gap-1">
                          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                        </div>
                        <span class="text-sm text-gray-500">Nexus está digitando...</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Input de Mensagem -->
                <div class="p-4 border-t border-gray-200">
                  <form @submit.prevent="sendMessage" class="flex gap-2">
                    <input
                      v-model="newMessage"
                      type="text"
                      placeholder="Digite sua mensagem..."
                      :disabled="sending"
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                    <button
                      type="submit"
                      :disabled="!newMessage.trim() || sending"
                      class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ sending ? '⏳' : '📤' }} Enviar
                    </button>
                  </form>
                </div>
              </template>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  async mounted() {
    await this.loadCustomers();
  },
  methods: {
    async loadCustomers() {
      this.loading = true;
      try {
        const response = await api.get('/api/customers');
        this.customers = response.customers || [];
      } catch (error) {
        store.showToast('Erro ao carregar clientes', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async selectCustomer(customer) {
      this.selectedCustomer = customer;
      this.messages = [];
      this.customerContext = '';
      this.showContext = false;
      
      // Carrega contexto em background
      this.loadCustomerContext();
    },
    
    async loadCustomerContext() {
      if (!this.selectedCustomer) return;
      
      this.loadingContext = true;
      try {
        const response = await api.get(`/api/simulator/context/${this.selectedCustomer.id}`);
        this.customerContext = response.context || 'Contexto não disponível';
      } catch (error) {
        console.error('Erro ao carregar contexto:', error);
        this.customerContext = 'Erro ao carregar contexto';
      } finally {
        this.loadingContext = false;
      }
    },
    
    async sendMessage() {
      if (!this.newMessage.trim() || this.sending) return;
      
      const userMessage = this.newMessage.trim();
      this.newMessage = '';
      
      // Adiciona mensagem do usuário
      this.messages.push({
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      });
      
      this.scrollToBottom();
      this.sending = true;
      
      try {
        const response = await api.post('/api/simulator/chat', {
          customerId: this.selectedCustomer.id,
          message: userMessage,
          history: this.messages.slice(0, -1).map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        });
        
        // Adiciona resposta da IA
        this.messages.push({
          type: 'assistant',
          content: response.response,
          timestamp: new Date()
        });
        
        this.scrollToBottom();
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        store.showToast('Erro ao obter resposta da IA', 'error');
        
        // Adiciona mensagem de erro
        this.messages.push({
          type: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem. 😔',
          timestamp: new Date()
        });
      } finally {
        this.sending = false;
      }
    },
    
    clearChat() {
      if (confirm('Deseja limpar todo o histórico desta conversa?')) {
        this.messages = [];
      }
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    
    formatTime(date) {
      return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
