// src/main.ts

import './assets/main.css';
import '@/assets/styles/semantic-colors.css';
import '@/assets/styles/alpha.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import naive from 'naive-ui';

import App from './App.vue';
import router from './router';
import { registerHttpClient } from './app/bootstrap/registerHttpClient';

const app = createApp(App);
console.info('[MAIN] Create App');

app.use(createPinia());
app.use(router);
app.use(naive);
registerHttpClient();

app.mount('#app');