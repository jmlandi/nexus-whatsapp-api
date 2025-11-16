// Componentes Vue.js reutilizáveis
// Este arquivo contém todos os componentes compartilhados do sistema Nexus

// ==================== COMPONENTE: SIDEBAR ====================
const AppSidebar = {
  name: 'AppSidebar',
  props: {
    currentPage: {
      type: String,
      required: true
    }
  },
  template: `
    <aside class="page-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">Nexus</div>
      </div>
      <nav class="sidebar-nav">
        <a href="/dashboard.html" :class="['nav-link', { active: currentPage === 'dashboard' }]">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Dashboard</span>
        </a>
        <a href="/customers.html" :class="['nav-link', { active: currentPage === 'customers' }]">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span>Clientes</span>
        </a>
        <a href="/documents.html" :class="['nav-link', { active: currentPage === 'documents' }]">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span>Documentos</span>
        </a>
        <a href="/simulator.html" :class="['nav-link', { active: currentPage === 'simulator' }]">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span>Simulador</span>
        </a>
      </nav>
      <div style="margin-top: auto; padding: var(--spacing-lg); border-top: 1px solid var(--color-border-light);">
        <button @click="$emit('logout')" class="btn btn-secondary w-full">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    actionIcon: {
      type: String,
      default: 'plus'
    }
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
    <div class="page-header">
      <div class="page-header-content">
        <div>
          <h1 class="page-title">{{ title }}</h1>
          <p class="page-subtitle">{{ subtitle }}</p>
        </div>
        <button v-if="actionLabel" @click="$emit('action')" class="btn btn-primary">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    confirmLabel: {
      type: String,
      default: 'Confirmar'
    },
    cancelLabel: {
      type: String,
      default: 'Cancelar'
    },
    loading: Boolean
  },
  template: `
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
          <button type="button" @click="$emit('close')" class="modal-close" aria-label="Fechar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary" :disabled="loading">
            {{ cancelLabel }}
          </button>
          <button type="button" @click="$emit('confirm')" class="btn btn-primary" :disabled="loading">
            <span v-if="!loading">{{ confirmLabel }}</span>
            <span v-else>Processando...</span>
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
    icon: {
      type: String,
      default: 'box'
    },
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
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="iconPath"/>
        </svg>
      </div>
      <div class="empty-state-title">{{ title }}</div>
      <div class="empty-state-text">{{ description }}</div>
    </div>
  `
};

// ==================== COMPONENTE: LOADING ====================
const Loading = {
  name: 'Loading',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; padding: 2rem;">
      <div class="spinner"></div>
    </div>
  `
};

// ==================== COMPONENTE: TOAST/NOTIFICATION ====================
const Toast = {
  name: 'Toast',
  props: {
    message: String,
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    show: Boolean
  },
  template: `
    <transition name="toast">
      <div v-if="show" :class="['toast', 'toast-' + type]">
        {{ message }}
      </div>
    </transition>
  `
};
