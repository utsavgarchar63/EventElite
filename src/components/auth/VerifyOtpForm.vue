<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "@/plugins/axios";
import { useSnackbarStore } from "@/store/snackbar";

const router = useRouter();
const route = useRoute();
const snackbar = useSnackbarStore();

const otp = ref(["", "", "", ""]);
const errors = ref("");
const loading = ref(false);

const email = (route.query.email as string) || "";

// Handle input auto move
const handleInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, ""); // only digits

  if (value) {
    otp.value[index] = value[value.length - 1]; // take last digit if multiple typed
    if (index < otp.value.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  } else {
    otp.value[index] = "";
  }
};

// Handle backspace
const handleBackspace = (event: KeyboardEvent, index: number) => {
  if (event.key === "Backspace" && !otp.value[index] && index > 0) {
    const prevInput = document.getElementById(`otp-${index - 1}`);
    prevInput?.focus();
  }
};

// Validation
const validateOtp = () => {
  errors.value = "";
  const code = otp.value.join("");
  if (code.length !== 4 || !/^\d{4}$/.test(code)) {
    errors.value = "Please enter a valid 4-digit OTP";
    return false;
  }
  return true;
};

// ✅ Submit handler
const handleSubmit = async () => {
  if (!validateOtp()) return;

  loading.value = true;
  try {
    const code = otp.value.join("");

    // ✅ Call verify-otp API
    const response = await api.post("/verify-otp", {
      email,
      otp: code
    });
    const responseData = response.data;
    console.log(responseData.success,responseData.data.token)
    if (responseData.success) {
      localStorage.setItem("id", responseData.data.id);

    }

    snackbar.show("OTP verified successfully!", "success");

    // ✅ Navigate to reset password
    router.push("/reset-password");
  } catch (err: any) {
    errors.value =
      err.response?.data?.message || err.message || "Invalid OTP";
  } finally {
    loading.value = false;
  }
};

// ✅ Resend OTP API call
const resendOtp = async () => {
  try {
    loading.value = true;

    await api.post("/send-otp", { email });

    snackbar.show("OTP resent successfully!", "success");
  } catch (err: any) {
    snackbar.show(
      err.response?.data?.message || "Failed to resend OTP",
      "error"
    );
  } finally {
    loading.value = false;
  }
};
</script>


<template>
  <v-form @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12">
        <p class="text-body-1 text-muted">
          Please enter a 4-digit verification code sent to
          <b style="color: black;">{{ email }}</b>.
        </p>
      </v-col>

      <!-- OTP Boxes -->
      <v-col cols="12" class="d-flex justify-space-between gap-4 mt-2">
        <v-text-field v-for="(digit, index) in otp" :key="index" v-model="otp[index]" :id="`otp-${index}`" maxlength="1"
          variant="outlined" type="tel" class="otp-input" hide-details :error="!!errors"
          @input="(e: Event) => handleInput(e, index)" @keydown="(e: KeyboardEvent) => handleBackspace(e, index)" />
      </v-col>

      <!-- Error -->
      <v-col cols="12">
        <span v-if="errors" style="color: red;">{{ errors }}</span>
      </v-col>

      <!-- Button -->
      <v-col cols="12">
        <v-btn type="submit" :loading="loading" color="primary" size="large" block flat>
          Verify Code
        </v-btn>
      </v-col>

      <v-col cols="12" class="text-center">
        <h6 class="text-h6 text-muted font-weight-bold d-flex justify-center align-center mt-3">
          Didn’t get a code?
          <a href="javascript:void(0)" class="text-primary font-weight-medium" @click="resendOtp">
            Click to resend
          </a>
        </h6>
      </v-col>
    </v-row>
  </v-form>
</template>

<style scoped>
.otp-input {
  max-width: 80px;
  height: 63px;
  font-size: 36px;
  font-weight: 700;
  text-align: center;
}

.otp-input :deep(input) {
  text-align: center;
  height: 100%;
  font-size: 20px;
  line-height: 63px;
}

h2 {
  font-weight: 700;
}
</style>
