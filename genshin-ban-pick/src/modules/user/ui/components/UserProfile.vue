<!-- src/modules/user/ui/components/UserProfile.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { History, LogOut } from '@lucide/vue';
import { useSocketStore } from '@/app/stores/socketStore';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useAuthUseCase } from '@/modules/auth/ui/composables/useAuthUseCase';
import { useUserStore } from '../../store/userStore';
import { useUserUseCase } from '../composables/useUserUseCase';
import { usePlayerHistory } from '@/modules/analysis/ui/composables/usePlayerHistory';

const router = useRouter();
const authStore = useAuthStore();
const { identity } = storeToRefs(authStore);
const userStore = useUserStore();
const { nickname } = storeToRefs(userStore);
const authUseCase = useAuthUseCase();
const userUseCase = useUserUseCase();
const socketStore = useSocketStore();
const playerHistory = usePlayerHistory();

function handleViewHistory() {
    closeMenu();
    if (!identity.value) return;
    playerHistory.open(identity.value);
}

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const userInitial = computed(() => {
    return nickname.value ? nickname.value.charAt(0).toUpperCase() : 'G';
});

function toggleMenu() {
    isOpen.value = !isOpen.value;
}

function closeMenu() {
    isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        closeMenu();
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

function handleLogout() {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('確定要登出嗎？')) return;

    socketStore.disconnect();
    userUseCase.clearProfile();
    authUseCase.logout();
    router.push('/login');
}
</script>

<template>
    <div class="user-profile" ref="containerRef">
        <button class="avatar-button" @click="toggleMenu" :class="{ 'is-active': isOpen }">
            {{ userInitial }}
        </button>

        <transition name="user-profile-fade">
            <div v-if="isOpen" class="dropdown scale-context">
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
        </transition>
    </div>
</template>

<style scoped>
.user-profile {
    position: relative;
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
    --base-size: 1.2vw;
    --size-avatar: calc(var(--base-size) * 3);
    position: absolute;
    top: calc(100% + var(--space-sm));
    left: 0;
    min-width: 260px;
    background-color: var(--md-sys-color-surface-container-high);
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: var(--radius-lg);
    padding: var(--space-sm);
    z-index: 100;
    overflow: hidden;
    box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.15),
        0 10px 24px -4px rgb(0 0 0 / 0.2);
    backdrop-filter: blur(12px);
}

.header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-sm) var(--space-md);
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
    font-size: var(--font-size-xl);
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
    margin-inline: var(--space-sm);
}

.actions {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: var(--space-sm);
}

.item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
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
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

.user-profile-fade-enter-active,
.user-profile-fade-leave-active {
    transition:
        opacity 0.18s ease,
        transform 0.18s ease;
}

.user-profile-fade-enter-from,
.user-profile-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
}
</style>
