<template>
     <v-container>
          <div style="background-color: white; padding: 10px; border-radius: 8px;">

               <!-- Header -->
               <div class="header-section">
                    <!-- Title -->
                    <h1 class="title">
                         Organization List ({{ totalOrganizations }} Orgs)
                    </h1>


                    <!-- Filters Section (controlled by prop) -->
                    <div v-if="showFilters" class="filters d-flex align-center">
                         <!-- Search -->
                         <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" dense
                              variant="outlined" hide-details clearable class="responsive-input" />
                         <!-- Date Picker -->
                         <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y>
                              <template #activator="{ props }">
                                   <v-text-field v-bind="props" v-model="formattedDate" label="Select Date Range" dense
                                        variant="outlined" hide-details readonly prepend-inner-icon="mdi-calendar"
                                        style="min-width: 200px;" />
                              </template>

                              <v-card>
                                   <v-date-picker v-model="dates" range scrollable
                                        @update:model-value="updateFormattedDate" />
                                   <v-card-actions>
                                        <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                                        <v-btn text color="primary" @click="applyDateFilter">Apply</v-btn>
                                   </v-card-actions>
                              </v-card>
                         </v-menu>


                         <v-select v-model="view" :items="viewOptions" dense variant="outlined" hide-details
                              class="responsive-input" prepend-inner-icon="mdi-view-list" />

                         <!-- Filter Icon -->
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
                    hide-default-footer :loading="loading">
                    <!-- Loading Spinner -->
                    <template v-slot:loading>
                         <div class="d-flex justify-center pa-4">
                              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
                         </div>
                    </template>

                    <!-- Disable Switch -->
                    <template #item.is_disabled="{ item }">
                         <div class="custom-toggle-switch" @click="toggleDisable(item)">
                              <div class="toggle-track" :class="{ 'active': !item.is_disabled }">
                                   <div class="toggle-knob" :class="{ 'active': !item.is_disabled }"></div>
                              </div>
                         </div>
                    </template>
               </v-data-table>


               <!-- Pagination -->
               <div class="pagination-container">
                    <v-pagination v-model="page" :length="pageCount" total-visible="5"
                         @update:modelValue="fetchOrganizationData" />

               </div>

          </div>
     </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import api from "@/plugins/axios";

// Props
const props = defineProps({
     showFilters: { type: Boolean, default: true }
});

// State
const search = ref("");
const organizationData = ref<any[]>([]);
const totalOrganizations = ref(0);
const menu = ref(false);
const view = ref("View");
const page = ref(1);
const itemsPerPage = ref(10);
const pageCount = ref(0);
const viewOptions = ["View", "Detailed"];

const dates = ref<string[]>([]); // Use array for date range
const formattedDate = ref("");

// Format date string
const updateFormattedDate = () => {
     if (dates.value.length === 2) {
          formattedDate.value = `${dates.value[0]} - ${dates.value[1]}`;
     } else if (dates.value.length === 1) {
          formattedDate.value = dates.value[0];
     } else {
          formattedDate.value = "";
     }
};

// Apply date filter (you can send API request here)
const applyDateFilter = () => {
     menu.value = false;
     console.log("Selected Date Range:", dates.value);
};

// Headers
const headers = [
     { title: "Name", key: "legal_name" },
     { title: "Monthly Revenue", key: "monthly_revenue" },
     { title: "Monthly Projection", key: "monthly_projection" },
     { title: "YTD Revenue", key: "ytd_revenue" },
     { title: "Lifetime Revenue", key: "lifetime_revenue" }
];

watch(search, (newVal, oldVal) => {
     page.value = 1; // Reset to first page on new search
     fetchOrganizationData();
});

// Fetch Data with Pagination
const loading = ref(false);

const fetchOrganizationData = async () => {
     loading.value = true; // Show spinner
     try {
          const response = await api.get(
               `/report/organisation?page=${page.value}&search=${encodeURIComponent(search.value)}`
          );
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
          loading.value = false; // Hide spinner
     }
};

// Toggle Disable
const toggleDisable = async (item: any) => {
     try {
          // Toggle the value first
          item.is_disabled = !item.is_disabled;

          await api.patch(`/super-admin/organizations/${item.id}/status`, {
               is_disabled: item.is_disabled
          });
     } catch (error) {
          console.error("Failed to update disable status:", error);
          // Revert the change if API call fails
          item.is_disabled = !item.is_disabled;
     }
};

// Filter Dialog Action
const openFilterDialog = () => {
     console.log("Open filter dialog");
};

// On Mounted
onMounted(() => {
     fetchOrganizationData();
});
</script>

<style scoped>
.header-section {
     display: flex;
     flex-wrap: wrap;
     margin-bottom: 30px;
     justify-content: space-between;
     align-items: center;
     gap: 12px;
}

.title {
     font-size: 20px;
     font-weight: bold;
     flex: 1 1 100%;
     /* take full width on small screens */
     margin-bottom: 10px;
     /* spacing below title on mobile */
}

.filters {
     display: flex;
     flex-wrap: wrap;
     /* wrap filters if needed */
     gap: 12px;
     align-items: center;
     justify-content: flex-end;
     flex: 1 1 100%;
     /* full width on mobile */
}

.filter-btn {
     border: 1px solid #D5D6DA;
     height: 50px;
     width: 50px;
     color: #525454;
     border-radius: 10px;
     flex-shrink: 0;
}

.search-bar,
.date-picker,
.view-select {
     max-width: 220px;
}

.responsive-input {
     min-width: 150px;
     max-width: 100%;
     /* make sure it shrinks on mobile */
     flex: 1 1 auto;
     /* allow flex growth/shrink */
}


.custom-table {
     background: white;
     width: 100%;
     border-radius: 8px;
     margin-top: 10px;
}

.custom-table .v-table__wrapper {

     border: 1px solid black !important;
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

/* Custom Toggle Switch Styles */
.custom-toggle-switch {
     cursor: pointer;
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

.small-switch .v-input--selection-controls__ripple {
     width: 36px;
     height: 20px;
}

.small-switch .v-input--selection-controls__input {
     transform: scale(0.8);
}

.custom-switch {
     transform: scale(0.8);
}

/* Default track color (inactive) */
.custom-switch .v-switch__track {
     background-color: rgba(42, 133, 255, 0.2);
     /* light blue track */
}

/* Active state: exact color */
.custom-switch input:checked+.v-switch__track {
     background-color: rgba(42, 133, 255, 0.3);
     /* low opacity track when active */
}

/* Active thumb color: solid primary */
.custom-switch input:checked+.v-switch__track .v-switch__thumb {
     background-color: rgb(42, 133, 255);
}

.pagination-container {
     display: flex;
     justify-content: center;
     margin-top: 20px;
}
</style>
