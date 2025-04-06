import { resetImages } from '../utils/imageUtils.js';
import { randomizeImages, handleUtilityRandom, handleBanRandom } from '../features/randomizer.js';
import { handleSelection } from '../features/filter.js';

export function setupAllButtons(characterMap, roomSetting, socket) {

    // Reset Button
    document.querySelector('.toolbar__button--reset').addEventListener('click', () => {
        console.log('[UI] Reset button clicked');
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

    // Randomize Button
    document.querySelector('.toolbar__button--random').addEventListener('click', () => {
        console.log('[UI] Randomize button clicked');
        randomizeImages(characterMap, socket);
    });


    // Utility Button
    document.querySelector('.toolbar__button--utility').addEventListener('click', () => {
        console.log('[UI] Utility button clicked');
        handleUtilityRandom(characterMap, socket);
    });

    // Ban Button
    document.querySelector('.toolbar__button--ban').addEventListener('click', () => {
        console.log('[UI] Ban button clicked');
        handleBanRandom(characterMap, roomSetting, socket);
    });

    // Selector Confirm Button
    // document.getElementById('selector-confirm-button').addEventListener('click', () => {
    //     console.log('[UI] selector confirm clicked');
    //     handleSelection(characterMap, socket);
    // });
}