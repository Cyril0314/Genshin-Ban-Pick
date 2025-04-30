<!-- src/features/BanPick/components/Toolbar.vue -->
 
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'reset'): void
  (e: 'record'): void
}>()

function handleClickResetButton() {
  console.log('Toolbar reset clicked')
  emit('reset')
}

function handleClickRecordButton() {
  console.log('Toolbar record clicked')
  emit('record')
}
</script>

<template>
  <div class="toolbar">
    <button class="toolbar__button toolbar__button--reset" @click="handleClickResetButton">Reset</button>
    <button class="toolbar__button toolbar__button--record" @click="handleClickRecordButton">Record</button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  gap: var(--space-sm);
}
.toolbar__button {
  width: var(--size-tool-button);
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border: none;
  border-radius: var(--border-radius-xs);
  padding: calc(var(--space-xs)) calc(var(--space-xs));
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
  font-family: var(--font-family-tech-ui);
}
.toolbar__button:hover {
  background-color: var(--md-sys-color-error-container);
  transform: scale(1.05);
}
.toolbar__button:active {
  transform: scale(0.98);
}
</style>
