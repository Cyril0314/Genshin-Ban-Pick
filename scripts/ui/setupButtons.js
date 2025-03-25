import { resetImages } from '../utils/imageUtils.js';
import { randomizeImages, handleUtilityRandom } from '../features/randomizer.js';
import { handleSelection } from '../features/filter.js';

export function setupAllButtons(characterMap) {
    // Reset Button
    document.getElementById('reset-button').addEventListener('click', () => {
        console.log('[UI] Reset button clicked');
        resetImages();
    });

    // Randomize Button
    document.getElementById('randomize-button').addEventListener('click', () => {
        console.log('[UI] Randomize button clicked');
        randomizeImages(characterMap);
    });

    // Utility Button
    document.getElementById('utility-button').addEventListener('click', () => {
        console.log('[UI] Utility button clicked');
        handleUtilityRandom(characterMap);
    });

    // Left Side Confirm Button
    document.getElementById('left-confirm-button').addEventListener('click', () => {
        console.log('[UI] Left confirm clicked');
        handleSelection('left', characterMap);
    });

    // Right Side Confirm Button
    document.getElementById('right-confirm-button').addEventListener('click', () => {
        console.log('[UI] Right confirm clicked');
        handleSelection('right', characterMap);
    });

    // Filter Button (可留空或未來擴充)
    document.getElementById('filter-button').addEventListener('click', () => {
        console.log('[UI] Filter button clicked');
        // TODO: add filtering logic here if needed
    });
}