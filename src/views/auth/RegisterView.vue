<!-- src/views/auth/RegisterView.vue -->
<template>
  <div class="register-page min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="register-card card rounded-2xl shadow-xl border p-6 sm:p-8">
        <!-- Header -->
        <div class="mb-6 text-center">
          <h2 class="text-2xl font-semibold text-slate-900">
            Create account
          </h2>
          <p class="mt-1 text-sm text-slate-800">
            Start using your Sports Management dashboard
          </p>
        </div>

        <!-- Social buttons -->
        <div class="space-y-3 mb-5">
          <button
            type="button"
            class="social-btn w-full"
            @click="onGoogleSignUp"
          >
            <span class="social-icon pi pi-google" />
            <span>Sign up with Google</span>
          </button>

          <button
            type="button"
            class="social-btn w-full"
            @click="onAppleSignUp"
          >
            <span class="social-icon pi pi-apple" />
            <span>Sign up with Apple</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="divider mb-5">
          <span></span>
          <span class="divider-label">or sign up with email</span>
          <span></span>
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-row">
              <InputText
                placeholder="firstName"
                id="firstName"
                v-model="firstName"
                class="w-full"
                maxlength="40"
              />
            </div>
            <div class="form-row">
              <InputText
                placeholder="Last name"
                id="lastName"
                v-model="lastName"
                class="w-full"
                maxlength="40"
              />
            </div>
          </div>
          <div class="form-row">
            <InputText
              placeholder="Username"
              id="userName"
              v-model="userName"
              class="w-full"
              autocomplete="username"
              maxlength="40"
            />
          </div>
          <div class="form-row">
            <InputText
              placeholder="Email"
              id="emailAddress"
              v-model="emailAddress"
              class="w-full"
              autocomplete="email"
              maxlength="40"
            />
          </div>
          <div class="form-row">
            <Password
              placeholder="Password"
              inputId="password"
              v-model="password"
              toggleMask
              class="w-full"
              :feedback="false"
              autocomplete="new-password"
              maxlength="40"
            />
          </div>

          <div class="form-row">
            <Password
              placeholder="Confirm password"
              inputId="confirmPassword"
              v-model="confirmPassword"
              toggleMask
              class="w-full"
              :feedback="false"
              autocomplete="new-password"
              maxlength="40"
            />
          </div>

          <p v-if="errorMessage" class="text-xs text-red-700 mt-1">
            {{ errorMessage }}
          </p>

          <Button
            label="Create account"
            class="btn-primary-254290 w-full p-button-lg"
            :loading="loading"
            type="submit"
          />

          <p class="text-center text-sm text-slate-900 mt-2">
            Already have an account?
            <RouterLink
              to="/login"
              class="link-strong"
            >
              Sign in
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/authApi';

const router = useRouter();
const auth = useAuthStore();

const firstName = ref<string>('');
const lastName = ref<string>('');
const userName = ref<string>('');
const emailAddress = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');
const loading = ref<boolean>(false);
const errorMessage = ref<string>('');

async function onSubmit(): Promise<void> {
  errorMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;
  try {
    await authApi.register({
      userName: userName.value,
      emailAddress: emailAddress.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
    });

    router.push({
      name: 'Login',
      query: { registered: '1' },
    });
  } catch {
    errorMessage.value = 'Unable to create account. Please try again.';
  } finally {
    loading.value = false;
  }
}

function onGoogleSignUp(): void {
  auth.loginWithGoogle();
}

function onAppleSignUp(): void {
  auth.loginWithApple();
}
</script>

<style scoped>
.register-page {
  background: #0f172a;
}

.register-card {
  background-color: #f1e0a3;
  border-color: rgba(15, 23, 42, 0.12);
}

.form-row {
  display: flex;
  flex-direction: column;
  width: 26%;
  gap: 0.25rem;
  padding-bottom: 0.3em;
}

.InputText{
  background-color: #674b01;
}
.form-label {
  font-size: 0.875rem;
  font-weight: bolder;
  color: #254290;
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

/* Social + divider reused from login */
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

.link-strong {
  color: #254290;
  font-weight: 600;
  text-decoration: none;
}

.link-strong:hover {
  text-decoration: underline;
}
</style>
