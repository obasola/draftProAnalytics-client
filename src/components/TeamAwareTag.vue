<!-- components/TeamAwareTag.vue -->
<template>
  <Tag 
    :value="displayValue" 
    :class="['team-aware-tag', tagClass]"
    :style="tagStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeamColors } from '@/composables/useTeamColors'
import Tag from 'primevue/tag'

interface Props {
  value: string
  isHome?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  isHome: false,
  variant: 'default'
})

const { teamColors } = useTeamColors()

const displayValue = computed(() => {
  if (props.value.toUpperCase() === 'HOME') return 'HOME'
  if (props.value.toUpperCase() === 'AWAY') return 'AWAY'
  return props.value
})

const tagClass = computed(() => {
  const classes = ['team-aware-tag']
  
  if (props.variant === 'default') {
    if (props.isHome) {
      classes.push('home-tag')
    } else {
      classes.push('away-tag')
    }
  } else {
    classes.push(`variant-${props.variant}`)
  }
  
  return classes
})

const tagStyle = computed(() => {
  const { primary, secondary, accent } = teamColors.value
  
  if (props.variant === 'primary') {
    return {
      backgroundColor: primary,
      color: accent,
      borderColor: primary
    }
  }
  
  if (props.variant === 'secondary') {
    return {
      backgroundColor: secondary,
      color: accent,
      borderColor: secondary
    }
  }
  
  if (props.variant === 'default') {
    if (props.isHome) {
      return {
        backgroundColor: primary,
        color: accent,
        borderColor: primary
      }
    } else {
      return {
        backgroundColor: 'white',
        color: primary,
        borderColor: primary
      }
    }
  }
  
  return {}
})
</script>

<style scoped>
.team-aware-tag {
  @apply font-medium text-xs px-2 py-1 rounded border;
  transition: all 0.2s ease;
}

.team-aware-tag.home-tag {
  @apply shadow-sm;
}

.team-aware-tag.away-tag {
  @apply shadow-sm;
  background-color: white !important;
}

.team-aware-tag.variant-neutral {
  @apply bg-gray-100 text-gray-700 border-gray-300;
}
</style>




