<template>
  <v-container>
    <div style="background-color: white; padding: 10px; border-radius: 8px;">

      <!-- Header + Filters -->
      <div class="header-section">
        <h1 class="title">Draft Events ({{ totalEvents }})</h1>

      </div>
      <div class="filters">
        <!-- Search -->
        <v-text-field v-model="search" label="Search by Event Name" prepend-inner-icon="mdi-magnify" clearable dense
          variant="outlined" hide-details style="min-width: 200px;" />

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
        <v-select v-model="view" :items="viewOptions" dense variant="outlined" hide-details
          prepend-inner-icon="mdi-view-list" style="min-width: 150px;" />

        <!-- Filter Button -->
        <!-- <v-btn icon class="filter-btn" @click="openFilterDialog">
          <v-icon>mdi-filter-variant</v-icon>
        </v-btn> -->
        <!-- Sort -->
        <v-select v-model="sortType" :items="[
          { title: 'A → Z', value: 1 },
          { title: 'Z → A', value: 2 },
          { title: 'Low → High Price', value: 3 },
          { title: 'High → Low Price', value: 4 }
        ]" dense variant="outlined" hide-details style="min-width: 200px;" label="Sort By"
          @update:model-value="fetchDraftEvents" />

      </div>

      <!-- Events Table -->
      <v-data-table :headers="headers" :items="eventsData" class="custom-table" density="comfortable"
        hide-default-footer :loading="loading">
        <!-- Loading Spinner -->
        <template v-slot:loading>
          <div class="d-flex justify-center pa-4">
            <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
          </div>
        </template>

        <template #item.price="{ item }">
          ${{ item.price }}
        </template>
        <template #item.tickets_sold="{ item }">
          {{ item.tickets_sold }}
        </template>
        <template #item.event_type="{ item }">
          {{ item.event_type || "N/A" }}
        </template>
        <template #item.venue="{ item }">
          {{ item.venue || "N/A" }}
        </template>
      </v-data-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchDraftEvents" />
      </div>
    </div>
  </v-container>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import api from "@/plugins/axios";

// --- State ---
const search = ref("");
const sortType = ref(null);
const eventsData = ref<any[]>([]);
const totalEvents = ref(0);

// --- Date Picker ---
const menu = ref(false);
const dates = ref<string[]>([]);
const formattedDate = ref("");
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
  page.value = 1;
  fetchDraftEvents();
};

// --- View Switch ---
const view = ref("View");
const viewOptions = ["View", "Detailed"];


// --- Filter Dialog ---
const openFilterDialog = () => console.log("Open filter dialog");

// --- Table headers ---
const headers = [
  { title: "Event", key: "name" },
  { title: "Start Date", key: "start_date" },
  { title: "End Date", key: "end_date" },
  { title: "Venue", key: "venue" },
  { title: "Event Type", key: "event_type" },
  { title: "Price", key: "price" },
  { title: "Tickets Sold", key: "tickets_sold" },
];

// --- Pagination ---
const page = ref(1);
const itemsPerPage = ref(10);
const pageCount = ref(0);

// --- Fetch Draft Events (Server-side Pagination) ---
const loading = ref(false);

// Fetch Draft Events (Server-side Pagination)
const fetchDraftEvents = async () => {
  loading.value = true; // Show spinner
  try {
    const params: any = {
      page: page.value,
      per_page: itemsPerPage.value,
      sort: sortType.value
    };


    if (search.value) params.search = search.value;

    if (dates.value.length > 0) {
      params.start_date = dates.value[0];
      params.end_date = dates.value[1] || dates.value[0];
    }

    const response = await api.get(`/events/draft`, { params });
    if (response.data.status) {
      const result = response.data.data.events;
      eventsData.value = result.data;
      totalEvents.value = result.total;
      itemsPerPage.value = result.per_page;
      pageCount.value = result.last_page;
      page.value = result.current_page;
    }
  } catch (error) {
    console.error("Failed to fetch draft events:", error);
  } finally {
    loading.value = false; // Hide spinner
  }
};

// --- Watch search ---
watch(search, () => {
  page.value = 1;
  fetchDraftEvents();
});

// --- On mounted ---
onMounted(() => fetchDraftEvents());
</script>
<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
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

.title {
  font-size: 24px;
  font-weight: bold;
}

.filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.custom-table {
  background: white;
  border-radius: 8px;
  margin-top: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.filter-btn {
  border: 1px solid #D5D6DA;
  height: 50px;
  width: 50px;
  color: #525454;
  border-radius: 10px;
}
</style>
