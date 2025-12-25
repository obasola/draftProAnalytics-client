<template>
  <div v-if="auth.isAuthenticated" class="text-sm text-gray-300">
    Session expires in:
    <span class="font-bold">{{ minutes }}:{{ seconds }}</span>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/modules/auth/application/authStore";
import { computed } from "vue";

const auth = useAuthStore();

const minutes = computed(() =>
  Math.floor(auth.secondsToExpiry / 60)
);
const seconds = computed(() =>
  String(auth.secondsToExpiry % 60).padStart(2, "0")
);
</script>

