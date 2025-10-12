<template>
  <v-container>
    <div style="background: white; border-radius: 8px">
      <!-- Header -->
      <div class="header-section pa-4">
        <v-row class="d-flex align-center" dense>
          <v-col cols="12" sm="6" class="d-flex align-center">
            <h5 class="title h3 mb-2 mb-sm-0">All Coordinators ({{ totalCoordinators }})</h5>
          </v-col>

          <v-col cols="12" sm="6" class="d-flex justify-end flex-wrap gap-2">
            <v-text-field
              v-model="search"
              placeholder="Search Coordinators"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              append-inner-icon="mdi-magnify"
              class="search-bar"
            />

            <v-menu v-model="sortMenu" offset-y>
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="outlined" class="d-flex align-center gap-2">
                  <v-icon>mdi-sort</v-icon> Sort
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="option in sortOptions"
                  :key="option.value"
                  @click="applySort(option.value)"
                >
                  <v-list-item-title>{{ option.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="loader-wrapper">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <!-- Coordinators Table -->
      <div v-else class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="filteredCoordinators"
          hide-default-footer
          class="custom-table"
          density="comfortable"
        >
          <!-- Coordinator Name -->
          <template #item.name="{ item }">
            <strong>{{ item.name }}</strong>
          </template>

          <!-- Events -->
          <template #item.events="{ item }">
            <div v-if="item.events.length" class="d-flex flex-wrap gap-2 py-2">
              <v-chip
                v-for="event in item.events"
                :key="event.id"
                size="small"
                color="primary"
                variant="outlined"
              >
                {{ event.event_name }}
              </v-chip>
            </div>
            <span v-else class="text-grey">No Events</span>
          </template>

          <!-- Created Date -->
          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </v-data-table>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/plugins/axios";

const loading = ref(false);
const search = ref("");
const coordinators = ref([]);
const totalCoordinators = ref(0);

const sortMenu = ref(false);
const currentSort = ref("");

const sortOptions = [
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
];

const headers = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Phone", key: "phone" },
  { title: "Events", key: "events" },
  { title: "Created At", key: "created_at" },
];

// ✅ Format date like "08 Oct 2025, 07:24 PM"
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Fetch Coordinators API
const fetchCoordinators = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("admin_token");
    const response = await api.get("/coordinators/list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status) {
      coordinators.value = response.data.data;
      totalCoordinators.value = response.data.data.length;
    }
  } catch (error) {
    console.error("Failed to fetch coordinators:", error);
  } finally {
    loading.value = false;
  }
};

// Search Filter
const filteredCoordinators = computed(() => {
  if (!search.value) return coordinators.value;
  const q = search.value.toLowerCase();
  return coordinators.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
  );
});

// Sort
const applySort = (value) => {
  currentSort.value = value;
  if (value === "az") {
    coordinators.value.sort((a, b) => a.name.localeCompare(b.name));
  } else if (value === "za") {
    coordinators.value.sort((a, b) => b.name.localeCompare(a.name));
  }
};

onMounted(fetchCoordinators);
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

.custom-table {
  background: white;
  width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}

::v-deep(.custom-table tbody tr:hover) {
  background-color: #e3e3e368 !important;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.table-wrapper {
  overflow-x: auto;
  width: 100%;
  padding-bottom: 8px;
}

.custom-table {
  min-width: 650px;
}

.loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}
</style>
