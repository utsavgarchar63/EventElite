<template>
    <v-container>
        <div style="background-color: white; border-radius: 8px">
            <!-- Header -->
            <div class="header-section">
                <div v-if="showFilters" class="filters">
                    <h5 class="title">{{ eventType }} Events ({{ totalEvents }} Events)</h5>

                    <!-- Search -->

                    <v-text-field
                        v-model="search"
                        placeholder="Search by Name, Venue"
                        variant="outlined"
                        hide-details
                        density="compact"
                        class="search-bar"
                        clearable
                        append-inner-icon="mdi-magnify"
                    />

                    <!-- Date Picker -->
                    <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y>
                        <template #activator="{ props }">
                            <v-text-field
                                class="date-picker"
                                v-bind="props"
                                v-model="formattedDate"
                                label="Select Date Range"
                                density="compact"
                                variant="outlined"
                                hide-details
                                readonly
                                prepend-inner-icon="mdi-calendar"
                            />
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
                    <v-select
                        v-model="view"
                        :items="viewOptions"
                        dense
                        variant="outlined"
                        hide-details
                        class="view-select"
                        density="compact"
                        prepend-inner-icon="mdi-view-list"
                    />

                    <!-- Filter Icon -->
                    <v-btn icon class="filter-btn" @click="openFilterDialog">
                        <v-icon>mdi-filter-variant</v-icon>
                    </v-btn>
                    <!-- Filter Icon with Dropdown -->
                    <v-menu v-model="filterMenu" offset-y :close-on-content-click="false">
                        <template #activator="{ props }">
                            <v-btn icon class="filter-btn" v-bind="props">
                                <v-icon>mdi-filter</v-icon>
                            </v-btn>
                        </template>

                        <v-card style="width: 350px; padding: 15px; border-radius: 10px !important">
                            <!-- Search Inside Dropdown -->
                            <v-text-field
                                v-model="filterSearch"
                                placeholder="Search fields"
                                variant="outlined"
                                density="compact"
                                clearable
                                prepend-inner-icon="mdi-magnify"
                            />

                            <!-- Checkboxes -->
                            <v-checkbox v-model="selectAll" label="Select All" color="primary" @change="toggleSelectAll" hide-details />

                            <v-checkbox
                                v-for="field in filterOptions"
                                :key="field.value"
                                v-model="selectedFilters"
                                :label="field.label"
                                :value="field.value"
                                :disabled="selectAll"
                                color="primary"
                                hide-details
                            />

                            <!-- Action Buttons -->
                            <div class="d-flex mt-3 gap-2">
                                <v-btn variant="outlined" class="w-50" color="primary" size="large" @click="clearFilters">Clear</v-btn>
                                <v-btn color="primary" class="w-50" size="large" @click="applyFilters">Filter</v-btn>
                            </div>
                        </v-card>
                    </v-menu>
                </div>
            </div>

            <!-- Loader -->
            <div v-if="loading" class="d-flex justify-center" style="height: 200px">
                <v-progress-circular indeterminate color="primary" size="48" class="my-auto"></v-progress-circular>
            </div>

            <!-- Event Table -->
            <v-data-table v-else :headers="headers" :items="filteredEvents" hide-default-footer class="custom-table" density="comfortable">
                <template #item.actions="{ item }">
                    <div class="action-wrapper">
                        <!-- Show Three Dot Button Only If Not Active -->
                        <v-icon color="#525454" v-if="!item.showActions" @click="toggleAction(item)">mdi-dots-horizontal</v-icon>

                        <!-- Show Action Icons If Active -->
                        <div v-else class="action-icons">
                            <v-icon color="primary" @click="shareEvent(item)">mdi-share-variant</v-icon>
                            <v-icon color="primary" @click="downloadEvent(item)">mdi-download</v-icon>
                            <v-icon color="primary" @click="openWebsite(item)">mdi-web</v-icon>
                        </div>
                    </div>
                </template>

                <template #item.name="{ item }">
                    <strong>{{ item.name }}</strong>
                </template>
                <template #item.price="{ item }"> ₹ {{ item.price }} </template>
            </v-data-table>

            <!-- Pagination -->
            <div class="d-flex justify-center mt-4">
                <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchEvents" />
            </div>
        </div>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/plugins/axios';

