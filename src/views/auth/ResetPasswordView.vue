<template>
  <div class="reset-page min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="reset-card card rounded-2xl shadow-xl border p-6 sm:p-8">
        <!-- Header -->
        <div class="mb-6 text-center">
          <h2 class="text-2xl font-semibold text-slate-900">
            Reset password
          </h2>
          <p class="mt-1 text-sm text-slate-800">
            Choose a new password for your account.
          </p>
        </div>

        <!-- Status messages -->
        <div v-if="success" class="mb-4 text-sm text-green-800">
          Password updated successfully. Redirecting to sign in…
        </div>
        <div v-if="errorMessage" class="mb-4 text-sm text-red-700">
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="form-row">
            <label for="password" class="form-label">New password</label>
            <Password
              inputId="password"
              v-model="password"
              toggleMask
              class="w-full"
              :feedback="false"
              autocomplete="new-password"
            />
          </div>

          <div class="form-row">
            <label for="passwordConfirm" class="form-label">
              Confirm password
            </label>
            <Password
              inputId="passwordConfirm"
              v-model="passwordConfirm"
              toggleMask
              class="w-full"
              :feedback="false"
              autocomplete="new-password"
            />
          </div>

          <Button
            label="Update password"
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
import { useRoute, useRouter } from 'vue-router';
import { authApi } from '@/services/authApi';

const route = useRoute();
const router = useRouter();

const password = ref<string>('');
const passwordConfirm = ref<string>('');
const loading = ref<boolean>(false);
const success = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

async function onSubmit(): Promise<void> {
  errorMessage.value = null;
  success.value = false;

  const token = route.params.token as string | undefined;
  if (!token) {
    errorMessage.value = 'Invalid or missing reset token.';
    return;
  }

  if (!password.value || !passwordConfirm.value) {
    errorMessage.value = 'Please enter and confirm your new password.';
    return;
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;

  try {
    await authApi.resetPassword(token,password.value);

    success.value = true;

    // small UX touch: send to login after a short delay
    setTimeout(() => {
      void router.push('/login');
    }, 1500);
  } catch {
    errorMessage.value =
      'Unable to reset password. The link may be invalid or expired.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.reset-page {
  background: #0f172a;
}

.reset-card {
  background-color: #f1e0a3; /* complementary to #254290 */
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
