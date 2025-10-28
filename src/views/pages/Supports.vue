<template>
  <v-container>
    <div class="table-wrapper" style="background: white; border-radius: 8px; padding: 16px">
      <!-- Header -->
      <div class="header-section d-flex justify-space-between align-center flex-wrap mb-4">
        <h5 class="title h3 mb-2 mb-md-0">All Support Requests ({{ totalSupports }})</h5>

        <div class="d-flex gap-3 flex-wrap">
          <!-- Search -->
          <v-text-field
            v-model="search"
            placeholder="Search Support"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            append-inner-icon="mdi-magnify"
            class="search-bar"
          />
        </div>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="loader-wrapper">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <v-data-table
          :headers="headers"
          :items="filteredSupports"
          hide-default-footer
          class="custom-table"
          density="comfortable"
        >
          <template #item.status="{ item }">
            <v-chip
              :color="item.status ? 'green' : 'red'"
              variant="flat"
              size="small"
            >
              {{ item.status ? 'Resolved' : 'Pending' }}
            </v-chip>
          </template>

          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </v-data-table>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/plugins/axios'; // your axios instance

const loading = ref(false);
const supports = ref([]);
const search = ref('');
const totalSupports = ref(0);

// Table headers
const headers = [
  { title: 'Full Name', key: 'full_name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone', key: 'phone' },
  { title: 'Message', key: 'message' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Created At', key: 'created_at' }
];

// Fetch Support Data
const fetchSupports = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token'); // assuming super_admin_token stored here
    const response = await api.get('http://134.209.40.232/api/support/all', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.status) {
      supports.value = response.data.data.map(s => ({
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        phone: s.phone,
        message: s.message,
        status: s.status,
        role: s.role,
        created_at: s.created_at
      }));
      totalSupports.value = supports.value.length;
    } else {
      supports.value = [];
      totalSupports.value = 0;
    }
  } catch (error) {
    console.error('Failed to fetch supports:', error);
  } finally {
    loading.value = false;
  }
};

// Computed Filter
const filteredSupports = computed(() => {
  if (!search.value) return supports.value;
  const q = search.value.toLowerCase();
  return supports.value.filter(s =>
    s.full_name.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    s.phone.includes(q) ||
    s.role.toLowerCase().includes(q)
  );
});

// Format Date (using plain JS)
const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return '-';
  const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleString('en-IN', options);
};

onMounted(fetchSupports);
</script>

<style scoped>
.title {
  font-weight: bold;
}
.search-bar {
  background-color: #f4f4f4;
  border-radius: 8px;
  width: 250px;
}
.loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  width: 100%;
}
.custom-table {
  background: white;
  width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}
::v-deep(.custom-table tbody tr:hover) {
  background-color: #e3e3e368 !important;
  cursor: pointer;
  transition: all 0.3s ease;
}
.table-wrapper {
  overflow-x: auto;
}
</style>
