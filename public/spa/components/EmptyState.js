// Component: EmptyState
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
