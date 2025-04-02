import { resetImages } from '../utils/imageUtils.js';
import { randomizeImages, handleUtilityRandom } from '../features/randomizer.js';
import { handleSelection } from '../features/filter.js';

export function setupAllButtons(characterMap, socket) {
    // Randomize Button
    document.getElementById('toolbar__random').addEventListener('click', () => {
        console.log('[UI] Randomize button clicked');
        randomizeImages(characterMap, socket);
    });

    // Reset Button
    document.getElementById('toolbar__reset').addEventListener('click', () => {
        console.log('[UI] Reset button clicked');
        resetImages();

        socket.emit('image.reset.request', {
            senderId: socket.id
        });
        console.log("socket.emit image.reset.request")
        
        socket.emit('step.reset.request', { 
            senderId: socket.id
        });
        console.log("socket.emit step.reset.request")
    });

    // Utility Button
    document.getElementById('toolbar__utility').addEventListener('click', () => {
        console.log('[UI] Utility button clicked');
        handleUtilityRandom(characterMap, socket);
    });

    // Selector Confirm Button
    document.getElementById('selector-confirm-button').addEventListener('click', () => {
        console.log('[UI] selector confirm clicked');
        handleSelection(characterMap, socket);
    });
}