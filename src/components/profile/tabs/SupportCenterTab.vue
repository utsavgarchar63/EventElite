<script setup lang="ts">
import { ref } from 'vue';
import api from '@/plugins/axios';
import { useSnackbarStore } from '@/store/snackbar';
import { useAuthStore } from '@/store/authStore';

const snackbar = useSnackbarStore();
const authStore = useAuthStore();

// Form fields
const fullName = ref('');
const email = ref('');
const phone = ref('');
const message = ref('');

// Loading state
const loading = ref(false);

// Form errors
const errors = ref({
  fullName: '',
  email: '',
  phone: '',
  message: ''
});

// Validate form
const validateForm = () => {
  let isValid = true;
  errors.value.fullName = '';
  errors.value.email = '';
  errors.value.phone = '';
  errors.value.message = '';

  if (!fullName.value) {
    errors.value.fullName = 'Full name is required';
    isValid = false;
  }
  if (!email.value) {
    errors.value.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Invalid email format';
    isValid = false;
  }
  if (!phone.value) {
    errors.value.phone = 'Phone number is required';
    isValid = false;
  }
  if (!message.value) {
    errors.value.message = 'Message is required';
    isValid = false;
  }

  return isValid;
};




// Handle submit
const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    const response = await api.post(
      '/support/add',
      {
        full_name: fullName.value,
        email: email.value,
        phone: phone.value,
        message: message.value,
        role: authStore.role || 'user',
        user_id: authStore.user?.id || 1
      },

    );

    if (response.data.status) {
      snackbar.show('Support request submitted successfully!', 'success');
      fullName.value = '';
      email.value = '';
      phone.value = '';
      message.value = '';
    } else {
      snackbar.show(response.data.message || 'Submission failed', 'error');
    }
  } catch (error: any) {
    snackbar.show(error.response?.data?.message || 'Submission failed', 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-row>
    <!-- Contact Support Card -->
    <v-col cols="12">
      <v-card class="pa-4">
        <h3 class="mb-4">Contact Support</h3>
        <p>Fill out the form below and we will get back to you.</p>

        <v-form @submit.prevent="handleSubmit" class="mt-2">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="fullName" hide-details="auto" label="Full Name" variant="outlined"
                :error="!!errors.fullName" :error-messages="errors.fullName" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="email" hide-details="auto" label="Email" variant="outlined" :error="!!errors.email"
                :error-messages="errors.email" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="phone" hide-details="auto" label="Phone" variant="outlined" :error="!!errors.phone"
                :error-messages="errors.phone" required />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="message" hide-details="auto" label="Message" variant="outlined"
                :error="!!errors.message" :error-messages="errors.message" rows="4" required />
            </v-col>
            <v-col cols="12" class="pt-0">
              <v-btn type="submit" color="primary" block :loading="loading">
                Submit
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-col>

    <!-- Quick Help Card -->


  </v-row>
</template>
