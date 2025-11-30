<!-- src/views/admin/UserEditDialog.vue (or src/components/admin/UserEditDialog.vue) -->
<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Edit User"
    :style="{ width: '450px' }"
  >
    <div v-if="form" class="grid gap-2">
      <div>
        <label>Username</label>
        <InputText v-model="form.userName" class="w-full" />
      </div>

      <div>
        <label>Email</label>
        <InputText v-model="form.emailAddress" class="w-full" />
      </div>

      <div>
        <label>Role</label>
        <Dropdown
          v-model="form.rid"
          :options="roleOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <div>
        <label>Active?</label>
        <InputSwitch v-model="form.isActive" />
      </div>

      <div class="mt-3">
        <label>Admin Reset Password</label>
        <Password v-model="newPassword" toggleMask class="w-full" />
        <Button
          label="Reset Password"
          class="mt-2 w-full"
          @click="resetPassword"
          :disabled="!newPassword"
        />
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" @click="close" class="p-button-text" />
      <Button label="Save" @click="save" :disabled="!form" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { personApi } from "@/services/personApi";

interface RoleOption {
  label: string;
  value: number;
}

interface EditableUser {
  pid: number;
  userName: string;
  emailAddress: string;
  rid: number | null;
  isActive: boolean;
  // add other fields if needed, but keep this shape as the editable subset
}

const props = defineProps<{
  modelValue: boolean;
  user: EditableUser | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "updated"): void;
}>();

// Writable wrapper for the v-model prop
const visible = computed<boolean>({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const form = ref<EditableUser | null>(null);
const newPassword = ref<string>("");

const roleOptions: RoleOption[] = [
  { label: "Visitor", value: 1 },
  { label: "Admin", value: 2 },
  { label: "Developer", value: 3 },
];

watch(
  () => props.user,
  (u) => {
    form.value = u ? { ...u } : null;
  },
  { immediate: true },
);

async function save(): Promise<void> {
  if (!form.value) return;

  await personApi.update(form.value.pid, form.value);
  emit("updated");
  close();
}

async function resetPassword(): Promise<void> {
  if (!form.value || !newPassword.value) return;

  await personApi.adminResetPassword(form.value.pid, newPassword.value);
  newPassword.value = "";
}

function close(): void {
  emit("update:modelValue", false);
}
</script>
