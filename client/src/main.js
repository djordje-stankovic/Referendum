import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // Dodaj plugin
app.use(pinia);
app.use(vuetify);
app.use(router);
app.mount('#app');