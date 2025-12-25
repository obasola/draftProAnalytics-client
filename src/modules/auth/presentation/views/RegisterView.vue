<!-- src/modules/auth/presentation/views/RegisterView.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerPersonUseCase } from '../../application/usecases/registerPersonUseCase';
import { useAuthStore } from '../../application/authStore';

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
    await registerPersonUseCase({
      userName: userName.value,
      emailAddress: emailAddress.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
    });

    await router.push({
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