const props = defineProps({
    eventType: { type: String, required: true }, // upcoming, past, draft, cancelled
    showFilters: { type: Boolean, default: true }
});

let searchTimeout = null;
const loading = ref(false);
const search = ref('');
const events = ref([]);
const totalEvents = ref(0);
const page = ref(1);
const pageCount = ref(0);

const menu = ref(false);
const dates = ref([]);
const formattedDate = ref('');
const view = ref('View');
const viewOptions = ['List', 'Title'];
const filterMenu = ref(false);
const filterSearch = ref('');
const selectAll = ref(false);

const filterOptions = [
    { label: 'Event Name', value: 'name' },
    { label: 'Date', value: 'start_date' },
    { label: 'Location', value: 'venue' },
    { label: 'Event Type', value: 'event_type' },
    { label: 'Price', value: 'price' },
    { label: 'Tickets Sold', value: 'tickets_sold' }
];

const selectedFilters = ref([]);

const headers = [
    { title: 'Event Name', key: 'name' },
    { title: 'Start', key: 'start_date' },
    { title: 'Location', key: 'venue' },
    { title: 'Event Type', key: 'event_type' },
    { title: 'Price', key: 'price' },
    { title: 'Tickets Sold', key: 'tickets_sold' },
    { title: 'Actions', key: 'actions', sortable: false }
];

const toggleAction = (item) => {
    // Close other rows
    events.value.forEach((e) => (e.showActions = false));
    // Toggle the clicked one
    item.showActions = true;
};

const shareEvent = (item) => {
    console.log('Share event:', item.name);
};

const downloadEvent = (item) => {
    console.log('Download event:', item.name);
};

const openWebsite = (item) => {
    console.log('Open website for:', item.name);
};

// Fetch Events API
const fetchEvents = async () => {
    loading.value = true;
    try {
        const userString = localStorage.getItem('user'); // get the string
        const user = userString ? JSON.parse(userString) : null;
        const response = await api.get(`/events/${props.eventType}/${user.organization_id}`, {
            params: { page: page.value, search: search.value || '' }
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

// Select All logic
const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedFilters.value = filterOptions.map((f) => f.value);
    } else {
        selectedFilters.value = [];
    }
};

// Clear Filters
const clearFilters = () => {
    selectedFilters.value = [];
    selectAll.value = false;
    filterSearch.value = '';
};

// Apply Filters
const applyFilters = () => {
    console.log('Selected Filters:', selectedFilters.value);
    filterMenu.value = false;
};

// Filtered Events
const filteredEvents = computed(() => {
    if (!search.value) return events.value;
    const query = search.value.toLowerCase();
    return events.value.filter((e) => e.name.toLowerCase().includes(query) || e.venue.toLowerCase().includes(query));
});

// Date Formatting
const updateFormattedDate = () => {
    if (dates.value.length === 2) {
        formattedDate.value = `${dates.value[0]} - ${dates.value[1]}`;
    } else if (dates.value.length === 1) {
        formattedDate.value = dates.value[0];
    } else {
        formattedDate.value = '';
    }
};

// Apply Date Filter
const applyDateFilter = () => {
    menu.value = false;
    console.log('Selected Date Range:', dates.value);
    // Optionally call API with date range
};

// Filter Dialog
const openFilterDialog = () => {
    console.log('Open filter dialog');
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
    border: 1px solid #d5d6da;
    height: 40px;
    width: 40px;
    color: #525454;
    border-radius: 8px;
    transition:
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.filter-btn:focus,
.filter-btn.v-btn--active {
    border-color: #1976d2;
    /* Vuetify primary color */
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
}

.search-bar {
    background-color: #f4f4f4;
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

.action-wrapper {
    display: flex;
    align-items: center;
    position: relative;
}

.action-icons {
    display: flex;
    gap: 10px;
}

.filter-checkbox {
    margin: 0;
    /* Remove default spacing */
    padding: 0;
    /* Remove extra padding */
}

.v-input--checkbox {
    margin: 0 !important;
    padding: 0 !important;
}

.v-input__details {
    display: none;
    /* Hide hint/details section under checkboxes */
    min-height: 0px;
    padding-top: 0px;
}
</style>
