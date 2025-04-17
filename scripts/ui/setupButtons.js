// scripts/ui/setupButtons.js

import { resetImages } from '../utils/imageUtils.js';
import { handlePickRandom, handleUtilityRandom, handleBanRandom } from '../features/randomizer.js';
import { handleRecord } from '../features/record.js';

export function setupAllButtons(characterMap, roomSetting, socket) {

    // Reset Button
    document.querySelector('.toolbar__button--reset').addEventListener('click', () => {
        resetImages();

        const event = new CustomEvent('imageReset');
        document.dispatchEvent(event);

        socket.emit('image.reset.request', {
            senderId: socket.id
        });
        console.log("[Client] Sent image.reset.request")

        socket.emit('step.reset.request', {
            senderId: socket.id
        });


        console.log("[Client] Sent step.reset.request")
    });

    // Record Button
    document.querySelector('.toolbar__button--record').addEventListener('click', () => {
        handleRecord(characterMap);
    });

    // Utility Button
    document.querySelector('.selector__button--utility').addEventListener('click', () => {
        handleUtilityRandom(characterMap, socket);
    });

    // Pick Button
    document.querySelector('.selector__button--pick').addEventListener('click', () => {
        handlePickRandom(characterMap, roomSetting, socket);
    });

    // Ban Button
    document.querySelector('.selector__button--ban').addEventListener('click', () => {
        handleBanRandom(characterMap, roomSetting, socket);
    });
}