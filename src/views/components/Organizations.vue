<template>
     <v-container>
          <div style="background-color: white; padding: 10px; border-radius: 8px;">

               <!-- Header -->
               <div class="header-section">
                    <!-- Title -->


                    <!-- Filters Section (controlled by prop) -->
                    <div v-if="showFilters" class="filters">
                         <h5 class="title">
                              Organization List ({{ totalOrganizations }} Orgs)
                         </h5>
                         <!-- Search -->
                         <v-text-field v-model="search" label="Search by Name, Email, Phone, Address"
                              prepend-inner-icon="mdi-magnify" dense variant="outlined" hide-details clearable
                              class="search-bar" />
                         <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y>
                              <template #activator="{ props }">
                                   <v-text-field class="date-picker" v-bind="props" v-model="formattedDate"
                                        label="Select Date Range" dense variant="outlined" hide-details readonly
                                        prepend-inner-icon="mdi-calendar" />
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
                              class="view-select" prepend-inner-icon="mdi-view-list" />

                         <!-- Filter Icon -->
                         <v-btn icon class="filter-btn" @click="openFilterDialog">
                              <v-icon>mdi-filter-variant</v-icon>
                         </v-btn>
                         <v-btn icon class="filter-btn" @click="openFilterDialog">
                              <v-icon>mdi-filter</v-icon>
                         </v-btn>
                    </div>

               </div>
               <!-- Spinner --><!-- Show loader full width when loading -->
               <div v-if="loading" class="spinner-container" style="height: 300px;">
                    <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
               </div>

               <!-- Show table only when data is ready -->
               <v-data-table v-else :headers="headers" :items="filteredOrganizations" class="custom-table"
                    density="comfortable" hide-default-footer @click:row="goToAdminDashboard">
                    <!-- Disable Switch -->
                    <template #item.is_disabled="{ item }">
                         <div class="custom-toggle-switch" @click.stop="toggleDisable(item)">
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
import { router } from "@/router";

// Props
const props = defineProps({
     showFilters: { type: Boolean, default: true }
});
let searchTimeout: any = null;
// State
const loading = ref(false);
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
watch(search, () => {
     page.value = 1;
     if (searchTimeout) clearTimeout(searchTimeout);
     searchTimeout = setTimeout(() => {
          fetchOrganizationData();
     }, 500);
});
watch(search, (newValue) => {
     // Add a debounce to avoid multiple API calls on every keystroke
     if (searchTimeout) clearTimeout(searchTimeout);
     searchTimeout = setTimeout(() => {
          fetchOrganizationData(); // Call API after delay
     }, 500); // 500ms debounce
});
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

const goToAdminDashboard = (_event: any, { item }: { item: any }) => {
     router.push({ name: 'AdminDashboardDetail', params: { id: item.id } });
};

watch(search, () => {
     page.value = 1; // reset to first page on new search
     fetchOrganizationData();
});

const filteredOrganizations = computed(() => {
     if (!search.value) return organizationData.value;
     const query = search.value.toLowerCase();

     return organizationData.value.filter(org =>
          org.legal_name.toLowerCase().includes(query) ||
          org.email.toLowerCase().includes(query) ||
          org.phone?.toLowerCase().includes(query) ||
          org.address?.toLowerCase().includes(query)
     );
});


// Apply date filter (you can send API request here)
const applyDateFilter = () => {
     menu.value = false;
     console.log("Selected Date Range:", dates.value);
};

// Headers
const headers = [
     { title: "Name", key: "legal_name" },
     { title: "Email", key: "email" },
     { title: "Phone Number", key: "phone" },
     { title: "Location", key: "address" },
     { title: "Created At", key: "created_at" },
     { title: "Admin", key: "number_of_admins" },
     { title: "Disable", key: "is_disabled" }
];

// Fetch Data with Pagination
const fetchOrganizationData = async () => {
     loading.value = true;
     try {
          const response = await api.get(`/dashboard/organisation-info`, {
               params: {
                    page: page.value,
                    search: search.value || ""
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


// Toggle Disable
const toggleDisable = async (item: any) => {
     const previousState = item.is_disabled;
     item.is_disabled = !previousState;

     try {
          await api.patch(`/super-admin/organizations/${item.id}/status`, {
               is_disabled: item.is_disabled
          });
     } catch (error) {
          console.error("Failed to update disable status:", error);
          item.is_disabled = previousState; // revert on error
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
     /* display: flex;
     margin-bottom: 30px;
     /* justify-content: space-between;
     align-items: center; */
     gap: 12px;
}

.title {
     font-size: 18px;
     font-weight: 900;
     width: 90%;
     /* take full width on small screens */
     margin-bottom: 10px;
     /* spacing below title on mobile */
}

.filters {
     display: flex;
     padding: 10px;
     gap: 12px;
     align-items: center;
     justify-content: end;
}

@media (max-width: 1024px) {
     .filters {
          flex-wrap: wrap;
          justify-content: flex-start;
          /* Optional: aligns items to the left when wrapped */
     }
}

.filter-btn {
     border: 1px solid #D5D6DA;
     height: 50px;
     width: 50px;
     color: #525454;
     border-radius: 10px;
     flex-shrink: 0;
}

.search-bar {
     width: 500px;
}

/* .date-picker,
.view-select  */
.date-picker {
     width: 500px;
}

.view-select {
     width: 400px;
}

/* .responsive-input { */
/* min-width: 150px;
     max-width: 100%; */
/* make sure it shrinks on mobile */
/* flex: 1 1 auto; */
/* allow flex growth/shrink */
/* } */


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

.spinner-container {
     display: flex;
     justify-content: center;
     align-items: center;
     margin-top: 20px;
}
</style>
