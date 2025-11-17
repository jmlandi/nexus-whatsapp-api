// Componentes Vue.js reutilizáveis com Tailwind CSS
// Sistema Nexus - Gestão com IA

// ==================== COMPONENTE: SIDEBAR ====================
const AppSidebar = {
  name: 'AppSidebar',
  props: {
    currentPage: { type: String, required: true }
  },
  template: `
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
      <!-- Header -->
      <div class="p-6 border-b border-slate-700">
        <div class="text-2xl font-bold mb-1">Nexus</div>
        <div class="text-sm text-slate-400">Sistema com IA</div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <a href="/dashboard.html" :class="['flex items-center gap-3 px-4 py-3 rounded-lg transition-all', currentPage === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="font-medium">Dashboard</span>
        </a>

        <a href="/customers.html" :class="['flex items-center gap-3 px-4 py-3 rounded-lg transition-all', currentPage === 'customers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span class="font-medium">Clientes</span>
        </a>

        <a href="/documents.html" :class="['flex items-center gap-3 px-4 py-3 rounded-lg transition-all', currentPage === 'documents' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="font-medium">Documentos</span>
        </a>

        <a href="/simulator.html" :class="['flex items-center gap-3 px-4 py-3 rounded-lg transition-all', currentPage === 'simulator' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white']">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span class="font-medium">Simulador</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-slate-700">
        <button @click="$emit('logout')" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all font-medium">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  `
};

// ==================== COMPONENTE: PAGE HEADER ====================
const PageHeader = {
  name: 'PageHeader',
  props: {
    title: String,
    subtitle: String,
    actionLabel: String,
    actionIcon: { type: String, default: 'plus' }
  },
  computed: {
    iconPath() {
      const icons = {
        plus: 'M12 4v16m8-8H4',
        upload: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
      };
      return icons[this.actionIcon] || icons.plus;
    }
  },
  template: `
    <div class="bg-white border-b border-gray-200 px-8 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-1">{{ title }}</h1>
          <p class="text-gray-600">{{ subtitle }}</p>
        </div>
        <button v-if="actionLabel" @click="$emit('action')" class="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath"/>
          </svg>
          <span>{{ actionLabel }}</span>
        </button>
      </div>
    </div>
  `
};

// ==================== COMPONENTE: MODAL ====================
const Modal = {
  name: 'Modal',
  props: {
    show: Boolean,
    title: String,
    confirmLabel: { type: String, default: 'Confirmar' },
    cancelLabel: { type: String, default: 'Cancelar' },
    loading: Boolean
  },
  template: `
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col animate-slideUp">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
          <button type="button" @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Fechar">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-6 overflow-y-auto">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button type="button" @click="$emit('close')" class="px-6 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg transition-all font-medium" :disabled="loading">
            {{ cancelLabel }}
          </button>
          <button type="button" @click="$emit('confirm')" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-semibold shadow-md disabled:opacity-50" :disabled="loading">
            <span v-if="!loading">{{ confirmLabel }}</span>
            <span v-else class="flex items-center gap-2">
              <span class="spinner"></span>
              Processando...
            </span>
          </button>
        </div>
      </div>
    </div>
  `
};

// ==================== COMPONENTE: EMPTY STATE ====================
const EmptyState = {
  name: 'EmptyState',
  props: {
    icon: { type: String, default: 'box' },
    title: String,
    description: String
  },
  computed: {
    iconPath() {
      const icons = {
        box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
      };
      return icons[this.icon] || icons.box;
    }
  },
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4">
      <div class="text-gray-300 mb-6">
        <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPath"/>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ title }}</h3>
      <p class="text-gray-500 text-center max-w-md">{{ description }}</p>
    </div>
  `
};

// ==================== COMPONENTE: LOADING ====================
const Loading = {
  name: 'Loading',
  template: `
    <div class="flex justify-center items-center py-12">
      <div class="spinner"></div>
    </div>
  `
};

// ==================== COMPONENTE: TOAST/NOTIFICATION ====================
const Toast = {
  name: 'Toast',
  props: {
    message: String,
    type: { type: String, default: 'info', validator: (v) => ['success', 'error', 'warning', 'info'].includes(v) },
    show: Boolean
  },
  computed: {
    toastClasses() {
      const base = 'fixed top-4 right-4 px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md flex items-center gap-3';
      const types = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-600 text-white'
      };
      return `${base} ${types[this.type]}`;
    }
  },
  template: `
    <transition
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-x-full"
      leave-to-class="opacity-0 translate-x-full">
      <div v-if="show" :class="toastClasses">
        <span class="font-medium">{{ message }}</span>
      </div>
    </transition>
  `
};
