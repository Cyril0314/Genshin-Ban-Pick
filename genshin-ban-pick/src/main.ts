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
import { useSession } from './app/composables/useSession';
import api from './app/infrastructure/http/httpClient';
import { registerAuthDependencies, useAuthStore } from './modules/auth';
import { registerUserDependencies, useUserStore } from './modules/user';
import { registerGenshinVersionDependencies } from './modules/genshinVersion';
import { registerCharacterDependencies, useCharacterStore } from './modules/character';
import { registerBoardDependencies, useBoardStore } from './modules/board';
import { registerChatDependencies, useChatStore} from './modules/chat';
import { registerRoomDependencies, useRoomUserStore } from './modules/room';
import { registerMatchDependencies } from './modules/match';
import { registerTeamDependencies, useTeamInfoStore } from './modules/team';
import { registerLineupDependencies, useLineupStore } from './modules/lineup';
import { registerAnalysisDependencies, useAnalysisMetaStore } from './modules/analysis';

const logger = createLogger('app.main');

const app = createApp(App);
const pinia = createPinia();
const httpClient = api;
logger.info('create app');

app.use(pinia);
app.use(naive);

const authStore = useAuthStore(pinia);
const userStore = useUserStore(pinia);
const characterStore = useCharacterStore(pinia);
const roomUserStore = useRoomUserStore(pinia);
const boardStore = useBoardStore(pinia);
const teamInfoStore = useTeamInfoStore(pinia);
const lineupStore = useLineupStore(pinia);
const chatStore = useChatStore(pinia);
const analysisMetaStore = useAnalysisMetaStore(pinia);

registerHttpClient(authStore);

registerAuthDependencies(app, httpClient, authStore);
registerUserDependencies(app, httpClient, userStore);
registerGenshinVersionDependencies(app, httpClient)
registerCharacterDependencies(app, httpClient, characterStore);
registerMatchDependencies(app, httpClient)
registerAnalysisDependencies(app, httpClient, analysisMetaStore)
registerRoomDependencies(app, httpClient, roomUserStore);
registerBoardDependencies(app, boardStore);
registerTeamDependencies(app, teamInfoStore);
registerLineupDependencies(app, lineupStore)
registerChatDependencies(app, chatStore);

// runWithContext lets us call the useSession composable outside of a setup() — providers registered above are now in scope, so inject() resolves.
await app.runWithContext(() => useSession().autoLogin());

// router must install after autoLogin — beforeEach guard evaluates immediately on install
app.use(router);

app.mount('#app');
