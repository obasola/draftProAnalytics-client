<template>
  <Dialog
    v-model:visible="visibleProxy"
    modal
    header="Edit User Roles"
    :style="{ width: '760px' }"
  >
    <div v-if="user" class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <label class="font-semibold">User</label>
        <div class="text-sm">
          <div><span class="font-semibold">Username:</span> {{ user.userName }}</div>
          <div><span class="font-semibold">Email:</span> {{ user.emailAddress }}</div>
          <div v-if="user.fullName">
            <span class="font-semibold">Name:</span> {{ user.fullName }}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="font-semibold">Roles</label>

        <PickList
          v-model="rolePickList"
          dataKey="rid"
          listStyle="height: 14rem"
          breakpoint="960px"
        >
          <template #sourceheader>
            Available Roles
          </template>

          <template #targetheader>
            Assigned Roles
          </template>

          <template #item="{ item }">
            <div class="flex items-center justify-between w-full gap-2">
              <span class="font-semibold">{{ item.roleName }}</span>
              <span
                v-if="item.rid === PUBLIC_RID"
                class="text-xs opacity-70"
              >
                default
              </span>
            </div>
          </template>
        </PickList>

        <small class="text-sm opacity-70">
          Public is the baseline role and will be preserved automatically.
        </small>
      </div>

      <div class="flex items-center justify-end gap-2 mt-2">
        <Button
          label="Cancel"
          severity="secondary"
          :disabled="saving"
          @click="close"
        />
        <Button
          label="Save"
          icon="pi pi-save"
          :loading="saving"
          @click="save"
        />
      </div>

      <Divider />

      <div class="flex flex-col gap-2">
        <div class="font-semibold">Admin password reset</div>
        <div class="flex gap-2 items-center">
          <Password
            v-model="newPassword"
            toggleMask
            class="w-full"
            placeholder="New password"
          />
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

import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Divider from "primevue/divider";
import Password from "primevue/password";
import PickList from "primevue/picklist";

import {
  adminAccessApi,
  type AdminRoleDto,
  type AdminUserDto,
} from "@/modules/accessControl/application/api/adminAccessApi";
import { personApi } from "@/services/personApi";

const PUBLIC_RID = 1;

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

const rolePickList = ref<[AdminRoleDto[], AdminRoleDto[]]>([[], []]);
const saving = ref<boolean>(false);
const newPassword = ref<string>("");

watch(
  () => [props.user, props.roleOptions] as const,
  () => {
    hydrateRolePickList();
  },
  { immediate: true },
);

function hydrateRolePickList(): void {
  const allRoles = [...props.roleOptions].sort((a, b) => a.rid - b.rid);
  const assignedRoleIds = new Set<number>(
    (props.user?.roles ?? []).map((role) => role.rid),
  );

  const availableRoles = allRoles.filter((role) => !assignedRoleIds.has(role.rid));
  const assignedRoles = allRoles.filter((role) => assignedRoleIds.has(role.rid));

  rolePickList.value = [availableRoles, assignedRoles];
  newPassword.value = "";
}

function close(): void {
  visibleProxy.value = false;
}

async function save(): Promise<void> {
  if (!props.user) return;

  const assignedRoles = rolePickList.value[1] ?? [];

  const roleIds = Array.from(
    new Set<number>([
      PUBLIC_RID,
      ...assignedRoles.map((role) => role.rid),
    ]),
  ).sort((a, b) => a - b);

  saving.value = true;
  try {
    await adminAccessApi.updateUserRoles(props.user.pid, roleIds);
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