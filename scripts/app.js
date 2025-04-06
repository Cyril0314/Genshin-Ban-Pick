import { initializeCharacterMap } from './data/characters.js';
import { fetchRoomSetting } from './data/roomSetting.js';
import { setupAllDropZones } from './ui/dropZones.js';
import { setupAllButtons } from './ui/setupButtons.js';
import { setupTeamMemberInput } from './ui/setupTeamMemberInput.js';
import { setupChatRoom } from './ui/setupChatRoom.js';
import { setupTacticalBoard } from './ui/setupTacticalBoard.js';
import { setupGlobalEvents } from './features/dragAndDrop.js';
import { setupLayoutRules } from './ui/layout.js';
import { setupSocketListeners } from './network/socketListeners.js';

const socket = io();

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded');
    const characterMap = await initializeCharacterMap();
    const roomSetting = await fetchRoomSetting();
    setupAllButtons(characterMap, roomSetting, socket);
    setupAllDropZones(roomSetting);
    setupGlobalEvents(characterMap, socket);
    setupLayoutRules();
    setupSocketListeners(characterMap, socket);
    setupTeamMemberInput(socket);
    setupChatRoom(socket);
    setupTacticalBoard(roomSetting);
});

