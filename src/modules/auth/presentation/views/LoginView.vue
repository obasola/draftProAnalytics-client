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
        
        <div class="social-button-stack mb-5">
          <div
            ref="googleButtonHost"
            class="google-button-host"
            :class="{ 'is-disabled': socialLoading }"
            aria-label="Sign in with Google"
          />
          <!--
          <button
            type="button"
            class="apple-google-style"
            :disabled="socialLoading"
            @click="onAppleSignIn"
          >
            <span class="pi pi-apple social-icon" />
            <span>Sign in with Apple</span>
          </button>
          -->

        </div>

        <p v-if="socialError" class="social-error mb-4">{{ socialError }}</p>

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
              <InputText id="userName" v-model="userName" class="w-full" autocomplete="username" />
            </div>

            <!-- Password -->
            <div class="form-row">
              <label for="password" class="form-label">
                Password
              </label>
              <Password inputId="password" v-model="password" toggleMask class="w-full" :feedback="false"
                autocomplete="current-password" />
            </div>

            <!-- Remember + Forgot -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Checkbox inputId="remember" v-model="rememberMeLocal" />
                <label for="remember" class="form-label cursor-pointer !mb-0">
                  Remember me
                </label>
              </div>

              <RouterLink to="/forgot-password" class="link-small">
                Forgot password?
              </RouterLink>
            </div>

            <!-- Submit -->
            <Button label="Login" class="btn-primary-254290 w-full p-button-lg" :loading="loading" type="submit" />

            <!-- Register link -->
            <p class="text-center text-sm text-slate-900 mt-2">
              Don’t have an account?
              <RouterLink to="/register" class="link-strong">
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
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../application/authStore';
import { renderGoogleSignInButton, signInWithApple } from '../../infrastructure/socialAuthSdk';
//import { useAccessStore } from "@/modules/accessControl/application/accessStore"; // whatever you named it

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
//const access = useAccessStore();

const userName = ref<string>('');
const password = ref<string>('');
const loading = ref<boolean>(false);
const socialLoading = ref<boolean>(false);
const googleButtonHost = ref<HTMLElement | null>(null);
const socialError = ref<string>('');
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
    console.log("LOGIN OK. pushing to:", redirect);
    await router.push(redirect);
    console.log("PUSH DONE. now at:", router.currentRoute.value.fullPath);

  } finally {
    loading.value = false;
  }
}
/*
const onSubmit = async (): Promise<void> => {
  const ok = await auth.login({ userName, password }); // your DTO
  if (!ok) return;

  // critical: hydrate permissions/menu/guards
  await access.loadMe(); // should call GET /api/access/me and set can()

  // don’t use push here; replace prevents going “Back” to login
  await router.replace({ name: "Dashboard" }); // or "/dashboard"
};
*/
// src/modules/auth/presentation/views/LoginView.vue <script setup>

async function finishSocialLogin(action: () => Promise<void>): Promise<void> {
  socialLoading.value = true;
  socialError.value = '';
  try {
    await action();
    const redirect = (route.query.redirect as string | undefined) ?? '/dashboard';
    await router.replace(redirect);
  } catch (error: unknown) {
    socialError.value = error instanceof Error ? error.message : 'Social sign-in failed';
    console.error('[social-login]', error);
  } finally {
    socialLoading.value = false;
  }
}

async function onGoogleCredential(credential: string): Promise<void> {
  await finishSocialLogin(() => auth.loginWithGoogle(credential));
}

async function onAppleSignIn(): Promise<void> {
  await finishSocialLogin(async () => {
    const result = await signInWithApple(
      import.meta.env.VITE_APPLE_CLIENT_ID ?? '',
      import.meta.env.VITE_APPLE_REDIRECT_URI ?? window.location.origin,
    );

    await auth.loginWithApple(
      result.authorization.id_token,
      result.user?.name?.firstName,
      result.user?.name?.lastName,
    );
  });
}

onMounted(async () => {
  if (!googleButtonHost.value) return;
  try {
    await renderGoogleSignInButton(
      googleButtonHost.value,
      import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
      credential => void onGoogleCredential(credential),
    );
  } catch (error: unknown) {
    socialError.value = error instanceof Error ? error.message : 'Google sign-in is unavailable';
  }
});

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



.divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.divider>span:first-child,
.divider>span:last-child {
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



.google-button-host,
.apple-sign-in-button {
  width: 254px;
  max-width: 100%;
}

.google-button-host {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  border-radius: 9999px;
}

.google-button-host :deep(div),
.google-button-host :deep(iframe) {
  max-width: 100% !important;
}

.google-button-host.is-disabled {
  pointer-events: none;
  opacity: 0.65;
}

.social-error {
  color: #fff7ed;
  background: rgba(127, 29, 29, 0.55);
  border: 1px solid rgba(254, 202, 202, 0.8);
  border-radius: 0.75rem;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
}

.social-btn:disabled {
  cursor: wait;
  opacity: 0.65;
}
.social-login-buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  width: 254px;
}

.google-button-container {
  width: 254px;
  min-height: 40px;
}

.apple-google-style {
  width: 254px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;

  padding: 0 12px;
  border: 1px solid #1a73e8;
  border-radius: 4px;

  background: #1a73e8;
  color: #ffffff;

  font-family: Roboto, Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;

  cursor: pointer;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.apple-google-style:hover:not(:disabled) {
  background: #1765cc;
  box-shadow:
    0 1px 2px rgb(0 0 0 / 20%),
    0 1px 3px 1px rgb(0 0 0 / 10%);
}

.apple-google-style:focus-visible {
  outline: 2px solid #174ea6;
  outline-offset: 2px;
}

.apple-google-style:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.apple-google-style .social-icon {
  width: 18px;
  font-size: 18px;
  text-align: center;
}
</style>
