<script setup lang="ts">
import { computed, ref } from "vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { useAuthStore } from "@/modules/auth/application/authStore";

type RoleOption = { rid: number; roleName: string };

const auth = useAuthStore();
const selectedRid = ref<number | null>(null);

const options = computed<RoleOption[]>(() => auth.assignedRoles);

const canSwitch = computed<boolean>(() => {
  if (!auth.isAuthenticated) return false;
  if (options.value.length <= 1) return false;
  if (selectedRid.value == null) return false;
  return selectedRid.value !== auth.activeRid;
});

const placeholder = computed<string>(() => {
  if (!auth.activeRoleName) return "Role";
  return `Role: ${auth.activeRoleName}`;
});

async function onAssume(): Promise<void> {
  if (selectedRid.value == null) return;
  await auth.assumeRole(selectedRid.value);
  selectedRid.value = null;
}
</script>

<template>
  <div v-if="auth.isAuthenticated" class="role-switcher">
    <Dropdown
      v-model="selectedRid"
      :options="options"
      optionLabel="roleName"
      optionValue="rid"
      :placeholder="placeholder"
      class="role-dd"
    />
    <Button
      label="Assume"
      icon="pi pi-sync"
      size="small"
      :disabled="!canSwitch"
      @click="onAssume"
    />
  </div>
</template>

<style scoped>
.role-switcher {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.25rem 0.25rem 0.75rem 0.25rem;
}
.role-dd {
  min-width: 160px;
}
</style>
