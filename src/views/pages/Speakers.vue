<template>
    <v-container>
        <div class="table-wrapper" style="background: white; border-radius: 8px; padding: 16px">

            <!-- Header -->
            <div class="header-section d-flex justify-space-between align-center flex-wrap mb-4">
                <h5 class="title h3 mb-2 mb-md-0">All Speakers ({{ totalSpeakers }})</h5>

                <div class="d-flex gap-3 flex-wrap">
                    <!-- Search -->
                    <v-text-field v-model="search" placeholder="Search Speakers" density="compact" variant="outlined"
                        hide-details clearable append-inner-icon="mdi-magnify" class="search-bar" />

                    <!-- Sort Menu -->
                    <v-menu v-model="sortMenu" offset-y>
                        <template #activator="{ props }">
                            <v-btn v-bind="props" variant="outlined" class="d-flex align-center gap-2">
                                <v-icon>mdi-sort</v-icon> Sort
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item v-for="option in sortOptions" :key="option.value"
                                @click="applySort(option.value)">
                                <v-list-item-title>{{ option.label }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </div>

            <!-- Loader -->
            <!-- Loader -->

            <div v-if="loading" class="loader-wrapper">
                <v-progress-circular indeterminate color="primary" size="48" />
            </div>
            <!-- Speakers Table -->
            <div v-else class="overflow-x-auto">
                <v-data-table :headers="headers" :items="filteredSpeakers" hide-default-footer class="custom-table"
                    density="comfortable" @click:row="goToSpeakerDetailFromRow">
                    <template #item.full_name="{ item }">
                        <div class="d-flex align-center gap-3" style="cursor: pointer">
                            <strong>{{ item.full_name }}</strong>
                        </div>
                    </template>

                    <template #item.events="{ item }">{{ item.events }} Events</template>
                </v-data-table>
            </div>


            <!-- Pagination -->
            <div class="d-flex justify-center mt-4" v-if="pageCount > 1">
                <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchSpeakers" />
            </div>
        </div>
    </v-container>
</template>

<script setup>
import CryptoJS from "crypto-js";
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/plugins/axios';
import { useRouter } from 'vue-router';

const loading = ref(false);
const search = ref('');
const speakers = ref([]);
const totalSpeakers = ref(0);
const page = ref(1);
const pageCount = ref(0);
const sortMenu = ref(false);
const currentSort = ref('');
const router = useRouter();

const sortOptions = [
    { label: 'Most Events Attended', value: 'desc_events' },
    { label: 'Fewer Events Attended', value: 'asc_events' },
    { label: 'A-Z', value: 'az' },
    { label: 'Z-A', value: 'za' }
];

const headers = [
    { title: 'Full Name', key: 'full_name' },
    { title: 'Email', key: 'email' },
    { title: 'Phone', key: 'phone' },
    { title: 'Event Spoken', key: 'events' }
];

// Fetch Speakers API
const fetchSpeakers = async () => {
    loading.value = true;
    try {
        const userString = localStorage.getItem('user');
        const orgId = localStorage.getItem('organization_id');
        const user = userString ? JSON.parse(userString) : null;
        const role = localStorage.getItem('role');
        const response = await api.get(`/speakers/list/${role === "super_admin" ? orgId : user.organization_id}`, {
            params: {
                page: page.value,
                search: search.value || '',
                sort: currentSort.value
            }
        });

        if (response.data.success) {
            const result = response.data.data;
            speakers.value = result.data.map(sp => ({
                id: sp.id,
                full_name: sp.name,
                email: sp.email,
                phone: sp.phone,
                events: sp.events_count
            }));
            totalSpeakers.value = result.total;
            pageCount.value = result.last_page;
        } else {
            speakers.value = [];
            totalSpeakers.value = 0;
        }
    } catch (error) {
        console.error('Failed to fetch speakers:', error);
    } finally {
        loading.value = false;
    }
};

const goToSpeakerDetail = (id) => {
    const encryptedId = CryptoJS.AES.encrypt(id.toString(), import.meta.env.VITE_SECRET_KEY).toString();
    const encodedId = encodeURIComponent(encryptedId);
    router.push({ name: 'SpeakerDetail', params: { id: encodedId } });
};

const goToSpeakerDetailFromRow = (event, item) => {
    goToSpeakerDetail(item.item.id);
};

const filteredSpeakers = computed(() => {
    if (!search.value) return speakers.value;
    const q = search.value.toLowerCase();
    return speakers.value.filter(s =>
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q)
    );
});
const applySort = (value) => {
    currentSort.value = value;
    fetchSpeakers();
};

onMounted(fetchSpeakers);
watch(page, fetchSpeakers);
watch(search, () => { page.value = 1; fetchSpeakers(); });
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
