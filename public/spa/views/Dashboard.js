// View: Dashboard
const Dashboard = {
  name: 'Dashboard',
  components: { AppSidebar, PageHeader, Loading },
  data() {
    return {
      loading: true,
      stats: {
        totalCustomers: 0,
        totalDocuments: 0,
        totalChats: 0
      }
    };
  },
  template: `
    <div class="flex h-screen">
      <app-sidebar current-page="dashboard"></app-sidebar>
      
      <main class="flex-1 flex flex-col overflow-hidden">
        <page-header title="Dashboard" subtitle="Visão geral do sistema"></page-header>
        
        <div class="flex-1 overflow-y-auto p-8">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
            <h2 class="text-2xl font-bold mb-2">Bem-vindo ao Nexus</h2>
            <p class="text-indigo-100">Sistema de gestão de clientes e automação com IA para análise de relatórios</p>
          </div>
          
          <loading v-if="loading"></loading>
          
          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-3xl font-bold text-gray-900">{{ stats.totalCustomers }}</h3>
                    <p class="text-sm text-gray-600 font-medium">Total de Clientes</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-3xl font-bold text-gray-900">{{ stats.totalDocuments }}</h3>
                    <p class="text-sm text-gray-600 font-medium">Documentos</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-3xl font-bold text-gray-900">{{ stats.totalChats }}</h3>
                    <p class="text-sm text-gray-600 font-medium">Conversas Ativas</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <router-link to="/customers" class="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg transition-all group">
                  <svg class="w-6 h-6 text-gray-600 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                  <span class="font-semibold text-gray-700 group-hover:text-indigo-700">Novo Cliente</span>
                </router-link>
                
                <router-link to="/documents" class="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg transition-all group">
                  <svg class="w-6 h-6 text-gray-600 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <span class="font-semibold text-gray-700 group-hover:text-indigo-700">Enviar Documento</span>
                </router-link>
                
                <router-link to="/simulator" class="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg transition-all group">
                  <svg class="w-6 h-6 text-gray-600 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <span class="font-semibold text-gray-700 group-hover:text-indigo-700">Simular Chat</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  async mounted() {
    await this.loadStats();
  },
  methods: {
    async loadStats() {
      try {
        const [customersRes, documentsRes, chatsRes] = await Promise.all([
          api.get('/api/customers'),
          api.get('/api/reports'),
          api.get('/api/chats')
        ]);
        
        this.stats = {
          totalCustomers: customersRes.pagination?.total || customersRes.customers?.length || 0,
          totalDocuments: documentsRes.pagination?.total || documentsRes.reports?.length || 0,
          totalChats: chatsRes.pagination?.total || chatsRes.chats?.length || 0
        };
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        store.showToast('Erro ao carregar estatísticas', 'error');
      } finally {
        this.loading = false;
      }
    }
  }
};
