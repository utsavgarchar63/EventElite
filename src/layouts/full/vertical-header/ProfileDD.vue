<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  UserIcon,
  EditIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogoutIcon,
} from 'vue-tabler-icons';
import { useAuthStore } from '@/store/authStore';
import NavItem from '../vertical-sidebar/NavItem/index.vue';
import OverviewTab from '@/components/profile/tabs/OverviewTab.vue';
import EditProfileTab from '@/components/profile/tabs/EditProfileTab.vue';
import AccountSettingsTab from '@/components/profile/tabs/AccountSettingsTab.vue';
import SupportCenterTab from '@/components/profile/tabs/SupportCenterTab.vue';
import { useSnackbarStore } from '@/store/snackbar';

const authStore = useAuthStore();
const profileDialog = ref(false);

// Tab components
const tabComponents = {
  overview: OverviewTab,
  edit: EditProfileTab,
  account: AccountSettingsTab,
  support: SupportCenterTab,
};

// Get role & user info from localStorage
const userRole = localStorage.getItem('role');
const userData = JSON.parse(localStorage.getItem('user') || '{}');

// ✅ Compute initials based on role
const userInitials = computed(() => {
  const role = userRole;

  if (role === 'super_admin') return 'SA';

  if (role === 'admin') {
    const first = userData?.first_name?.[0] || '';
    const last = userData?.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'AD';
  }

  // Default: normal user
  const name = userData?.name || '';
  return name ? name.slice(0, 2).toUpperCase() : 'US';
});


// All menu items
const allMenuItems = [
  { tab: 'overview', title: 'Overview', icon: UserIcon },
  { tab: 'edit', title: 'Edit Profile', icon: EditIcon },
  { tab: 'account', title: 'Account Settings', icon: SettingsIcon },
  { tab: 'support', title: 'Support Center', icon: HelpCircleIcon },
  { tab: 'logout', title: 'Logout', icon: LogoutIcon, logout: true },
];

// Filtered menu items based on role
const menuItems =
  userRole === 'user'
    ? allMenuItems
    : allMenuItems.filter((item) => item.tab !== 'overview' || item.logout);

// ✅ Default tab based on role
const activeTab = ref(userRole === 'user' ? 'overview' : 'edit');

const currentComponent = computed(() =>
  tabComponents[activeTab.value as keyof typeof tabComponents] || EditProfileTab
);

// ✅ Handle menu click
const handleItemClick = (item: any) => {
  if (item.logout) {
    authStore.logout();
    window.location.href = '/auth/login';
  } else {
    activeTab.value = item.tab;
  }
};
</script>
<template>
  <!-- Profile Button -->
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn v-bind="props" icon @click="profileDialog = true">
        <!-- Avatar Circle -->
        <v-avatar size="35" color="primary" class="d-flex align-center justify-center text-white font-weight-medium">
          {{ userInitials }}
        </v-avatar>
      </v-btn>
    </template>
  </v-menu>

  <!-- Profile Dialog -->
  <v-dialog v-model="profileDialog" max-width="700" height="80vh">
    <v-card class="rounded-xl overflow-hidden" style="height: 100%;">
      <div style="display: flex; height: 100%;">
        <!-- Sidebar -->
        <div class="sidebar" style="width: 30%; height: 100%; overflow-y: auto;">
          <div class="sidebar-header pa-4">
            <h3 class="text-lg font-semibold mb-2">Profile & Settings</h3>
          </div>
          <v-divider></v-divider>
          <v-list nav dense>
            <NavItem
              v-for="item in menuItems"
              :key="item.tab"
              :item="item"
              :class="{ 'active-item': activeTab === item.tab }"
              @click="handleItemClick(item)"
            />
          </v-list>
        </div>

        <!-- Main Content -->
        <div class="scroll-hidden" style="width: 70%; height: 100%; padding: 24px;">
          <component :is="currentComponent" />
        </div>
      </div>
    </v-card>
  </v-dialog>

  <v-snackbar
    v-model="useSnackbarStore().snackbar"
    :color="useSnackbarStore().color"
    timeout="4000"
    location="top right"
    transition="slide-x-reverse-transition"
    class="custom-snackbar"
  >
    <div class="snackbar-content">
      <v-icon v-if="useSnackbarStore().color === 'success'" size="22" class="me-1" color="white">
        mdi-check-circle
      </v-icon>
      <v-icon v-else-if="useSnackbarStore().color === 'error'" size="22" class="me-1" color="white">
        mdi-alert-circle
      </v-icon>
      <v-icon v-else size="22" color="white" class="me-1">mdi-information</v-icon>
      <span class="snackbar-text">{{ useSnackbarStore().message }}</span>
    </div>
  </v-snackbar>
</template>


<style scoped>
.sidebar {
  background-color: #f9fafb;
  border-right: 1px solid #e5e7eb;
  scroll-behavior: smooth;

}

.scroll-hidden {
  overflow-y: scroll;
  /* enable scrolling */
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.scroll-hidden::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.active-item {
  background-color: #3b82f6 !important;
  color: white;
  font-weight: 500;
  border-left: 3px solid #3b82f6;
}

.sidebar-header {
  background-color: #ffffff;
}
</style>
