<template>
    <v-container>
        <div style="background: white; border-radius: 8px">
            <!-- Header -->
            <div class="header-section d-flex justify-space-between align-center pa-4">
                <h5 class="title h3">All Sponsors ({{ totalSponsors }})</h5>

                <div class="d-flex gap-3">
                    <!-- Search -->
                    <v-text-field
                        v-model="search"
                        placeholder="Search Sponsors"
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

            <!-- Sponsors Table -->
            <v-data-table
                v-else
                :headers="headers"
                :items="filteredSponsors"
                hide-default-footer
                class="custom-table"
                density="comfortable"
            >
                <!-- Business Name with Logo -->
                <template #item.business_name="{ item }">
                    <div class="d-flex align-center gap-3">
                        <v-avatar size="36">
                            <img :src="item.logo || '/placeholder.png'" alt="" />
                        </v-avatar>
                        <strong>{{ item.business_name }}</strong>
                    </div>
                </template>

                <!-- Link column -->
                <template #item.link="{ item }">
                    <a :href="item.link" target="_blank">{{ item.link }}</a>
                </template>

                <!-- Events count -->
                <template #item.events_count="{ item }"> {{ item.events_count }} Events </template>

                <!-- Action button -->
                <template #item.action="{ item }">
                    <v-btn icon @click="viewSponsor(item)">
                        <v-icon>mdi-open-in-new</v-icon>
                    </v-btn>
                </template>
            </v-data-table>

            <!-- Pagination -->
            <div class="d-flex justify-center mt-4">
                <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchSponsors" />
            </div>
        </div>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/plugins/axios';

const loading = ref(false);
const search = ref('');
const sponsors = ref([]);
const totalSponsors = ref(0);
const page = ref(1);
const pageCount = ref(0);

const sortMenu = ref(false);
const currentSort = ref('');

const sortOptions = [
    { label: 'A-Z', value: 'az' },
    { label: 'Z-A', value: 'za' }
];

// columns to display
const headers = [
    { title: 'Business Name', key: 'business_name' },
    { title: 'Link', key: 'link' },
    { title: 'Events Count', key: 'events_count' },
    { title: 'Action', key: 'action', sortable: false }
];

// Fetch Sponsors API
const fetchSponsors = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/sponsors/list`, {
            headers: {
                Authorization: 'Bearer 490|30hpCbiSxjzxHFSWILINnETeZldNxcM5WYEssm4b32ad1a95'
            },
            params: {
                page: page.value,
                search: search.value || '',
                sort: currentSort.value
            }
        });

        // based on provided JSON
        if (response.data.success) {
            const result = response.data.data;
            sponsors.value = result.data;
            totalSponsors.value = result.total;
            pageCount.value = result.last_page;
        } else {
            sponsors.value = [];
            totalSponsors.value = 0;
        }
    } catch (error) {
        console.error('Failed to fetch sponsors:', error);
    } finally {
        loading.value = false;
    }
};

// Client-side search
const filteredSponsors = computed(() => {
    if (!search.value) return sponsors.value;
    const q = search.value.toLowerCase();
    return sponsors.value.filter((s) => s.business_name.toLowerCase().includes(q) || (s.link && s.link.toLowerCase().includes(q)));
});

const applySort = (value) => {
    currentSort.value = value;
    fetchSponsors();
};

const viewSponsor = (item) => {
    // handle action click (e.g., open modal)
    window.open(item.link, '_blank');
};

onMounted(fetchSponsors);
watch(page, fetchSponsors);
watch(search, () => {
    page.value = 1;
    fetchSponsors();
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
