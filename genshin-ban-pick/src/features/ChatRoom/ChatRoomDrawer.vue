<!-- ChatRoomDrawer.vue -->
<script setup lang="ts">
import ChatRoom from './ChatRoom.vue';

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();
</script>

<template>
    <n-drawer
        class="drawer"
        :show="props.open"
        @update:show="emit('update:open', $event)"
        placement="right"
        width="undefined"
        content-class="scale-context"
        content-style="background-color: var(--md-sys-color-surface-container-low); --base-size: 1.5vw;"
    >
        <div class="layout__room">
            <ChatRoom />
        </div>
    </n-drawer>
</template>

<style scoped>
.layout__room {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}
</style>
