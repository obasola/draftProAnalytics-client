<template>
  <Card>
    <template #title>Limitations</template>
    <template #content>
      <ul v-if="items.length > 0" class="limitations">
        <li v-for="item in items" :key="item">{{ item }}</li>
      </ul>
      <p v-else>No limitations were returned.</p>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import type { B4MeMethodologyMetadata } from '../types/b4meAnalysis';

const props = defineProps<{
  methodology: B4MeMethodologyMetadata | null;
}>();

const items = computed<string[]>(() => props.methodology?.knownLimitations ?? []);
</script>

<style scoped>
.limitations {
  margin: 0;
  padding-left: 1.25rem;
}
</style>
