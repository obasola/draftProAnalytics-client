<!-- src/modules/auth/presentation/views/ForgotPasswordView.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { forgotPasswordUseCase } from '../../application/usecases/forgotPasswordUseCase';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';


const router = useRouter();
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
    await forgotPasswordUseCase({ emailAddress: emailAddress.value });
    successMessage.value =
      'If an account exists for that email, a reset link has been sent.';
  } catch {
    errorMessage.value = 'Unable to send reset email. Please try again.';
  } finally {
    loading.value = false;
  }
}

function goToLogin(): void {
  void router.push({ name: 'Login' });
}
</script>

<template>
  <div class="forgot-page min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="forgot-card card rounded-2xl shadow-xl border p-6 sm:p-8">
        <div class="mb-6 text-center">
          <h2 class="text-2xl font-semibold">
            Forgot password
          </h2>
          <p class="mt-1 text-sm">
            Enter your email and we’ll send a reset link.
          </p>
        </div>

        <div class="field-group">
          <form class="space-y-4" @submit.prevent="onSubmit">
            <div class="form-row">
              <label for="emailAddress" class="form-label">Email</label>
              <InputText
                id="emailAddress"
                v-model="emailAddress"
                autocomplete="email"
                inputmode="email"
              />
            </div>

            <Message v-if="successMessage" severity="success" :closable="false">
              {{ successMessage }}
            </Message>

            <Message v-if="errorMessage" severity="error" :closable="false">
              {{ errorMessage }}
            </Message>

            <Button
              label="Send reset link"
              class="btn-primary-254290 w-full p-button-lg"
              :loading="loading"
              type="submit"
            />

            <Button
              label="Back to login"
              class="btn-outline-white w-full p-button-lg p-button-outlined"
              type="button"
              @click="goToLogin"
            />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forgot-page {
  background-color: #b66e00;
  color: #ffffff;
}

.forgot-card {
  background-color: #b66e00;
  border-color: rgba(255, 255, 255, 0.65);
}

.field-group {
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 1rem;
  padding: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.125rem;
}

.helper-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
}

.link-small {
  color: #ffffff;
  text-decoration: underline;
  font-size: 0.875rem;
}

:deep(.p-inputtext),
:deep(.p-password-input) {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.65);
  color: #ffffff;
}

:deep(.p-inputtext::placeholder),
:deep(.p-password-input::placeholder) {
  color: rgba(255, 255, 255, 0.78);
}

:deep(.p-message) {
  border-color: rgba(255, 255, 255, 0.45);
}

.btn-primary-254290 {
  background-color: #254290 !important;
  border-color: #254290 !important;
  color: #ffffff !important;
}

.btn-primary-254290:hover {
  filter: brightness(1.05);
}

.btn-outline-white {
  border-color: rgba(255, 255, 255, 0.75) !important;
  color: #ffffff !important;
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}
</style>
