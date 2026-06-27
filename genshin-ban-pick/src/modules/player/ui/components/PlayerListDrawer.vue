<!-- src/modules/player/ui/components/PlayerListDrawer.vue -->

<script setup lang="ts">
import PlayerList from './PlayerList.vue';

const props = defineProps<{
    open: boolean;
    teamMemberToTeamSlotMap?: Record<string, number>;
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
        content-style="background-color: var(--md-sys-color-surface-container);"
    >
        <PlayerList :team-member-to-team-slot-map="props.teamMemberToTeamSlotMap" />
    </n-drawer>
</template>

<style scoped></style>
