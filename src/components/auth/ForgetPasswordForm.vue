<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// import { sendForgetPasswordCode } from '@/services/auth'; 
import { useSnackbarStore } from "@/store/snackbar";
import api from '@/plugins/axios';

const router = useRouter();
const snackbar = useSnackbarStore();


const email = ref('');
const loading = ref(false);
const errors = ref({
     email: ''
});

const validateEmail = () => {
     errors.value.email = '';

     if (!email.value) {
          errors.value.email = 'Email is required';
          return false;
     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
          errors.value.email = 'Invalid email format';
          return false;
     }
     return true;
};

const handleSubmit = async () => {
     if (!validateEmail()) return;

     loading.value = true;
     try {
          // ✅ Call your API
          await api.post("/send-otp", {
               email: email.value
          });

          snackbar.show("OTP sent successfully!", "success");

          // ✅ Navigate to verify page with email as query param
          router.push({
               path: "/verify-otp",
               query: { email: email.value }
          });
     } catch (error: any) {
          // ✅ Handle error from API
          if (error.response?.data?.message) {
               snackbar.show(error.response.data.message, "error");
          } else {
               snackbar.show("Something went wrong. Please try again.", "error");
          }
     } finally {
          loading.value = false;
     }
};
</script>

<template>
     <v-form @submit.prevent="handleSubmit">
          <v-row>
               <v-col cols="12" class="pt-6">
                    <v-label>Email</v-label>
                    <v-text-field v-model="email" variant="outlined" hide-details="auto" color="primary"
                         placeholder="Enter your email" :error="!!errors.email" :error-messages="errors.email" />
               </v-col>

               <v-col cols="12" class="pt-0 pb-6">
                    <small style="color: #525454;">
                         A 4-digit verification code will be sent to the given email.
                    </small>
               </v-col>

               <v-col cols="12" class="pt-2">
                    <v-btn type="submit" :loading="loading" color="primary" size="large" block flat>
                         Continue
                    </v-btn>
               </v-col>
          </v-row>
     </v-form>
</template>
