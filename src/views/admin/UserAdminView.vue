<template>
  <div class="card p-4">
    <h2 class="text-2xl font-bold mb-3">User Administration</h2>

    <DataTable
      :value="users"
      :loading="loading"
      paginator :rows="10"
      selectionMode="single"
      @rowSelect="onRowSelect"
    >
      <Column field="pid" header="ID" />
      <Column field="userName" header="Username" />
      <Column field="emailAddress" header="Email" />
      <Column field="fullName" header="Name" />
      <Column field="role" header="Role" />
      <Column field="isActive" header="Active" />
      <Column field="emailVerified" header="Verified" />
    </DataTable>

    <UserEditDialog
      v-if="selectedUser"
      v-model="displayDialog"
      :user="selectedUser"
      @updated="loadUsers"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { personApi } from "@/services/personApi";
import UserEditDialog from "./UserEditDialog.vue";

const users = ref<any[]>([]);
const loading = ref(false);
const selectedUser = ref<any>(null);
const displayDialog = ref(false);

async function loadUsers() {
  loading.value = true;
  try {
    users.value = await personApi.list();
  } finally {
    loading.value = false;
  }
}

function onRowSelect(e: any) {
  selectedUser.value = e.data;
  displayDialog.value = true;
}

onMounted(loadUsers);
</script>
