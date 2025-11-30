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
import api from './app/infrastructure/http/httpClient';
import { useCharacterStore } from './modules/character';
import { registerCharacterDependencies } from './modules/character/registerCharacterDependencies';

const app = createApp(App);
const pinia = createPinia();
const httpClient = api
console.info('[MAIN] Create App');

app.use(pinia);
app.use(router);
app.use(naive);

registerHttpClient();
const characterStore = useCharacterStore(pinia)

registerCharacterDependencies(app, httpClient, characterStore)

app.mount('#app');