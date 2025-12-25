<!-- src/modules/auth/presentation/views/ForgotPasswordView.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { forgotPasswordUseCase } from '../../application/usecases/forgotPasswordUseCase';

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
</script>
