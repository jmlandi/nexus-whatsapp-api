// Component: Modal
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
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
          <button type="button" @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="px-6 py-6 overflow-y-auto">
          <slot></slot>
        </div>
        
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
