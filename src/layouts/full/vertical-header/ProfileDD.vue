<script setup lang="ts">
import { ref, computed } from 'vue';
import { UserIcon, EditIcon, SettingsIcon, CreditCardIcon, HelpCircleIcon, LogoutIcon } from 'vue-tabler-icons';
import { useAuthStore } from '@/store/authStore';
import NavItem from '../vertical-sidebar/NavItem/index.vue';
import OverviewTab from '@/components/profile/tabs/OverviewTab.vue';
import EditProfileTab from '@/components/profile/tabs/EditProfileTab.vue';
import AccountSettingsTab from '@/components/profile/tabs/AccountSettingsTab.vue';
import PaymentMethodsTab from '@/components/profile/tabs/PaymentMethodsTab.vue';
import SupportCenterTab from '@/components/profile/tabs/SupportCenterTab.vue';
import { useSnackbarStore } from '@/store/snackbar';

// Import tab components
// import OverviewTab from './tabs/OverviewTab.vue';
// import EditProfileTab from './tabs/EditProfileTab.vue';
// import AccountSettingsTab from './tabs/AccountSettingsTab.vue';
// import PaymentMethodsTab from './tabs/PaymentMethodsTab.vue';
// import SupportCenterTab from './tabs/SupportCenterTab.vue';

const authStore = useAuthStore();
const profileDialog = ref(false);
type TabKey = keyof typeof tabComponents;

// Restrict activeTab to valid keys
const activeTab = ref<TabKey>('overview');

// Menu items
const menuItems = [
  { tab: 'overview', title: 'Overview', icon: UserIcon },
  { tab: 'edit', title: 'Edit Profile', icon: EditIcon },
  { tab: 'account', title: 'Account Settings', icon: SettingsIcon },
  { tab: 'payments', title: 'Payment Methods', icon: CreditCardIcon },
  { tab: 'support', title: 'Support Center', icon: HelpCircleIcon },
  { tab: 'logout', title: 'Logout', icon: LogoutIcon, logout: true },
];

// Tab components map
const tabComponents = {
  overview: OverviewTab,
  edit: EditProfileTab,
  account: AccountSettingsTab,
  payments: PaymentMethodsTab,
  support: SupportCenterTab,
};
const currentComponent = computed(() =>
  tabComponents[activeTab.value as keyof typeof tabComponents] || OverviewTab
);

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
        <v-avatar size="35">
          <img src="@/assets/images/users/avatar-1.png" alt="user" />
        </v-avatar>
      </v-btn>
    </template>
  </v-menu>

  <!-- Profile Dialog -->
  <v-dialog v-model="profileDialog" max-width="800">
    <v-card class="rounded-xl overflow-hidden" height="80vh">
      <v-row no-gutters class="h-full">
        <!-- Sidebar -->
        <v-col cols="4" class="sidebar pa-0">
          <div class="sidebar-header pa-4">
            <h3 class="text-lg font-semibold mb-2">Profile & Settings</h3>
          </div>
          <v-divider></v-divider>

          <v-list nav dense>
            <NavItem v-for="item in menuItems" :key="item.tab" :item="item"
              :class="{ 'active-item': activeTab === item.tab }" @click="handleItemClick(item)" />
          </v-list>
        </v-col>

        <!-- Main Content -->
        <v-col cols="8" class="pa-6 overflow-auto">
          <component :is="currentComponent" />
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="useSnackbarStore().snackbar" :color="useSnackbarStore().color" timeout="4000"
    location="top right" transition="slide-x-reverse-transition" class="custom-snackbar">
    <div class="snackbar-content">
      <v-icon v-if="useSnackbarStore().color === 'success'" size="22" class="me-1" color="white">
        mdi-check-circle
      </v-icon>
      <v-icon v-else-if="useSnackbarStore().color === 'error'" size="22" class="me-1" color="white">
        mdi-alert-circle
      </v-icon>
      <v-icon v-else size="22" color="white" class="me-1">
        mdi-information
      </v-icon>
      <span class="snackbar-text">{{ useSnackbarStore().message }}</span>
    </div>
  </v-snackbar>
</template>

<style scoped>
.sidebar {
  background-color: #f9fafb;
  height: 100%;
  border-right: 1px solid #e5e7eb;
}

.sidebar-header {
  background-color: #ffffff;
}

.active-item {
  background-color: #3b82f6 !important;
  color: white;
  font-weight: 500;
  border-left: 3px solid #3b82f6;
}
</style>
