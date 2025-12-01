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
import { registerAuthDependencies, useAuthStore } from './modules/auth';
import { useCharacterStore, registerCharacterDependencies } from './modules/character';
import { useBoardImageStore, registerBoardDependencies } from './modules/board';
import { useChatStore, registerChatDependencies } from './modules/chat';

const app = createApp(App);
const pinia = createPinia();
const httpClient = api;
console.info('[MAIN] Create App');

app.use(pinia);
app.use(router);
app.use(naive);

const authStore = useAuthStore(pinia);
const characterStore = useCharacterStore(pinia);
const boardImageStore = useBoardImageStore(pinia);
const chatStore = useChatStore(pinia);

registerHttpClient(authStore);
registerAuthDependencies(app, httpClient, authStore);
registerCharacterDependencies(app, httpClient, characterStore);
registerBoardDependencies(app, boardImageStore);
registerChatDependencies(app, chatStore);

app.mount('#app');
