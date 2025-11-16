// View: Login
const Login = {
  name: 'Login',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      errorMessage: ''
    };
  },
  template: `
    <div class="min-h-screen flex">
      <!-- Left Side - Login Form -->
      <div class="flex-1 flex items-center justify-center p-8 bg-white">
        <div class="w-full max-w-md">
          <div class="mb-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-900">Nexus</h1>
            </div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">Bem-vindo de volta</h2>
            <p class="text-gray-600">Entre com suas credenciais para continuar</p>
          </div>
          
          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input 
                type="email" 
                id="email" 
                v-model="form.email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="seu@email.com"
                required
                :disabled="loading"
              >
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input 
                type="password" 
                id="password" 
                v-model="form.password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
                required
                :disabled="loading"
              >
            </div>
            
            <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
              {{ errorMessage }}
            </div>
            
            <button 
              type="submit" 
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner"></span>
              <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
            </button>
          </form>
        </div>
      </div>
      
      <!-- Right Side - Branding -->
      <div class="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 items-center justify-center p-12">
        <div class="max-w-lg text-white">
          <div class="mb-8">
            <div class="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h2 class="text-4xl font-bold mb-4">Sistema de Gestão Inteligente</h2>
            <p class="text-lg text-indigo-100 mb-8">Gerencie clientes, documentos e conversas com o poder da Inteligência Artificial</p>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="text-indigo-100">Análise automática de documentos com IA</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="text-indigo-100">Gestão completa de clientes e contatos</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <span class="text-indigo-100">Automação de conversas via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    async handleLogin() {
      this.errorMessage = '';
      this.loading = true;
      
      try {
        await authUtils.login(this.form.email, this.form.password);
        store.showToast('Login realizado com sucesso!', 'success');
        this.$router.push('/dashboard');
      } catch (error) {
        this.errorMessage = error.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
