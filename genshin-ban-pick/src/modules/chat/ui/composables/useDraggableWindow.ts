// src/modules/chat/ui/composables/useDraggableWindow.ts

import { ref, onUnmounted } from 'vue';

interface UseDraggableOptions {
    initialX?: number;
    initialY?: number;
}

export function useDraggableWindow(options: UseDraggableOptions = {}) {
    const position = ref({
        x: options.initialX ?? window.innerWidth * 0.85,
        y: options.initialY ?? window.innerHeight * 0.57,
    });

    const isDragging = ref(false);
    const dragOffset = ref({ x: 0, y: 0 });

    function handleMouseDown(e: MouseEvent) {
        isDragging.value = true;
        dragOffset.value = {
            x: e.clientX - position.value.x,
            y: e.clientY - position.value.y,
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e: MouseEvent) {
        if (!isDragging.value) return;
        position.value = {
            x: e.clientX - dragOffset.value.x,
            y: e.clientY - dragOffset.value.y,
        };
    }

    function handleMouseUp() {
        isDragging.value = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    onUnmounted(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    });

    return {
        position,
        isDragging,
        handleMouseDown,
    };
}
