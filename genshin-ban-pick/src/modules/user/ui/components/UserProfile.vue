<!-- src/modules/user/ui/components/UserProfile.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import { History, LogOut } from '@lucide/vue';
import { useSession } from '@/app/composables/useSession';
import { useUserStore } from '../../store/userStore';
import { usePlayerProfileController } from '@/modules/shared/ui/context/playerProfileContext';

const router = useRouter();
const userStore = useUserStore();
const { user, nickname } = storeToRefs(userStore);
const session = useSession();
const playerProfile = usePlayerProfileController();

const showMenu = ref(false);

const userInitial = computed(() => {
    return nickname.value ? nickname.value.charAt(0).toUpperCase() : 'G';
});

function handleViewHistory() {
    showMenu.value = false;
    if (!user.value) return;
    playerProfile.open(user.value);
}

function handleLogout() {
    showMenu.value = false;
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('確定要登出嗎？')) return;

    session.logout();
    router.push('/login');
}
</script>

<template>
    <div class="user-profile">
        <n-popover trigger="click" placement="bottom-start" raw v-model:show="showMenu"
            class="user-profile-popover">
            <template #trigger>
                <button class="avatar-button" :class="{ 'is-active': showMenu }">
                    {{ userInitial }}
                </button>
            </template>

            <div class="dropdown scale-context">
                <div class="header">
                    <div class="large-avatar">{{ userInitial }}</div>
                    <div class="info">
                        <span class="name">{{ nickname }}</span>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="actions">
                    <button class="item" @click="handleViewHistory">
                        <History class="icon" />
                        <span>我的紀錄</span>
                    </button>
                    <button class="item item--danger" @click="handleLogout">
                        <LogOut class="icon" />
                        <span>登出</span>
                    </button>
                </div>
            </div>
        </n-popover>
    </div>
</template>

<style scoped>
.user-profile {
    height: 100%;
    display: flex;
    align-items: center;
}

.avatar-button {
    height: 80%;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 2px solid transparent;
    background:
        linear-gradient(var(--md-sys-color-surface), var(--md-sys-color-surface)) padding-box,
        linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary)) border-box;
    color: var(--md-sys-color-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.avatar-button:hover,
.avatar-button.is-active {
    transform: scale(1.08);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent);
}

.dropdown {
    --base-size: 1.25rem;
    --size-avatar: calc(var(--base-size) * 2.5);
    --size-icon: calc(var(--base-size) * 1);
    display: flex;
    flex-direction: column;
    min-width: 260px;
    background-color: var(--md-sys-color-surface-container-high);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: var(--radius-md);
    padding: var(--space-sm);
    overflow: hidden;
    box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.15),
        0 10px 24px -4px rgb(0 0 0 / 0.2);
    backdrop-filter: blur(12px);
    gap: var(--space-md);
}

.header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.large-avatar {
    width: var(--size-avatar);
    height: var(--size-avatar);
    flex-shrink: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary));
    color: var(--md-sys-color-on-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
}

.info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
}

.name {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.divider {
    height: 1px;
    background-color: var(--md-sys-color-outline-variant);
}

.actions {
    display: flex;
    flex-direction: column;
}

.item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm) var(--space-sm);
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    text-align: left;
    font-size: var(--font-size-sm);
    transition:
        background-color 0.15s ease,
        color 0.15s ease;
}

.item:hover {
    background-color: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
}

.item--danger:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-error) 12%, transparent);
    color: var(--md-sys-color-error);
}

.icon {
    width: var(--size-icon);
    height: var(--size-icon);
    flex-shrink: 0;
}
</style>
