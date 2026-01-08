<!-- src/modules/auth/presentation/views/VerifyEmailView.vue -->
<template>
  <div class="verify-page min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="verify-card card rounded-2xl shadow-xl border p-6 sm:p-8">
        <!-- Header -->
        <div class="mb-6 text-center">
          <h2 class="text-2xl font-semibold text-slate-900">
            Verify your email
          </h2>
          <p class="mt-1 text-sm text-slate-800">
            We’re confirming your email address. This only takes a moment.
          </p>
        </div>

        <div class="field-group">
        <!-- Pending -->
        <div v-if="status === 'pending'" class="text-center text-sm text-slate-900">
          <p class="mb-3">
            Verifying your email address&hellip;
          </p>
          <p class="text-xs text-slate-700">
            Please wait, do not close this window.
          </p>
        </div>

        <!-- Success -->
        <div v-else-if="status === 'success'" class="space-y-4 text-center">
          <p class="text-sm text-green-800 font-medium">
            Your email has been successfully verified.
          </p>
          <p class="text-xs text-slate-800">
            You can now sign in to your Sports Management account.
          </p>

          <Button
            label="Go to login"
            class="btn-primary-254290 w-full p-button-lg"
            @click="goToLogin"
          />
        </div>

        <!-- Error -->
        <div v-else class="space-y-4 text-center">
          <p class="text-sm text-red-700 font-medium">
            We could not verify your email.
          </p>
          <p class="text-xs text-slate-800">
            {{ errorMessage }}
          </p>

          <Button
            label="Back to login"
            class="btn-primary-254290 w-full p-button-lg"
            @click="goToLogin"
          />
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import { verifyEmailUseCase } from '../../application/usecases/verifyEmailUseCase';

type VerifyStatus = 'pending' | 'success' | 'error';

const route = useRoute();
const router = useRouter();

const status = ref<VerifyStatus>('pending');
const errorMessage = ref<string>('An unknown error occurred while verifying your email.');

function resolveTokenParam(): string | null {
  const param = route.params.token;
  if (Array.isArray(param)) {
    return param[0] ?? null;
  }
  return typeof param === 'string' ? param : null;
}

async function runVerification(): Promise<void> {
  const token = resolveTokenParam();

  if (!token) {
    status.value = 'error';
    errorMessage.value = 'Verification token is missing or invalid.';
    return;
  }

  try {
    await verifyEmailUseCase(token);
    status.value = 'success';

    // Optional: auto-redirect after a short delay
    window.setTimeout(() => {
      void router.push({ name: 'Login' });
    }, 2000);
  } catch (err: unknown) {
    status.value = 'error';

    if (err instanceof Error && err.message.trim().length > 0) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value =
        'The verification link may be invalid or expired. Please request a new one.';
    }
  }
}

function goToLogin(): void {
  void router.push({ name: 'Login' });
}

onMounted(() => {
  void runVerification();
});
</script>

<style scoped>
.verify-page {
  background-color: #b66e00;
  color: #ffffff;
}

.verify-card {
  background-color: #b66e00;
  border-color: rgba(255, 255, 255, 0.65);
}

.field-group {
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 1rem;
  padding: 1rem;
}

.btn-primary-254290 {
  background-color: #254290 !important;
  border-color: #254290 !important;
  color: #ffffff !important;
}

.btn-primary-254290:hover {
  filter: brightness(1.05);
}
/* Normalize text colors from utility classes used elsewhere */
.verify-card :deep(*) {
  color: #ffffff;
}

.btn-primary-254290 {
  background-color: #254290 !important;
  border-color: #254290 !important;
  color: #ffffff !important;
}
</style>
