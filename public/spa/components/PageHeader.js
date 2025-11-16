// Component: PageHeader
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
