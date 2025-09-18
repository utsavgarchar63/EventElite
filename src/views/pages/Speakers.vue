<template>
    <v-container>
        <div style="background: white; border-radius: 8px">
            <!-- Header -->
            <div class="header-section d-flex justify-space-between align-center pa-4">
                <h5 class="title h3">All Speakers ({{ totalSpeakers }})</h5>

                <div class="d-flex gap-3">
                    <!-- Search -->
                    <v-text-field
                        v-model="search"
                        placeholder="Search Speakers"
                        density="compact"
                        variant="outlined"
                        hide-details
                        clearable
                        append-inner-icon="mdi-magnify"
                        class="search-bar"
                    />

                    <!-- Sort Menu -->
                    <v-menu v-model="sortMenu" offset-y>
                        <template #activator="{ props }">
                            <v-btn v-bind="props" variant="outlined" class="d-flex align-center gap-2">
                                <v-icon>mdi-sort</v-icon> Sort
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item v-for="option in sortOptions" :key="option.value" @click="applySort(option.value)">
                                <v-list-item-title>{{ option.label }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </div>

            <!-- Loader -->
            <div v-if="loading" class="d-flex justify-center" style="height: 200px">
                <v-progress-circular indeterminate color="primary" size="48" class="my-auto" />
            </div>

            <!-- Speakers Table -->
            <v-data-table
                v-else
                :headers="headers"
                :items="filteredSpeakers"
                hide-default-footer
                class="custom-table"
                density="comfortable"
                @click:row="goToSpeakerDetailFromRow"
            >
                <template #item.full_name="{ item }">
                    <div class="d-flex align-center gap-3" style="cursor: pointer">
                        <v-avatar size="36">
                            <v-icon>mdi-account</v-icon>
                        </v-avatar>
                        <strong>{{ item.full_name }}</strong>
                    </div>
                </template>

                <template #item.events="{ item }"> {{ item.events }} Events </template>
            </v-data-table>

            <!-- Pagination -->
            <div class="d-flex justify-center mt-4">
                <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchSpeakers" />
            </div>
        </div>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/plugins/axios'; // your axios instance
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
        const response = await api.get(`/speakers/list`, {
            params: {
                page: page.value,
                search: search.value || '',
                sort: currentSort.value
            }
        });

        if (response.data.success) {
            const result = response.data.data;

            // Map API data to your table fields
            speakers.value = result.data.map((sp) => ({
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
    router.push({ name: 'SpeakerDetail', params: { id } });
};

const goToSpeakerDetailFromRow = (event, item) => {
    // item.item = actual data row
    goToSpeakerDetail(item.item.id);
};

// Client-side search
const filteredSpeakers = computed(() => {
    if (!search.value) return speakers.value;
    const q = search.value.toLowerCase();
    return speakers.value.filter((s) => s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q));
});

const applySort = (value) => {
    currentSort.value = value;
    fetchSpeakers();
};

onMounted(fetchSpeakers);
watch(page, fetchSpeakers);
watch(search, () => {
    page.value = 1;
    fetchSpeakers();
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
</style>
