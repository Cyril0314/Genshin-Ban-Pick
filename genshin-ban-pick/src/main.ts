// src/main.ts

import './assets/main.css';
import '@/assets/styles/semantic-colors.css';
import '@/assets/styles/alpha.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import naive from 'naive-ui';

import App from './App.vue';
import router from './router';
import { createLogger } from './app/utils/logger';
import { registerHttpClient } from './app/bootstrap/registerHttpClient';
import api from './app/infrastructure/http/httpClient';
import { registerAuthDependencies, useAuthStore } from './modules/auth';
import { useSocketStore } from './app/stores/socketStore';
import { registerGenshinVersionDependencies } from './modules/genshinVersion';
import { registerCharacterDependencies, useCharacterStore } from './modules/character';
import { registerBoardDependencies, useBoardStore } from './modules/board';
import { registerChatDependencies, useChatStore} from './modules/chat';
import { registerRoomDependencies, useRoomUserStore } from './modules/room';
import { registerMatchDependencies } from './modules/match';
import { registerTeamDependencies, useTeamInfoStore } from './modules/team';
import { registerTacticalDependencies, useTacticalBoardStore } from './modules/tactical';
import { registerAnalysisDependencies } from './modules/analysis';

const logger = createLogger('app.main');

const app = createApp(App);
const pinia = createPinia();
const httpClient = api;
logger.info('create app');

app.use(pinia);
app.use(naive);

const authStore = useAuthStore(pinia);
const characterStore = useCharacterStore(pinia);
const roomUserStore = useRoomUserStore(pinia);
const boardStore = useBoardStore(pinia);
const teamInfoStore = useTeamInfoStore(pinia);
const tacticalBoardStore = useTacticalBoardStore(pinia);
const chatStore = useChatStore(pinia);

registerHttpClient(authStore);

const { authUseCase } = registerAuthDependencies(app, httpClient, authStore);
registerGenshinVersionDependencies(app, httpClient)
registerCharacterDependencies(app, httpClient, characterStore);
registerMatchDependencies(app, httpClient)
registerAnalysisDependencies(app, httpClient)
registerRoomDependencies(app, httpClient, roomUserStore);
registerBoardDependencies(app, boardStore);
registerTeamDependencies(app, teamInfoStore);
registerTacticalDependencies(app, tacticalBoardStore)
registerChatDependencies(app, chatStore);

await authUseCase.autoLogin();
const token = authStore.getToken();
if (token) useSocketStore(pinia).connect(token);

// router must install after autoLogin — beforeEach guard evaluates immediately on install
app.use(router);

app.mount('#app');
