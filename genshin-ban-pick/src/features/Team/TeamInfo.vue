<!-- src/features/Team/TeamInfo.vue -->
<script setup lang="ts">
import type { ITeamInfo } from '@/types/ITeam'
import { useTeamTheme } from '@/composables/useTeamTheme';

const props = defineProps<{side: 'left' | 'right'
  modelValue: ITeamInfo
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: ITeamInfo): void
}>()

const { themeVars } = useTeamTheme(props.modelValue.id)

function updateMembers(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', {
    ...props.modelValue,
    members: target.value,
  })
}
</script>

<template>
  <div class="team__info" :style="themeVars">
    <span class="team__name" :class="`team__name--${side}`">
      {{ modelValue.name }}
    </span>
    <textarea
      class="team__member-input"
      :class="`team__member-input--${side}`"
      :placeholder="`Members`"
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

.team__info--right {
  flex-direction: row-reverse;
}

.team__name--left {
  --text-align: left;
  --border-top-right-radius: 0px;
  --border-top-left-radius: var(--border-radius-xs);
  --border-bottom-right-radius: 0px;
  --border-bottom-left-radius: var(--border-radius-xs);
}
.team__name--right {
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
  color: var(--team-on-bg);
  background-color: var(--team-bg);
  box-shadow: var(--box-shadow);
  border-top-right-radius: var(--border-top-right-radius);
  border-top-left-radius: var(--border-top-left-radius);
  border-bottom-right-radius: var(--border-bottom-right-radius);
  border-bottom-left-radius: var(--border-bottom-left-radius);
  white-space: pre-line;
}

.team__member-input--left {
  --border-top-right-radius: var(--border-radius-xs);
  --border-top-left-radius: 0px;
  --border-bottom-right-radius: var(--border-radius-xs);
  --border-bottom-left-radius: 0px;
}

.team__member-input--right {
  --border-top-right-radius: 0px;
  --border-top-left-radius: var(--border-radius-xs);
  --border-bottom-right-radius: 0px;
  --border-bottom-left-radius: var(--border-radius-xs);
}

.team__member-input {
  display: flex;
  flex: 3;
  background-color: var(--team-alpha);
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
