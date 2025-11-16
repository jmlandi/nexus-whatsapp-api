// Component: Toast
const Toast = {
  name: 'Toast',
  data() {
    return {
      toastState: store.state.toast
    };
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
      return `${base} ${types[this.toastState.type]}`;
    }
  },
  template: `
    <transition
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-x-full"
      leave-to-class="opacity-0 translate-x-full">
      <div v-if="toastState.show" :class="toastClasses">
        <span class="font-medium">{{ toastState.message }}</span>
      </div>
    </transition>
  `
};
