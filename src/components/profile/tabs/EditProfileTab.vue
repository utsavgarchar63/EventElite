<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/plugins/axios';
import { useAuthStore } from '@/store/authStore';
import { useSnackbarStore } from '@/store/snackbar';

const authStore = useAuthStore();
const snackbar = useSnackbarStore();

const loading = ref(false);
const saving = ref(false);
const name = ref('');
const email = ref('');
const phone = ref('');
const userId = ref<number | null>(null);

const loadUserFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      name.value = user.name || '';
      email.value = user.email || '';
      phone.value = user.phone_no || '';
      userId.value = user.id;
    } else {
      snackbar.show('No user found in local storage', 'warning');
    }
  } catch (error) {
    console.error(error);
    snackbar.show('Failed to load user from local storage', 'error');
  } finally {
    loading.value = false;
  }
};
const saveProfile = async () => {
  if (!userId.value) {
    snackbar.show('User ID not found. Please login again.', 'error');
    return;
  }

  saving.value = true;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      snackbar.show('No token found. Please login again.', 'error');
      saving.value = false;
      return;
    }

    // API call to update all fields
    const response = await api.put(
      `/users/${userId.value}`,
      {
        name: name.value,
        email: email.value,
        phone_no: phone.value,
      },
    );

    const responseData = response.data;

    if (response.status === 200 || responseData.status) {
      // update local storage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        name: name.value,
        email: email.value,
        phone_no: phone.value,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      authStore.setUser(updatedUser);

      snackbar.show('Profile updated successfully!', 'success');
    } else {
      snackbar.show(responseData.message || 'Failed to update profile', 'error');
    }
  } catch (error: any) {
    console.error('Profile update failed:', error);
    snackbar.show(error.response?.data?.message || 'Failed to update profile', 'error');
  } finally {
    saving.value = false;
  }
};


onMounted(() => {
  loading.value = true;
  loadUserFromLocalStorage();
});
</script>
<template>
  <div>
    <h3 class="mb-4 font-semibold text-lg">Edit Profile</h3>

    <v-skeleton-loader v-if="loading" type="article" />

    <div v-else>
      <div class="mb-4">
        <label class="block mb-1 font-medium text-gray-700" style="font-size: 14px;">Full Name</label>
        <v-text-field v-model="name" hide-details="auto" variant="outlined" density="compact" />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium text-gray-700" style="font-size: 14px;">Email</label>
        <v-text-field v-model="email" hide-details="auto" variant="outlined" density="compact" />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium text-gray-700" style="font-size: 14px;">Phone</label>
        <v-text-field v-model="phone" hide-details="auto" variant="outlined" density="compact" />
      </div>

      <v-btn block :loading="saving" color="primary" class="text-white" @click="saveProfile">
        Save Changes
      </v-btn>
    </div>
  </div>
</template>
