<!-- src/features/Team/TeamInfo.vue -->
<script setup lang="ts">
const props = defineProps<{
  team: 'aether' | 'lumine'
  modelValue: {
    name: string
    members: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: { name: string; members: string }): void
}>()

function updateMembers(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', {
    ...props.modelValue,
    members: target.value,
  })
}

</script>

<template>
  <div class="team__info">
    <span class="team__name" :class="`team__name--${team}`">
      {{ team === 'aether' ? 'Team Aether' : 'Team Lumine' }}
    </span>
    <textarea
      class="team__member-input"
      :placeholder="`Members`"
      :data-team="team"
      :value="modelValue.members"
      @input="updateMembers"
    />
  </div>
</template>

<style scoped>
.team__info {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--space-sm);
}

.team__name {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  justify-content: center;
  font-weight: var(--font-weight-heavy);
  font-size: var(--font-size-md);
  font-family: var(--font-family-tech-title);
  color: #4e4040;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.team__member-input {
  background-color: rgba(255, 255, 255, 0.2);
  color: #4e4040;
  border: none;
  border-radius: 8px;
  width: 100%;
  min-height: calc(var(--font-size-sm) * var(--line-height-tight) * 4 + var(--space-xs) * 2);
  height: auto;
  resize: none;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-body);
  padding: var(--space-xs);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.team__member-input:focus {
  outline: none;
}
</style>
