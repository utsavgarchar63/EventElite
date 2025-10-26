<script setup lang="ts">
import { ref, onMounted, type Ref, toRefs } from 'vue';
import api from '@/plugins/axios';
import { useSnackbarStore } from '@/store/snackbar';

// --------------------
// Snackbar
// --------------------
const snackbar = useSnackbarStore();

// --------------------
// Notification States
// --------------------


const notifications = {
  email: ref(true),
  sms: ref(false),
  push: ref(true),
};

const { email, sms, push } = toRefs(notifications);
// --------------------
// Password Fields
// --------------------
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// --------------------
// Loading States
// --------------------
const loading = ref(false); // For fetching user settings
const savingNotifications = ref(false); // For notifications
const savingPassword = ref(false);

// --------------------
// User ID from localStorage
// --------------------
const storedUser = localStorage.getItem('user');
let userId: string | null = null;

if (storedUser) {
  try {
    const user = JSON.parse(storedUser);
    userId = user.id;
  } catch (error) {
    console.error('Failed to parse stored user:', error);
  }
}

// --------------------
// Fetch user settings
// --------------------
const fetchSettings = async () => {
  loading.value = true;
  try {
    // Fetch from API (mocked here)
    const response = await api.get(`/user/settings`);
    const settings = response.data;
    // Example: default settings
    notifications.email.value = settings.data.email_notifications ?? false;
    notifications.sms.value = settings.data.sms_notifications ?? false;
    notifications.push.value = settings.data.push_notifications ?? false;

  } catch (error) {
    console.error('Failed to fetch settings:', error);
    snackbar.show('Failed to load settings', 'error');
  } finally {
    loading.value = false;
  }
};

// --------------------
// Toggle function
// --------------------
const toggleNotification = (key: 'email' | 'sms' | 'push') => {
  if (key === 'email') email.value = !email.value;
  if (key === 'sms') sms.value = !sms.value;
  if (key === 'push') push.value = !push.value;
};
// --------------------
// Save notification settings
// --------------------
// Save notification settings
const saveSettings = async () => {
  savingNotifications.value = true;
  try {
    const payload = {
      email_notifications: notifications.email.value,
      sms_notifications: notifications.sms.value,
      push_notifications: notifications.push.value,
    };

    await api.put(`/user/settings`, payload);
    snackbar.show('Settings updated successfully', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    snackbar.show('Failed to save settings', 'error');
  } finally {
    savingNotifications.value = false;
  }
};

// Save password
const savePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    snackbar.show('New password and confirm password do not match', 'error');
    return;
  }

  if (!userId) {
    snackbar.show('User not found', 'error');
    return;
  }

  savingPassword.value = true;

  try {
    await api.put(`/users/${userId}`, { password: newPassword.value });
    snackbar.show('Password updated successfully', 'success');

    // Clear fields
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (error) {
    console.error('Failed to update password:', error);
    snackbar.show('Failed to update password', 'error');
  } finally {
    savingPassword.value = false;
  }
};

// --------------------
// On component mount
// --------------------
onMounted(() => {
  fetchSettings();
});
</script>

<template>
  <div class="settings-container flex flex-wrap gap-6">

    <!-- Notification Preferences Card -->
    <v-card outlined class="pa-4 flex-1 min-w-[300px] rounded-lg border border-gray-300">
      <h3 class="mb-4 text-lg font-semibold">Notification Preferences</h3>

      <div class="custom-toggle-item" @click="toggleNotification('email')">
        <span>Email Notifications</span>
        <div class="custom-toggle-switch">
          <div class="toggle-track" :class="{ active: email }">
            <div class="toggle-knob" :class="{ active: email }"></div>
          </div>
        </div>
      </div>

      <div class="custom-toggle-item" @click="toggleNotification('sms')">
        <span>SMS Notifications</span>
        <div class="custom-toggle-switch">
          <div class="toggle-track" :class="{ active: sms }">
            <div class="toggle-knob" :class="{ active: sms }"></div>
          </div>
        </div>
      </div>

      <div class="custom-toggle-item" @click="toggleNotification('push')">
        <span>Push Notifications</span>
        <div class="custom-toggle-switch">
          <div class="toggle-track" :class="{ active: push }">
            <div class="toggle-knob" :class="{ active: push }"></div>
          </div>
        </div>
      </div>



      <v-btn color="primary" class="mt-4" :loading="savingNotifications" @click="saveSettings">
        Save Settings
      </v-btn>
    </v-card>

    <!-- Change Password Card -->
    <v-card outlined class="pa-4 flex-1 min-w-[300px] rounded-lg border border-gray-300">
      <h3 class="mb-4 text-lg font-semibold">Change Password</h3>

      <v-text-field v-model="currentPassword" variant="outlined" label="Current Password" type="password" class="mb-4"
        hide-details="auto" />
      <v-text-field v-model="newPassword" variant="outlined" label="New Password" type="password" class="mb-4"
        hide-details="auto" />
      <v-text-field v-model="confirmPassword" variant="outlined" label="Confirm New Password" type="password"
        class="mb-4" hide-details="auto" />

      <v-btn color="primary" class="mt-4" :loading="savingPassword" @click="savePassword">
        Save Password
      </v-btn>
    </v-card>

  </div>
</template>

<style scoped>
.settings-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

/* Toggle Styles */
.custom-toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 16px;
}

.custom-toggle-switch {
  display: inline-block;
}

.toggle-track {
  width: 44px;
  height: 24px;
  background-color: #E5E7EB;
  border-radius: 12px;
  position: relative;
  transition: background-color 0.2s ease;
}

.toggle-track.active {
  background-color: #2A85FF;
}

.toggle-knob {
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-knob.active {
  transform: translateX(20px);
}
</style>
