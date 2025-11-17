// View: Chat
const Chat = {
  name: 'Chat',
  components: { AppSidebar, PageHeader, Loading, EmptyState, Modal },
  data() {
    return {
      loading: true,
      chats: [],
      selectedChat: null,
      messages: [],
      messageText: '',
      sending: false,
      customers: [],
      templates: [],
      showStartChatModal: false,
      startChatForm: {
        customerId: '',
        phoneNumberId: '',
        templateName: '',
        phoneNumbers: []
      },
      loadingMessages: false,
      refreshInterval: null,
      showTemplateModal: false
    };
  },
  computed: {
    selectedCustomer() {
      if (!this.startChatForm.customerId) return null;
      return this.customers.find(c => c.id === this.startChatForm.customerId);
    },
    filteredPhoneNumbers() {
      if (!this.selectedCustomer) return [];
      return this.selectedCustomer.phoneNumbers || [];
    }
  },
  template: `
    <div class="flex h-screen">
      <app-sidebar current-page="chat"></app-sidebar>
      
      <main class="flex-1 flex flex-col overflow-hidden">
        <page-header 
          title="Chat WhatsApp" 
          subtitle="Converse com seus clientes e gerencie chats ativos"
          action-label="Iniciar Chat"
          @action="openStartChatModal">
        </page-header>
        
        <div class="flex-1 flex overflow-hidden">
          <!-- Lista de Chats -->
          <div class="w-96 border-r border-gray-200 bg-white flex flex-col">
            <div class="p-4 border-b border-gray-200">
              <h3 class="text-lg font-bold text-gray-900">Conversas</h3>
            </div>
            
            <loading v-if="loading"></loading>
            
            <div v-else-if="chats.length > 0" class="flex-1 overflow-y-auto">
              <div 
                v-for="chat in chats" 
                :key="chat.id"
                @click="selectChat(chat)"
                :class="[
                  'p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50',
                  selectedChat?.id === chat.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                ]">
                <div class="flex items-start justify-between mb-1">
                  <h4 class="font-semibold text-gray-900">
                    {{ chat.customer.firstName }} {{ chat.customer.lastName }}
                  </h4>
                  <span 
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      chat.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]">
                    {{ chat.isOpen ? 'Aberto' : 'Fechado' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-1">{{ chat.phoneNumber.phoneNumber }}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{{ chat._count.messages }} mensagens</span>
                  <span>{{ formatDate(chat.updatedAt) }}</span>
                </div>
              </div>
            </div>
            
            <empty-state 
              v-else
              icon="chat"
              title="Nenhum chat encontrado"
              description="Inicie um novo chat com um cliente">
            </empty-state>
          </div>
          
          <!-- Área de Mensagens -->
          <div class="flex-1 flex flex-col bg-gray-50">
            <div v-if="!selectedChat" class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p class="text-gray-500 text-lg">Selecione um chat para começar</p>
              </div>
            </div>
            
            <div v-else class="flex-1 flex flex-col">
              <!-- Cabeçalho do Chat -->
              <div class="bg-white border-b border-gray-200 p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900">
                      {{ selectedChat.customer.firstName }} {{ selectedChat.customer.lastName }}
                    </h3>
                    <p class="text-sm text-gray-600">{{ selectedChat.phoneNumber.phoneNumber }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      v-if="selectedChat.isOpen"
                      @click="closeChat"
                      class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                      Fechar Chat
                    </button>
                    <button 
                      @click="refreshMessages"
                      :disabled="loadingMessages"
                      class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <svg class="w-5 h-5" :class="{'animate-spin': loadingMessages}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Mensagens -->
              <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
                <loading v-if="loadingMessages"></loading>
                
                <div v-else-if="messages.length > 0">
                  <div 
                    v-for="message in messages" 
                    :key="message.id"
                    :class="[
                      'flex mb-4',
                      message.type === 'user' ? 'justify-start' : 'justify-end'
                    ]">
                    <div 
                      :class="[
                        'max-w-md px-4 py-3 rounded-lg shadow',
                        message.type === 'user' 
                          ? 'bg-white text-gray-900' 
                          : message.type === 'agent'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-green-600 text-white'
                      ]">
                      <p class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
                      <div class="flex items-center justify-between mt-2 text-xs opacity-75">
                        <span>{{ getMessageTypeLabel(message.type) }}</span>
                        <span>{{ formatTime(message.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <empty-state 
                  v-else
                  icon="chat"
                  title="Nenhuma mensagem"
                  description="Este chat ainda não tem mensagens">
                </empty-state>
              </div>
              
              <!-- Input de Mensagem -->
              <div v-if="selectedChat.isOpen" class="bg-white border-t border-gray-200 p-4">
                <form @submit.prevent="sendMessage" class="flex gap-2">
                  <input 
                    v-model="messageText"
                    type="text"
                    placeholder="Digite sua mensagem..."
                    class="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    :disabled="sending">
                  <button 
                    type="submit"
                    :disabled="!messageText.trim() || sending"
                    class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ sending ? 'Enviando...' : 'Enviar' }}
                  </button>
                </form>
              </div>
              
              <div v-else class="bg-yellow-50 border-t border-yellow-200 p-4 text-center">
                <p class="text-yellow-800 font-semibold">Este chat está fechado. Não é possível enviar mensagens.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <!-- Modal Iniciar Chat -->
      <modal 
        :show="showStartChatModal" 
        title="Iniciar Novo Chat"
        :loading="sending"
        @close="closeStartChatModal"
        @confirm="startChat">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
            <select 
              v-model="startChatForm.customerId" 
              @change="onCustomerChange"
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required>
              <option value="">Selecione um cliente</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.firstName }} {{ customer.lastName }}
              </option>
            </select>
          </div>
          
          <div v-if="startChatForm.customerId">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Telefone</label>
            <select 
              v-model="startChatForm.phoneNumberId" 
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required>
              <option value="">Selecione um telefone</option>
              <option v-for="phone in filteredPhoneNumbers" :key="phone.id" :value="phone.id">
                {{ phone.phoneNumber }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Template</label>
            <select 
              v-model="startChatForm.templateName" 
              class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required>
              <option value="">Selecione um template</option>
              <option v-for="template in templates" :key="template.name" :value="template.name">
                {{ template.name }}
              </option>
            </select>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-sm text-blue-800">
              <strong>Nota:</strong> O template será enviado via WhatsApp para iniciar a conversa com o cliente.
            </p>
          </div>
        </div>
      </modal>
    </div>
  `,
  async mounted() {
    await this.loadData();
    // Auto-refresh a cada 10 segundos se houver chat selecionado
    this.refreshInterval = setInterval(() => {
      if (this.selectedChat && this.selectedChat.isOpen) {
        this.refreshMessages(true); // silent refresh
      }
    }, 10000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        // Carrega chats e clientes em paralelo
        const [chatsResponse, customersResponse] = await Promise.all([
          api.get('/api/chats?limit=100'),
          api.get('/api/customers?limit=100')
        ]);
        
        this.chats = chatsResponse.chats || [];
        this.customers = customersResponse.customers || [];
        
        // Tenta carregar templates, mas não falha se der erro
        try {
          const templatesResponse = await api.get('/api/templates');
          this.templates = templatesResponse.templates || [];
        } catch (templateError) {
          console.warn('Não foi possível carregar templates (WhatsApp não configurado):', templateError.message);
          this.templates = [];
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        store.showToast('Erro ao carregar dados do chat', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async selectChat(chat) {
      this.selectedChat = chat;
      await this.loadMessages();
    },
    
    async loadMessages() {
      if (!this.selectedChat) return;
      
      this.loadingMessages = true;
      try {
        const response = await api.get(`/api/messages?chat_id=${this.selectedChat.id}&limit=100`);
        this.messages = response.messages || [];
        
        // Scroll para o final após carregar mensagens
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        store.showToast('Erro ao carregar mensagens', 'error');
      } finally {
        this.loadingMessages = false;
      }
    },
    
    async refreshMessages(silent = false) {
      if (!this.selectedChat) return;
      
      if (!silent) {
        this.loadingMessages = true;
      }
      
      try {
        const response = await api.get(`/api/messages?chat_id=${this.selectedChat.id}&limit=100`);
        const oldLength = this.messages.length;
        this.messages = response.messages || [];
        
        // Se há novas mensagens, scroll para o final
        if (this.messages.length > oldLength) {
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar mensagens:', error);
      } finally {
        if (!silent) {
          this.loadingMessages = false;
        }
      }
    },
    
    async sendMessage() {
      if (!this.messageText.trim() || !this.selectedChat) return;
      
      this.sending = true;
      try {
        // Envia mensagem via API do chat
        await api.post('/api/chats/send-message', {
          chatId: this.selectedChat.id,
          message: this.messageText
        });
        
        // Adiciona mensagem ao chat local
        const newMessage = {
          id: Date.now().toString(),
          chatId: this.selectedChat.id,
          message: this.messageText,
          type: 'agent',
          createdAt: new Date().toISOString()
        };
        
        this.messages.push(newMessage);
        this.messageText = '';
        
        // Scroll para o final
        this.$nextTick(() => {
          this.scrollToBottom();
        });
        
        // Atualiza mensagens do servidor após 2 segundos
        setTimeout(() => {
          this.refreshMessages(true);
        }, 2000);
        
        store.showToast('Mensagem enviada com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        store.showToast('Erro ao enviar mensagem', 'error');
      } finally {
        this.sending = false;
      }
    },
    
    async closeChat() {
      if (!this.selectedChat) return;
      
      if (!confirm('Tem certeza que deseja fechar este chat?')) {
        return;
      }
      
      try {
        await api.post('/api/chats/close-chat', {
          chatId: this.selectedChat.id
        });
        
        this.selectedChat.isOpen = false;
        
        // Atualiza o chat na lista
        const chatIndex = this.chats.findIndex(c => c.id === this.selectedChat.id);
        if (chatIndex !== -1) {
          this.chats[chatIndex].isOpen = false;
        }
        
        store.showToast('Chat fechado com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao fechar chat:', error);
        store.showToast('Erro ao fechar chat', 'error');
      }
    },
    
    openStartChatModal() {
      this.showStartChatModal = true;
      this.startChatForm = {
        customerId: '',
        phoneNumberId: '',
        templateName: '',
        phoneNumbers: []
      };
    },
    
    closeStartChatModal() {
      this.showStartChatModal = false;
    },
    
    onCustomerChange() {
      this.startChatForm.phoneNumberId = '';
    },
    
    async startChat() {
      if (!this.startChatForm.customerId || !this.startChatForm.phoneNumberId || !this.startChatForm.templateName) {
        store.showToast('Preencha todos os campos', 'error');
        return;
      }
      
      this.sending = true;
      try {
        const response = await api.post('/api/chats/send-template', {
          customerId: this.startChatForm.customerId,
          phoneNumberId: this.startChatForm.phoneNumberId,
          templateName: this.startChatForm.templateName
        });
        
        store.showToast('Chat iniciado com sucesso!', 'success');
        this.closeStartChatModal();
        
        // Recarrega lista de chats
        await this.loadData();
        
        // Seleciona o novo chat
        if (response.chat) {
          const newChat = this.chats.find(c => c.id === response.chat.id);
          if (newChat) {
            await this.selectChat(newChat);
          }
        }
      } catch (error) {
        console.error('Erro ao iniciar chat:', error);
        const errorMsg = error.response?.data?.error || 'Erro ao iniciar chat';
        store.showToast(errorMsg, 'error');
      } finally {
        this.sending = false;
      }
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) {
        return 'Hoje';
      } else if (days === 1) {
        return 'Ontem';
      } else if (days < 7) {
        return `${days} dias atrás`;
      } else {
        return date.toLocaleDateString('pt-BR');
      }
    },
    
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },
    
    getMessageTypeLabel(type) {
      const labels = {
        user: 'Cliente',
        agent: 'Agente',
        wa_template: 'Template'
      };
      return labels[type] || type;
    }
  }
};
