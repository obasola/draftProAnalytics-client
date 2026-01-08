<!-- src/modules/auth/presentation/views/LoginView.vue -->
<template>
  <div class="login-page min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="login-card card rounded-2xl shadow-xl border p-6 sm:p-8">
        <!-- Header -->
        <div class="mb-6 text-center">
          <h2 class="text-2xl font-semibold text-slate-900">
            Sign in
          </h2>
          <p class="mt-1 text-sm text-slate-800">
            Access your Sports Management dashboard
          </p>
        </div>

        <!-- Social buttons -->
        <div class="space-y-3 mb-5">
          <button
            type="button"
            class="social-btn w-full"
            @click="onGoogleSignIn"
          >
            <span class="social-icon pi pi-google" />
            <span>Sign in with Google</span>
          </button>

          <button
            type="button"
            class="social-btn w-full"
            @click="onAppleSignIn"
          >
            <span class="social-icon pi pi-apple" />
            <span>Sign in with Apple</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="divider mb-5">
          <span></span>
          <span class="divider-label">or continue with email</span>
          <span></span>
        </div>

        <!-- Form -->
        <div class="field-group">
          <form @submit.prevent="onSubmit" class="space-y-4">
          <!-- Username -->
          <div class="form-row">
            <label for="userName" class="form-label">
              Username
            </label>
            <InputText
              id="userName"
              v-model="userName"
              class="w-full"
              autocomplete="username"
            />
          </div>

          <!-- Password -->
          <div class="form-row">
            <label for="password" class="form-label">
              Password
            </label>
            <Password
              inputId="password"
              v-model="password"
              toggleMask
              class="w-full"
              :feedback="false"
              autocomplete="current-password"
            />
          </div>

          <!-- Remember + Forgot -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Checkbox
                inputId="remember"
                v-model="rememberMeLocal"
              />
              <label
                for="remember"
                class="form-label cursor-pointer !mb-0"
              >
                Remember me
              </label>
            </div>

            <RouterLink
              to="/forgot-password"
              class="link-small"
            >
              Forgot password?
            </RouterLink>
          </div>

          <!-- Submit -->
          <Button
            label="Login"
            class="btn-primary-254290 w-full p-button-lg"
            :loading="loading"
            type="submit"
          />

          <!-- Register link -->
          <p class="text-center text-sm text-slate-900 mt-2">
            Don’t have an account?
            <RouterLink
              to="/register"
              class="link-strong"
            >
              Create one
            </RouterLink>
          </p>
        </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../application/authStore';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const userName = ref<string>('');
const password = ref<string>('');
const loading = ref<boolean>(false);
const rememberMeLocal = ref<boolean>(auth.rememberMe);

watch(
  rememberMeLocal,
  (value: boolean) => {
    auth.setRememberMe(value);
  },
  { immediate: true },
);

async function onSubmit(): Promise<void> {
  loading.value = true;
  try {
    await auth.login(userName.value, password.value);
    const redirect = (route.query.redirect as string | undefined) ?? '/dashboard';
    await router.push(redirect);
  } finally {
    loading.value = false;
  }
}

function onGoogleSignIn(): void {
  auth.loginWithGoogle();
}

function onAppleSignIn(): void {
  auth.loginWithApple();
}
</script>

<style scoped>
/* unchanged styles from your existing LoginView */
.login-page {
  background-color: #b66e00;
  color: #ffffff;
}

.login-card {
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

.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s;
}

.social-btn:hover {
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
  transform: translateY(-1px);
}

.social-icon {
  font-size: 1rem;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.divider > span:first-child,
.divider > span:last-child {
  flex: 1;
  height: 1px;
  background-color: rgba(15, 23, 42, 0.25);
}

.divider-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15, 23, 42, 0.7);
}

.link-small {
  font-size: 0.875rem;
  color: #254290;
  font-weight: 500;
  text-decoration: none;
}

.link-small:hover {
  text-decoration: underline;
}

.link-strong {
  color: #254290;
  font-weight: 600;
  text-decoration: none;
}

.link-strong:hover {
  text-decoration: underline;
}
/* Ensure PrimeVue inputs are legible on a dark-ish brand background */
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

:deep(.p-checkbox .p-checkbox-box) {
  border-color: rgba(255, 255, 255, 0.65);
}

.divider-label,
.link-small {
  color: #ffffff;
}

.social-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.65);
  color: #ffffff;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}
</style>
