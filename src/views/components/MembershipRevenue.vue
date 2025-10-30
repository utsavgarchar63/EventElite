<template>
  <v-container>
    <div style="background-color: white; padding: 10px; border-radius: 8px;">

      <!-- Header -->
      <div class="header-section">
        <!-- Title -->
        <h1 class="title">
          Membership ({{ totalOrganizations }} Members)
        </h1>

        <!-- Filters Section -->
      </div>
      <div v-if="showFilters" class="filters d-flex align-center">
        <!-- Search -->
        <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" dense variant="outlined"
          hide-details clearable style="min-width: 200px;" />

        <!-- Date Picker -->
        <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y>
          <template #activator="{ props }">
            <v-text-field v-bind="props" v-model="formattedDate" label="Select Date Range" dense variant="outlined"
              hide-details readonly prepend-inner-icon="mdi-calendar" style="min-width: 200px;" />
          </template>

          <v-card>
            <v-date-picker v-model="dates" range scrollable @update:model-value="updateFormattedDate" />
            <v-card-actions>
              <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
              <v-btn text color="primary" @click="applyDateFilter">Apply</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <!-- View Switch -->
        <v-select v-model="view" :items="viewOptions" dense variant="outlined" hide-details style="min-width: 150px;"
          prepend-inner-icon="mdi-view-list" />

        <!-- Filter Icons -->
        <!-- Sort -->
        <v-select v-model="sortType" :items="[
          { title: 'A → Z', value: 1 },
          { title: 'Z → A', value: 2 },
          { title: 'Low → High Revenue', value: 3 },
          { title: 'High → Low Revenue', value: 4 }
        ]" dense variant="outlined" hide-details style="min-width: 200px;" label="Sort By"
          @update:model-value="fetchMembershipData" />

        <!-- <v-btn icon class="filter-btn" @click="openFilterDialog">
          <v-icon>mdi-filter-variant</v-icon>
        </v-btn>
        <v-btn icon class="filter-btn" @click="openFilterDialog">
          <v-icon>mdi-filter</v-icon>
        </v-btn> -->
      </div>

      <!-- Table -->
      <v-data-table :headers="headers" :items="organizationData" class="custom-table" density="comfortable"
        hide-default-footer :loading="loading">
        <!-- Loading Slot -->
        <template v-slot:loading>
          <div class="d-flex justify-center pa-4">
            <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
          </div>
        </template>
      </v-data-table>


      <!-- Pagination -->
      <div class="pagination-container">
        <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchMembershipData" />
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import api from "@/plugins/axios";

const props = defineProps({
  showFilters: { type: Boolean, default: true }
});

// State
const search = ref("");
const organizationData = ref<any[]>([]);
const totalOrganizations = ref(0);
const menu = ref(false);
const view = ref("View");
const viewOptions = ["View", "Detailed"];

const dates = ref<string[]>([]);
const formattedDate = ref("");

// Pagination
const page = ref(1);
const itemsPerPage = ref(10);
const pageCount = ref(0);
const sortType = ref(null);


// Headers
const headers = [
  { title: "Organization", key: "legal_name" },
  { title: "Admin", key: "admin_name" },
  { title: "Monthly Revenue", key: "monthly_revenue" },
  { title: "Next Payment", key: "next_payment" },
  { title: "YTD Revenue", key: "ytd_revenue" },
  { title: "Lifetime Revenue", key: "lifetime_revenue" }
];

// Format date
const updateFormattedDate = () => {
  if (dates.value.length === 2) {
    formattedDate.value = `${dates.value[0]} - ${dates.value[1]}`;
  } else if (dates.value.length === 1) {
    formattedDate.value = dates.value[0];
  } else {
    formattedDate.value = "";
  }
};

const applyDateFilter = () => {
  menu.value = false;
  console.log("Selected Date Range:", dates.value);
  // You can trigger API filter here
};


watch(search, () => {
  page.value = 1; // Reset to first page on new search
  fetchMembershipData();
});

// Fetch data with pagination
const loading = ref(false);

// Fetch data with spinner
const fetchMembershipData = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/report/membership`, {
      params: {
        page: page.value,
        search: search.value,
        sort: sortType.value 
      }
    });

    if (response.data.success) {
      const result = response.data.data;
      organizationData.value = result.data;
      totalOrganizations.value = result.total;
      itemsPerPage.value = result.per_page;
      pageCount.value = result.last_page;
      page.value = result.current_page;
    }
  } catch (error) {
    console.error("Failed to fetch organization data:", error);
  } finally {
    loading.value = false;
  }
};




// Filtered data (for local search)
const filteredOrganizations = computed(() => {
  if (!search.value) return organizationData.value;
  const term = search.value.toLowerCase();
  return organizationData.value.filter(
    (org) =>
      org.legal_name.toLowerCase().includes(term) ||
      org.admin_name.toLowerCase().includes(term)
  );
});

const openFilterDialog = () => {
  console.log("Open filter dialog");
};

// On Mounted
onMounted(() => {
  fetchMembershipData();
});
</script>

<style scoped>
.header-section {
  display: flex;
  margin-bottom: 30px;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.filter-btn {
  border: 1px solid #D5D6DA;
  height: 50px;
  width: 50px;
  color: #525454;
  border-radius: 10px;
}

.search-bar,
.date-picker,
.view-select {
  max-width: 220px;
}

.custom-table {
  background: white;
  width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}


/* Add bottom border to every row */
.custom-table .v-table__wrapper table tbody tr>td {
  border-bottom: 1px solid #EDEEF2 !important;
}

/* Add divider under table header as well */
.custom-table .v-table__wrapper table thead tr>th {
  border-bottom: 1px solid #EDEEF2 !important;
}

/* Ensure styles penetrate Vuetify component internals */
:deep(.custom-table .v-table__wrapper table) {
  border-collapse: collapse;
}

:deep(.custom-table .v-table__wrapper table tbody tr > td) {
  border-bottom: 1px solid #EDEEF2 !important;
  padding: 12px 16px;
}

:deep(.custom-table .v-table__wrapper table thead tr > th) {
  border-bottom: 1px solid #EDEEF2 !important;
  padding: 12px 16px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
</style>
