<template>
  <v-container>
    <div style="background-color: white; padding: 10px; border-radius: 8px;">

      <!-- Header Section -->
      <div class="header-section">
        <!-- Title -->
        <h1 class="title">
          Total Revenue ({{ totalOrganizations }})
        </h1>

        <!-- Filters Section -->
        <div class="filters d-flex align-center">
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

          <!-- Filter Buttons -->
          <v-btn icon class="filter-btn" @click="openFilterDialog">
            <v-icon>mdi-filter-variant</v-icon>
          </v-btn>
          <v-btn icon class="filter-btn" @click="openFilterDialog">
            <v-icon>mdi-filter</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Table -->
      <v-data-table :headers="headers" :items="organizationData" class="custom-table" density="comfortable"
        hide-default-footer />

      <!-- Pagination -->
      <div class="pagination-container">
        <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchOrganizationData" />
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
const viewOptions = ["View","Detailed"];

const dates = ref<string[]>([]);
const formattedDate = ref("");

// Pagination
const page = ref(1);
const itemsPerPage = ref(10);
const pageCount = ref(0);

// Table headers for revenue
const headers = [
  { title: "Name", key: "legal_name" },
  { title: "Monthly Revenue", key: "monthly_revenue" },
  { title: "Monthly Projection", key: "monthly_projection" },
  { title: "YTD Revenue", key: "ytd_revenue" },
  { title: "Lifetime Revenue", key: "lifetime_revenue" }
];

// Update formatted date
const updateFormattedDate = () => {
  if (dates.value.length === 2) {
    formattedDate.value = `${dates.value[0]} - ${dates.value[1]}`;
  } else if (dates.value.length === 1) {
    formattedDate.value = dates.value[0];
  } else {
    formattedDate.value = "";
  }
};

// Apply date filter
const applyDateFilter = () => {
  menu.value = false;
  page.value = 1; // Reset to first page when filter applied
  fetchOrganizationData();
};

// Fetch organization data with pagination
const fetchOrganizationData = async () => {
  try {
    const params: any = {
      page: page.value,
      per_page: itemsPerPage.value
    };

    if (search.value) {
      params.search = search.value;
    }

    if (dates.value.length > 0) {
      params.start_date = dates.value[0];
      params.end_date = dates.value[1] || dates.value[0];
    }

    const response = await api.get("/report/organisation", { params });

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
  }
};

// Open filter dialog
const openFilterDialog = () => {
  console.log("Open filter dialog");
};

// Watch search input for live updates
watch(search, () => {
  page.value = 1;
  fetchOrganizationData();
});

// On Mounted
onMounted(() => {
  fetchOrganizationData();
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

.custom-table .v-data-table__wrapper tr td {
  border-bottom: 1px solid #EDEEF2;
}



/* Add bottom border to every row */
.custom-table .v-table__wrapper table tbody tr > td {
     border-bottom: 1px solid #EDEEF2 !important;
}

/* Add divider under table header as well */
.custom-table .v-table__wrapper table thead tr > th {
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

.custom-table .v-data-table__wrapper tr:last-child td {
  border-bottom: none;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
