// Main App Configuration
const { createApp } = Vue;

console.log('🚀 Iniciando Nexus SPA...');
console.log('Vue:', typeof Vue);
console.log('VueRouter:', typeof VueRouter);
console.log('Store:', store);
console.log('Router:', router);

const App = {
  name: 'App',
  components: { Toast },
  template: `
    <div>
      <router-view></router-view>
      <toast></toast>
    </div>
  `
};

// Create and mount the app
const app = createApp(App);
app.use(router);
app.mount('#app');

console.log('✅ Nexus SPA initialized!');
