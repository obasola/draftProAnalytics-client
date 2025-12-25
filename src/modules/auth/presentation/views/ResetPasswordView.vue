<!-- src/modules/auth/presentation/views/ResetPasswordView.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resetPasswordUseCase } from '../../application/usecases/resetPasswordUseCase';

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
    await resetPasswordUseCase({
      token,
      newPassword: password.value,
    });

    success.value = true;

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
