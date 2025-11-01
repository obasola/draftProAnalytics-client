<!-- components/GameResultTag.vue -->
<template>
  <div class="game-result-tag" :class="resultClass">
    <i :class="resultIcon"></i>
    <span class="result-text">{{ displayText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeamColors } from '@/composables/useTeamColors'

interface Props {
  result: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const { teamColors } = useTeamColors()

const resultType = computed(() => {
  switch (props.result.toUpperCase()) {
    case 'W': return 'win'
    case 'L': return 'loss'
    case 'T': return 'tie'
    default: return 'unknown'
  }
})

const displayText = computed(() => {
  switch (resultType.value) {
    case 'win': return 'WIN'
    case 'loss': return 'LOSS'
    case 'tie': return 'TIE'
    default: return props.result.toUpperCase()
  }
})

const resultIcon = computed(() => {
  switch (resultType.value) {
    case 'win': return 'pi pi-check-circle'
    case 'loss': return 'pi pi-times-circle'
    case 'tie': return 'pi pi-minus-circle'
    default: return 'pi pi-question-circle'
  }
})

const resultClass = computed(() => {
  return [
    'game-result',
    `result-${resultType.value}`,
    `size-${props.size}`
  ]
})
</script>

<style scoped>
.game-result-tag {
  @apply inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-white shadow-sm;
  transition: all 0.2s ease;
}

.game-result-tag.size-small {
  @apply text-xs px-2 py-1;
}

.game-result-tag.size-medium {
  @apply text-sm px-3 py-1;
}

.game-result-tag.size-large {
  @apply text-base px-4 py-2;
}

.game-result-tag.result-win {
  background-color: var(--team-secondary);
  color: var(--team-accent);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.game-result-tag.result-loss {
  @apply bg-red-500 text-white;
}

.game-result-tag.result-tie {
  @apply bg-yellow-500 text-white;
}

.game-result-tag.result-unknown {
  @apply bg-gray-400 text-white;
}

.game-result-tag:hover {
  @apply transform scale-105 shadow-md;
}

.result-text {
  @apply font-semibold;
}
</style>