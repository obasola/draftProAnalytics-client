<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const props = defineProps<{ id: number }>();
const emit = defineEmits<{ (e: 'run'): void; (e: 'cancel'): void }>();
const router = useRouter();
</script>

<template>
  <div class="flex gap-2">
    <Button label="Run" size="small" @click="$emit('run')" />
    <Button label="Cancel" size="small" severity="danger" @click="$emit('cancel')" />
    <Button label="Detail" size="small" severity="secondary" @click="router.push({ name: 'job-detail', params: { id: props.id } })" />
  </div>
</template>
