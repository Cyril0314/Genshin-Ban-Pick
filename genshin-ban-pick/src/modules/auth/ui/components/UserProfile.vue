<!-- src/modules/auth/ui/components/UserProfile.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../store/authStore';
import { useAuthUseCase } from '../composables/useAuthUseCase';

const router = useRouter();
const authStore = useAuthStore();
const { nickname } = storeToRefs(authStore);
const authUseCase = useAuthUseCase();

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

    authUseCase.logout();
    router.push('/login');
}
</script>

<template>
    <div class="user-profile" ref="containerRef">
        <button class="user-profile__avatar-btn" @click="toggleMenu" :class="{ 'user-profile__avatar-btn--active': isOpen }">
            {{ userInitial }}
        </button>

        <transition name="user-profile-fade">
            <div v-if="isOpen" class="user-profile__dropdown">
                <div class="user-profile__header">
                    <div class="user-profile__large-avatar">{{ userInitial }}</div>
                    <div class="user-profile__info">
                        <span class="user-profile__name">{{ nickname || '訪客' }}</span>
                    </div>
                </div>

                <div class="user-profile__divider"></div>

                <div class="user-profile__actions">
                    <button class="user-profile__item" @click="handleLogout">
                        <span class="user-profile__icon">logout</span>
                        <span>登出</span>
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
/* Block */
.user-profile {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
}

/* Element: Avatar Button */
.user-profile__avatar-btn {
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    border: none;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
        transform 0.2s ease,
        background-color 0.2s ease;
}

.user-profile__avatar-btn:hover {
    background-color: var(--primary-filled-hover);
}

/* Modifier: Active State */
.user-profile__avatar-btn--active {
    background-color: var(--primary-filled-pressed);
}

/* Element: Dropdown Menu */
.user-profile__dropdown {
    position: absolute;
    top: calc(100% + var(--space-xs));
    left: 0;
    min-width: 280px;
    background-color: var(--md-sys-color-surface-container-high);
    border-radius: var(--radius-lg);
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: var(--space-md);
    z-index: 100;
    overflow: hidden;
}

/* Header & Info Elements */
.user-profile__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
}

.user-profile__large-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 500;
}

.user-profile__info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.user-profile__name {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.user-profile__divider {
    height: 1px;
    background-color: var(--md-sys-color-outline-variant);
    margin: var(--space-md) 0;
}

/* Actions & Items */
.user-profile__actions {
    display: flex;
    flex-direction: column;
}

.user-profile__item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    text-align: left;
    font-size: var(--font-size-sm);
    transition: background-color 0.2s;
}

.user-profile__item:hover {
    background-color: var(--md-sys-color-surface-container-highest);
}

.user-profile__icon {
    font-family: 'Material Symbols Outlined';
    font-size: 20px;
}

/* Transition Names also following the block name */
.user-profile-fade-enter-active,
.user-profile-fade-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.user-profile-fade-enter-from,
.user-profile-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
