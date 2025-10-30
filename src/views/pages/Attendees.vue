<template>
    <v-container>
        <div style="background: white; border-radius: 8px">
            <!-- Header -->
            <div class="header-section d-flex justify-space-between align-center pa-4">
                <h5 class="title h3">All Attendees ({{ totalAttendees }})</h5>

                <div class="d-flex gap-3">
                    <!-- Search -->
                    <v-text-field v-model="search" placeholder="Search Attendees" density="compact" variant="outlined"
                        hide-details clearable append-inner-icon="mdi-magnify" class="search-bar" />

                    <!-- Sort Dropdown -->
                    <v-select v-model="sortType" :items="[
                        { title: 'A → Z', value: 1 },
                        { title: 'Z → A', value: 2 },
                        { title: 'Low → High Spend', value: 3 },
                        { title: 'High → Low Spend', value: 4 }
                    ]" density="compact" label="Sort By" variant="outlined" hide-details style="width:180px"
                        @update:model-value="fetchAttendees" />
                </div>

            </div>

            <!-- Loader -->
            <div v-if="loading" class="d-flex justify-center" style="height: 200px">
                <v-progress-circular indeterminate color="primary" size="48" class="my-auto" />
            </div>

            <!-- Attendees Table -->
            <v-data-table v-else :headers="headers" :items="filteredAttendees" hide-default-footer class="custom-table"
                density="comfortable" @click:row="goToAttendeeDetailFromRow">
                <template #item.events_attended="{ item }"> {{ item.events_attended }} Events </template>
                <template #item.total_spend="{ item }"> ${{ item.total_spend }} </template>
            </v-data-table>

            <!-- Pagination -->
            <div class="d-flex justify-center mt-4">
                <v-pagination v-model="page" :length="pageCount" total-visible="5"
                    @update:modelValue="fetchAttendees" />
            </div>
        </div>
    </v-container>
</template>

<script setup>
import CryptoJS from 'crypto-js';
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/plugins/axios';
import { useSnackbarStore } from '@/store/snackbar';
import { useRouter } from 'vue-router';
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

const router = useRouter();
const snackbar = useSnackbarStore();

const loading = ref(false);
const search = ref('');
const sortType = ref(null);
const attendees = ref([]);
const totalAttendees = ref(0);
const page = ref(1);
const pageCount = ref(0);

// columns to display
const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Email', key: 'email' },
    { title: 'Phone', key: 'phone' },
    { title: 'Events Attended', key: 'events_attended' },
    { title: 'Total Spend', key: 'total_spend' }
];

// Fetch Attendees API
const fetchAttendees = async () => {
    loading.value = true;
    const userString = localStorage.getItem('user'); // get the string
    const org_id = localStorage.getItem('organization_id'); // get the string
    const user = userString ? JSON.parse(userString) : null;

    try {
        const response = await api.get(`/attendees/list/${user.organization_id || org_id}`, {
            params: {
                page: page.value,
                search: search.value || '',
                sort: sortType.value || null
            }
        });


        if (response.data.success) {
            const result = response.data.data;
            attendees.value = result.data;
            totalAttendees.value = result.total;
            pageCount.value = result.last_page;
        } else {
            attendees.value = [];
            totalAttendees.value = 0;
        }
    } catch (err) {
        if (err.response?.data?.errors) {
            const apiErrors = err.response.data.errors;
            const messages = Object.values(apiErrors).flat().join('\n');
            snackbar.show(messages, 'error');
        } else {
            snackbar.show('Something went wrong', 'error');
        }
    } finally {
        loading.value = false;
    }
};

// Client-side search
const filteredAttendees = computed(() => {
    if (!search.value) return attendees.value;
    const q = search.value.toLowerCase();
    return attendees.value.filter(
        (a) =>
            a.name.toLowerCase().includes(q) ||
            (a.email && a.email.toLowerCase().includes(q)) ||
            (a.phone && a.phone.toLowerCase().includes(q))
    );
});

// Navigate to attendee detail page
const goToAttendeeDetail = (id) => {
    // Encrypt the ID
    const encryptedId = CryptoJS.AES.encrypt(id.toString(), SECRET_KEY).toString();
    // Encode for safe URL usage
    const encoded = encodeURIComponent(encryptedId);

    router.push({ name: 'AttendeeDetail', params: { id: encoded } });
};

const goToAttendeeDetailFromRow = (event, item) => {
    goToAttendeeDetail(item.item.id);
};

onMounted(fetchAttendees);
watch(page, fetchAttendees);
watch(search, () => {
    page.value = 1;
    if (!search.value) sortType.value = null;
    fetchAttendees();
});
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
    /* light blue */
    cursor: pointer;
    transition: background-color 0.3s ease;
}
</style>
