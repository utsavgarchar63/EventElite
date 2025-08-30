<script setup lang="ts">
import api from "@/plugins/axios";
import { useSnackbarStore } from "@/store/snackbar";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const snackbar = useSnackbarStore();

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);

const errors = ref({
  password: "",
  confirmPassword: "",
});

const validateForm = () => {
  errors.value.password = "";
  errors.value.confirmPassword = "";

  let valid = true;

  if (!password.value) {
    errors.value.password = "Password is required";
    valid = false;
  } else if (password.value.length < 8) {
    errors.value.password = "Password must be at least 8 characters";
    valid = false;
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = "Confirm password is required";
    valid = false;
  } else if (confirmPassword.value !== password.value) {
    errors.value.confirmPassword = "Passwords do not match";
    valid = false;
  }

  return valid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  const id = localStorage.getItem("id");

  try {
    await api.put(`/admin/reset-password/${id}`, {
      password: password.value
    });

    snackbar.show("Password reset successfully!", "success");
    // 👉 Call API here to reset password
    // await resetPassword(password.value);

    router.push("/reset-password/success"); // redirect to login after reset
  } catch (err: any) {
    alert(err.message || "Something went wrong");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-form @submit.prevent="handleSubmit">
    <v-row>
      <!-- Password -->
      <v-col cols="12" class="pt-6">
        <v-label>Password</v-label>
        <v-text-field v-model="password" type="password" variant="outlined" placeholder="Enter new password"
          :error="!!errors.password" :error-messages="errors.password" />
        <small style="color:#525454;">Must be at least 8 characters</small>
      </v-col>

      <!-- Confirm Password -->
      <v-col cols="12" class="pt-2">
        <v-label>Confirm Password</v-label>
        <v-text-field v-model="confirmPassword" type="password" variant="outlined" placeholder="Re-enter new password"
          :error="!!errors.confirmPassword" :error-messages="errors.confirmPassword" />
      </v-col>

      <!-- Submit Button -->
      <v-col cols="12" class="pt-4">
        <v-btn type="submit" :loading="loading" color="primary" size="large" block flat>
          Reset Password
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
