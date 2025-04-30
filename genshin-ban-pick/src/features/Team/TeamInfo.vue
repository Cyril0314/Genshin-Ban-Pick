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
  <div class="team__info" :class="`team__info--${team}`">
    <span class="team__name" :class="`team__name--${team}`">
      {{ team === 'aether' ? 'Team\nAether' : 'Team\nLumine' }}
    </span>
    <textarea
      class="team__member-input"
      :class="`team__member-input--${team}`"
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
  flex-direction: row;
  width: 100%;
}

.team__info--lumine {
  flex-direction: row-reverse;
}

.team__name--aether {
  --team-name-color: var(--md-sys-color-on-secondary-container);
  --team-name-bg: var(--md-sys-color-secondary-container);
  --team-tab-hover-bg: var(--md-sys-color-secondary);
  --text-align: left;
  --border-top-right-radius: 0px;
  --border-top-left-radius: var(--border-radius-xs);
  --border-bottom-right-radius: 0px;
  --border-bottom-left-radius: var(--border-radius-xs);
}
.team__name--lumine {
  --team-name-color: var(--md-sys-color-on-tertiary-container);
  --team-name-bg: var(--md-sys-color-tertiary-container);
  --team-tab-hover-bg: var(--md-sys-color-tertiary);
  --text-align: right;
  --border-top-right-radius: var(--border-radius-xs);
  --border-top-left-radius: 0px;
  --border-bottom-right-radius: var(--border-radius-xs);
  --border-bottom-left-radius: 0px;
}

.team__name {
  display: flex;
  flex: 1;
  align-items: start;
  padding: var(--space-xs) var(--space-sm);
  text-align: var(--text-align);
  font-weight: var(--font-weight-heavy);
  font-size: var(--font-size-md);
  font-family: var(--font-family-tech-title);
  color: var(--team-name-color);
  background-color: var(--team-name-bg);
  border-top-right-radius: var(--border-top-right-radius);
  border-top-left-radius: var(--border-top-left-radius);
  border-bottom-right-radius: var(--border-bottom-right-radius);
  border-bottom-left-radius: var(--border-bottom-left-radius);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  white-space: pre-line;
}

.team__member-input--aether {
  --team__member-input-bg: var(--md-sys-color-secondary-container-alpha);
  --border-top-right-radius: var(--border-radius-xs);
  --border-top-left-radius: 0px;
  --border-bottom-right-radius: var(--border-radius-xs);
  --border-bottom-left-radius: 0px;
}
.team__member-input--lumine {
  --team__member-input-bg: var(--md-sys-color-tertiary-container-alpha);
  --border-top-right-radius: 0px;
  --border-top-left-radius: var(--border-radius-xs);
  --border-bottom-right-radius: 0px;
  --border-bottom-left-radius: var(--border-radius-xs);
}

.team__member-input {
  display: flex;
  flex: 3;
  background-color: var(--team__member-input-bg);
  color: var(--md-sys-color-on-surface);
  border: none;
  border-top-right-radius: var(--border-top-right-radius);
  border-top-left-radius: var(--border-top-left-radius);
  border-bottom-right-radius: var(--border-bottom-right-radius);
  border-bottom-left-radius: var(--border-bottom-left-radius);
  min-height: calc(var(--font-size-sm) * var(--line-height-tightest) * 4 + var(--space-sm) * 2);
  height: auto;
  resize: none;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tightest);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-body);
  text-align: center;
  padding: var(--space-sm);
  box-shadow: var(--box-shadow);
}

.team__member-input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.team__member-input:focus {
  outline: none;
}
</style>
