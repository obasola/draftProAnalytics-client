<template>
  <Tag :value="label" severity="info" rounded />
</template>

<script setup lang="ts">
import Tag from 'primevue/tag';

const props = defineProps<{
  frameworkVersion: string | null;
}>();

const label = props.frameworkVersion ? `Framework ${props.frameworkVersion}` : 'Framework n/a';
</script>
