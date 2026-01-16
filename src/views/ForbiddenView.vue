<!-- src/views/ForbiddenView.vue -->
<template>
  <div class="forbidden-page">
    <div class="card">
      <div class="title-row">
        <i class="pi pi-lock" style="font-size: 1.5rem" />
        <h2>Access denied</h2>
      </div>

      <p class="subtitle">
        You’re signed in, but you don’t have permission to view this page.
      </p>

      <div class="meta" v-if="fromPath">
        <span class="label">Requested:</span>
        <span class="value">{{ fromPath }}</span>
      </div>

      <div class="actions">
        <Button label="Go to Dashboard" icon="pi pi-home" @click="goDashboard" />
        <Button label="Go Back" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const fromPath = computed(() => {
  const q = route.query.from;
  return typeof q === "string" ? q : "";
});

const goDashboard = async (): Promise<void> => {
  await router.push("/dashboard");
};

const goBack = (): void => {
  router.back();
};
</script>

<style scoped>
.forbidden-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.card {
  width: 100%;
  max-width: 720px;
  border-radius: 1rem;
  padding: 1.25rem 1.25rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.15);
  color: #ffffff;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.title-row h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
}

.subtitle {
  margin: 0 0 1rem 0;
  opacity: 0.92;
}

.meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.label {
  font-weight: 600;
}

.value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
