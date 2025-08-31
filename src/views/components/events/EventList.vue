<template>
  <v-container>
    <div style="background-color:white;  border-radius: 8px;">
      <!-- Header -->
      <div class="header-section">
        <div v-if="showFilters" class="filters">
          <h5 class="title">{{ eventType }} Events ({{ totalEvents }} Events)</h5>

          <!-- Search -->

          <v-text-field v-model="search" placeholder="Search by Name, Venue" variant="outlined" hide-details density="compact"
            class="search-bar" clearable append-inner-icon="mdi-magnify" />

          <!-- Date Picker -->
          <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y>
            <template #activator="{ props }">
              <v-text-field class="date-picker" v-bind="props" v-model="formattedDate" label="Select Date Range" density="compact"
                variant="outlined" hide-details readonly prepend-inner-icon="mdi-calendar" />
            </template>
            <v-card>
              <v-date-picker v-model="dates" range scrollable @update:model-value="updateFormattedDate" />
              <v-card-actions>
                <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                <v-btn text color="primary" @click="applyDateFilter">Apply</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>

          <!-- View Options -->
          <v-select v-model="view" :items="viewOptions" dense variant="outlined" hide-details class="view-select"
          density="compact"  prepend-inner-icon="mdi-view-list" />

          <!-- Filter Icon -->
          <v-btn icon class="filter-btn" @click="openFilterDialog" >
            <v-icon>mdi-filter-variant</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="d-flex justify-center" style="height: 200px;">
        <v-progress-circular indeterminate color="primary" size="48" class="my-auto"></v-progress-circular>
      </div>

      <!-- Event Table -->
      <v-data-table v-else :headers="headers" :items="filteredEvents" hide-default-footer class="custom-table"
        density="comfortable">
        <template #item.name="{ item }">
          <strong>{{ item.name }}</strong>
        </template>
        <template #item.price="{ item }">
          ₹ {{ item.price }}
        </template>
      </v-data-table>

      <!-- Pagination -->
      <div class="d-flex justify-center mt-4">
        <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchEvents" />
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/plugins/axios";

const props = defineProps({
  eventType: { type: String, required: true }, // upcoming, past, draft, cancelled
  showFilters: { type: Boolean, default: true }
});

let searchTimeout = null;
const loading = ref(false);
const search = ref("");
const events = ref([]);
const totalEvents = ref(0);
const page = ref(1);
const pageCount = ref(0);

const menu = ref(false);
const dates = ref([]);
const formattedDate = ref("");
const view = ref("View");
const viewOptions = ["View", "Detailed"];

const headers = [
  { title: "Event Name", key: "name" },
  { title: "Start", key: "start_date" },
  { title: "Location", key: "venue" },
  { title: "Event Type", key: "event_type" },
  { title: "Price", key: "price" },
  { title: "Tickets Sold", key: "tickets_sold" }
];

// Fetch Events API
const fetchEvents = async () => {
  loading.value = true;
  try {
    const response = await api.get(`/events/${props.eventType}/1`, {
      params: { page: page.value, search: search.value || "" },
      headers: {
        Authorization: `Bearer 1|FgE8nuaWr69aweoiXfR7j1lsKwaLgMm0kpPdrqZXcdb1c2ff`
      }
    });

    if (response.data.status) {
      const result = response.data.data.events;
      events.value = result.data;
      totalEvents.value = result.total;
      pageCount.value = result.last_page;
    }
  } catch (error) {
    console.error(`Failed to fetch ${props.eventType} events:`, error);
  } finally {
    loading.value = false;
  }
};

// Debounce Search
watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchEvents();
  }, 500);
});

// Filtered Events
const filteredEvents = computed(() => {
  if (!search.value) return events.value;
  const query = search.value.toLowerCase();
  return events.value.filter(e =>
    e.name.toLowerCase().includes(query) ||
    e.venue.toLowerCase().includes(query)
  );
});

// Date Formatting
const updateFormattedDate = () => {
  if (dates.value.length === 2) {
    formattedDate.value = `${dates.value[0]} - ${dates.value[1]}`;
  } else if (dates.value.length === 1) {
    formattedDate.value = dates.value[0];
  } else {
    formattedDate.value = "";
  }
};

// Apply Date Filter
const applyDateFilter = () => {
  menu.value = false;
  console.log("Selected Date Range:", dates.value);
  // Optionally call API with date range
};

// Filter Dialog
const openFilterDialog = () => {
  console.log("Open filter dialog");
};

onMounted(fetchEvents);
watch(page, fetchEvents);
</script>

<style scoped>
.title {
  text-transform: capitalize;
}

.filters {
  display: flex;
  /* padding: 10px; */
  gap: 12px;
  align-items: center;
  justify-content: end;
}

@media (max-width: 1024px) {
  .filters {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

.filter-btn {
  border: 1px solid #D5D6DA;
  height: 40px;
  width: 40px;
  color: #525454;
  border-radius: 8px;
}

.search-bar {
  background-color: #F4F4F4;
  border-radius: 8px;
  width: 300px;
}

.date-picker {
  width: 250px;
}

.view-select {
  width: 200px;
}

.custom-table {
  background: white;
  width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}
</style>
