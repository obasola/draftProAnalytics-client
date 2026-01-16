<template>
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-2xl font-bold">User Administration</h2>

      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText v-model="search" placeholder="Search users..." @input="onSearchInput" />
      </span>
    </div>

    <DataTable
      :value="users"
      :loading="loading"
      paginator
      :rows="10"
      selectionMode="single"
      dataKey="pid"
      @rowSelect="onRowSelect"
    >
      <Column field="pid" header="ID" style="width: 90px" />
      <Column field="userName" header="Username" />
      <Column field="emailAddress" header="Email" />
      <Column field="fullName" header="Name" />
      <Column header="Roles">
        <template #body="{ data }">
          <span>{{ formatRoles(data.roles) }}</span>
        </template>
      </Column>
      <Column header="Active" style="width: 110px">
        <template #body="{ data }">
          <i
            class="pi"
            :class="data.isActive ? 'pi-check-circle' : 'pi-times-circle'"
          />
        </template>
      </Column>
    </DataTable>

    <UserEditDialog
      v-model:visible="displayDialog"
      :user="selectedUser"
      :role-options="roleOptions"
      @saved="reload"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import UserEditDialog from "./UserEditDialog.vue";
import { adminAccessApi, type AdminRoleDto, type AdminUserDto } from "@/modules/accessControl/application/api/adminAccessApi";

type RowSelectEvent<T> = { data: T };

const users = ref<AdminUserDto[]>([]);
const roleOptions = ref<AdminRoleDto[]>([]);
const loading = ref<boolean>(false);

const search = ref<string>("");
const selectedUser = ref<AdminUserDto | null>(null);
const displayDialog = ref<boolean>(false);

function formatRoles(roles: AdminRoleDto[]): string {
  if (!roles || roles.length === 0) return "";
  return roles.map((r) => r.roleName).join(", ");
}

async function reload(): Promise<void> {
  loading.value = true;
  try {
    const res = await adminAccessApi.listUsers(search.value);
    users.value = res.users;
    roleOptions.value = res.roles;
  } finally {
    loading.value = false;
  }
}

function onRowSelect(e: RowSelectEvent<AdminUserDto>): void {
  selectedUser.value = e.data;
  displayDialog.value = true;
}

let searchTimer: number | undefined;

function onSearchInput(): void {
  if (searchTimer) window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    void reload();
  }, 250);
}

onMounted(() => {
  void reload();
});
</script>
