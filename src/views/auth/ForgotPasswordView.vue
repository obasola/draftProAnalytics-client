<!-- src/views/auth/ForgotPasswordView.vue -->
<template>
  <div class="forgot-page min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="forgot-card card rounded-2xl shadow-xl border p-6 sm:p-8">
        <!-- Header -->
        <div class="mb-6 text-center">
          <h2 class="text-2xl font-semibold text-slate-900">
            Forgot password
          </h2>
          <p class="mt-1 text-sm text-slate-800">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        <!-- Status messages -->
        <div v-if="successMessage" class="mb-4 text-sm text-green-800">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mb-4 text-sm text-red-700">
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="form-row">
            <label for="emailAddress" class="form-label">Email</label>
            <InputText
              id="emailAddress"
              v-model="emailAddress"
              class="w-full"
              autocomplete="email"
            />
          </div>

          <Button
            label="Send reset link"
            class="btn-primary-254290 w-full p-button-lg"
            :loading="loading"
            type="submit"
          />

          <p class="text-center text-sm text-slate-900 mt-2">
            Remembered your password?
            <RouterLink
              to="/login"
              class="link-strong"
            >
              Back to sign in
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authApi } from '@/services/authApi';

const emailAddress = ref<string>('');
const loading = ref<boolean>(false);
const errorMessage = ref<string>('');
const successMessage = ref<string>('');

async function onSubmit(): Promise<void> {
  errorMessage.value = '';
  successMessage.value = '';

  if (!emailAddress.value.trim()) {
    errorMessage.value = 'Please enter your email address.';
    return;
  }

  loading.value = true;
  try {
    await authApi.forgotPassword(emailAddress.value );
    successMessage.value =
      'If an account exists for that email, a reset link has been sent.';
  } catch {
    errorMessage.value = 'Unable to send reset email. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.forgot-page {
  background: #0f172a;
}

.forgot-card {
  background-color: #f1e0a3;
  border-color: rgba(15, 23, 42, 0.12);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.1rem;
}

.btn-primary-254290 {
  background-color: #254290 !important;
  border-color: #254290 !important;
  color: #ffffff !important;
}

.btn-primary-254290:hover {
  filter: brightness(1.05);
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
