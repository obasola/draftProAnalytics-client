<template>
  <Dialog
    v-model:visible="visibleProxy"
    modal
    header="Edit User Roles"
    :style="{ width: '520px' }"
  >
    <div v-if="user" class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <label class="font-semibold">User</label>
        <div class="text-sm">
          <div><span class="font-semibold">Username:</span> {{ user.userName }}</div>
          <div><span class="font-semibold">Email:</span> {{ user.emailAddress }}</div>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-semibold">Roles</label>
        <MultiSelect
          v-model="selectedRoleIds"
          :options="roleOptionItems"
          optionLabel="label"
          optionValue="value"
          placeholder="Select roles"
          display="chip"
          class="w-full"
        />
      </div>

      <div class="flex items-center justify-end gap-2 mt-2">
        <Button label="Cancel" severity="secondary" @click="close" />
        <Button label="Save" icon="pi pi-save" @click="save" :loading="saving" />
      </div>

      <Divider />

      <div class="flex flex-col gap-2">
        <div class="font-semibold">Admin password reset</div>
        <div class="flex gap-2 items-center">
          <Password v-model="newPassword" toggleMask class="w-full" placeholder="New password" />
          <Button
            label="Reset"
            icon="pi pi-key"
            severity="warning"
            :disabled="!newPassword"
            @click="resetPassword"
          />
        </div>
      </div>
    </div>

    <div v-else class="text-sm">No user selected.</div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { adminAccessApi, type AdminRoleDto, type AdminUserDto } from "@/modules/accessControl/application/api/adminAccessApi";
import { personApi } from "@/services/personApi";

interface RoleOptionItem {
  label: string;
  value: number;
}

const props = defineProps<{
  visible: boolean;
  user: AdminUserDto | null;
  roleOptions: AdminRoleDto[];
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "saved"): void;
}>();

const visibleProxy = computed<boolean>({
  get: () => props.visible,
  set: (v) => emit("update:visible", v),
});

const selectedRoleIds = ref<number[]>([]);
const saving = ref<boolean>(false);
const newPassword = ref<string>("");

const roleOptionItems = computed<RoleOptionItem[]>(() =>
  props.roleOptions.map((r) => ({ label: r.roleName, value: r.rid })),
);

watch(
  () => props.user,
  (u) => {
    selectedRoleIds.value = u ? u.roles.map((r) => r.rid) : [];
    newPassword.value = "";
  },
  { immediate: true },
);

function close(): void {
  visibleProxy.value = false;
}

async function save(): Promise<void> {
  if (!props.user) return;

  saving.value = true;
  try {
    await adminAccessApi.updateUserRoles(props.user.pid, selectedRoleIds.value);
    emit("saved");
    close();
  } finally {
    saving.value = false;
  }
}

async function resetPassword(): Promise<void> {
  if (!props.user || newPassword.value.trim().length === 0) return;

  await personApi.adminResetPassword(props.user.pid, newPassword.value.trim());
  newPassword.value = "";
}
</script>
