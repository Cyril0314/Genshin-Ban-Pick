// socketListener.js

import { getWishImagePath, getProfileImagePath, originalImageSrc, resetImages } from '../utils/imageUtils.js';
import { showCurrentStepText, highlightZones } from '../ui/banPickFlowUI.js';
import { stepController } from '../logic/stepController.js';

export function setupSocketListeners(characterMap, socket) {
    socket.on('connect', () => {
        console.log('[Client] Connected to server with ID:', socket.id);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || 'default-room';
    socket.emit('room.join.request', roomId);

    socket.on('image.state.sync', (state) => {
        console.log('[Client] Recovering image state from server:', state);
        for (const [imgId, zoneSelector] of Object.entries(state)) {
            originalImageSrc[imgId] = getProfileImagePath(imgId)
            const img = document.getElementById(imgId);
            const zone = document.querySelector(zoneSelector);

            if (img && zone && !zone.querySelector('img')) {
                img.src = getWishImagePath(imgId);
                zone.appendChild(img);

                const event = new CustomEvent('imageMoved', {
                    detail: { imgId, zoneSelector }
                });
                document.dispatchEvent(event);
            }
        }
    });

    socket.on('image.move.broadcast', ({ imgId, zoneSelector, senderId }) => {
        console.log('[Client] Drag updated received from other user');
        if (socket.id === senderId) return;

        const draggedImg = document.getElementById(imgId);
        const dropZone = document.querySelector(zoneSelector);

        if (
            draggedImg &&
            dropZone &&
            (zoneSelector === '#image-options' || !dropZone.querySelector('img'))
        ) {
            if (zoneSelector === '#image-options') {
                draggedImg.src = getProfileImagePath(imgId);
            } else if (characterMap[imgId]) {
                originalImageSrc[imgId] = draggedImg.src;
                draggedImg.src = getWishImagePath(imgId);
            }

            dropZone.appendChild(draggedImg);

            const event = new CustomEvent('imageMoved', {
                detail: { imgId, zoneSelector }
            });
            document.dispatchEvent(event);
        }
    });

    socket.on('images.reset.broadcast', ({ senderId }) => {
        console.log("[Client] Reset received from other user");
        if (socket.id === senderId) return;

        resetImages();

        const event = new CustomEvent('imageReset');
        document.dispatchEvent(event);
    });

    socket.on('step.state.sync', (step) => {
        console.log('[Client] Recovering step state from server:', step);
        stepController.set(step)
        showCurrentStepText(step);
        highlightZones(step);
    });

    socket.on('step.state.broadcast', (step) => {
        console.log('[Client] step state updated from server', step);
        stepController.set(step)
        showCurrentStepText(step);
        highlightZones(step);
    });

    socket.on('team.members.state.sync', (state) => {
        console.log('[Client] Recovering team members state from server:', state);
        for (const [team, content] of Object.entries(state)) {
            const input = document.querySelector(`.team__member-input[data-team="${team}"]`);
            if (input) input.value = content;

            const teamMembers = content.split("\n");
            const event = new CustomEvent('teamMembersUpdated', {
                detail: { team, teamMembers }
            });
            document.dispatchEvent(event);
        }
    });

    socket.on('team.members.update.broadcast', ({ team, content, senderId }) => {
        if (socket.id === senderId) return;
        console.log('[Client] Team members updated from other user');

        const target = document.querySelector(`.team__member-input[data-team="${team}"]`);
        if (target) target.value = content;

        const teamMembers = content.split("\n");
        const event = new CustomEvent('teamMembersUpdated', {
            detail: { team, teamMembers }
        });
        document.dispatchEvent(event);
    });

    socket.on('chat.history.sync', (history) => {
        console.log('[Client] Recovering chat history from server:', history);

        const chatBox = document.querySelector('.chat__messages');
        history.forEach(({ senderName, message }) => {
            const msg = document.createElement('div');
            msg.className = 'chat__message';
            msg.innerHTML = `<strong>${senderName}:</strong> ${message}`;
            chatBox.appendChild(msg);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    socket.on('chat.message.send.broadcast', ({ senderName, message, timestamp, senderId }) => {
        if (socket.id === senderId) return;
        console.log('[Client] Chat message sent from other user');

        const chatBox = document.querySelector('.chat__messages');
        const msg = document.createElement('div');
        msg.className = 'chat__message';
        msg.innerHTML = `<strong>${senderName}:</strong> ${message}`;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}