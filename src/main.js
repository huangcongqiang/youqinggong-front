import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import { installUiLocale } from './utils/uiLocale.js';

const app = createApp(App);
app.use(router);
app.mount('#app');
installUiLocale(router);
