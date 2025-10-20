<script setup lang="ts">
import { useAuthStore } from '@/store/authStore';
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  window.location.href = '/auth/login';
};
</script>

<template>
  <div>
    <h3 class="mb-4">Account Settings</h3>
    <v-btn color="primary" variant="outlined" block @click="logout">Logout</v-btn>
  </div>
</template>
