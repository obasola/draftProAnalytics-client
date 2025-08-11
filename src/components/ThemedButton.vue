<!-- Enhanced ThemedButton.vue with more variants -->
<template>
  <Button
    :class="[
      'themed-button',
      variant,
      size,
      {
        'is-loading': loading,
      }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="handleClick"
  >
    <i v-if="loading" class="pi pi-spin pi-spinner mr-2"></i>
    <slot />
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';

interface Props {
  variant?: 'primary' | 'secondary' | 'neutral' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  loading: false,
  disabled: false,
});

const emit = defineEmits<{
  click: [event: Event];
}>();

const handleClick = (event: Event): void => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.themed-button {
  @apply font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

/* Sizes */
.themed-button.small {
  @apply text-xs px-2 py-1;
}

.themed-button.medium {
  @apply text-sm px-4 py-2;
}

.themed-button.large {
  @apply text-base px-6 py-3;
}

/* Variants */
.themed-button.primary {
  background-color: var(--team-primary);
  border-color: var(--team-primary);
  color: var(--team-accent);
  
  &:hover:not(:disabled) {
    background-color: var(--team-secondary);
    border-color: var(--team-secondary);
  }
  
  &:focus {
    --tw-ring-color: var(--team-primary);
  }
}

.themed-button.secondary {
  background-color: var(--team-secondary);
  border-color: var(--team-secondary);
  color: var(--team-accent);
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:focus {
    --tw-ring-color: var(--team-secondary);
  }
}

.themed-button.neutral {
  @apply bg-gray-100 border-gray-300 text-gray-700;
  
  &:hover:not(:disabled) {
    @apply bg-gray-200;
  }
  
  &:focus {
    @apply ring-gray-500;
  }
}

.themed-button.danger {
  @apply bg-red-600 border-red-600 text-white;
  
  &:hover:not(:disabled) {
    @apply bg-red-700;
  }
  
  &:focus {
    @apply ring-red-500;
  }
}

.themed-button.success {
  @apply bg-green-600 border-green-600 text-white;
  
  &:hover:not(:disabled) {
    @apply bg-green-700;
  }
  
  &:focus {
    @apply ring-green-500;
  }
}

.themed-button.is-loading {
  @apply opacity-75 cursor-not-allowed;
}

.themed-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>