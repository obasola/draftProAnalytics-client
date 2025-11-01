<template>
  <span class="relative group cursor-help inline-flex items-center">
    {{ label }}
    <sup v-if="showStar" class="text-gray-400 ml-0.5">*</sup>
    <span
      v-if="showStar"
      class="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap z-10"
    >
      One or more conference W/L is also a division W/L
    </span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  showStar?: boolean
}>()
</script>

<style scoped>
.group:hover span {
  display: block;
}
</style>
