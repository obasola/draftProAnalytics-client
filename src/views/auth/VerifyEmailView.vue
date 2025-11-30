<template>
  <div class="verify-page min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="verify-card card rounded-2xl shadow-xl border p-6 sm:p-8">
        <div class="mb-4 text-center">
          <h2 class="text-2xl font-semibold text-slate-900">
            Email verification
          </h2>
        </div>

        <div class="mt-2 text-sm" :class="messageClass">
          {{ message }}
        </div>

        <div class="mt-6 flex justify-center">
          <RouterLink
            to="/login"
            class="link-strong"
          >
            Go to sign in
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authApi } from '@/services/authApi';

const route = useRoute();

const message = ref<string>('Verifying your email…');
const isError = ref<boolean>(false);

const messageClass = computed<string>(() =>
  isError.value ? 'text-red-700' : 'text-green-800'
);

onMounted(async () => {
  const token = route.params.token as string | undefined;

  if (!token) {
    message.value = 'Verification failed. Token is missing or invalid.';
    isError.value = true;
    return;
  }

  try {
    await authApi.verifyEmail(token);
    message.value = 'Email verified successfully! You may now log in.';
    isError.value = false;
  } catch {
    message.value = 'Verification failed. Token expired or invalid.';
    isError.value = true;
  }
});
</script>

<style scoped>
.verify-page {
  background: #0f172a;
}

.verify-card {
  background-color: #f1e0a3;
  border-color: rgba(15, 23, 42, 0.12);
}

.link-strong {
  color: #254290;
  font-weight: 600;
  text-decoration: none;
}

.link-strong:hover {
  text-decoration: underline;
}
</style>
