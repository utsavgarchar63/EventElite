<template>
    <v-container>
        <div style="background: white; border-radius: 8px">
            <!-- Header -->
            <div class="header-section d-flex justify-space-between align-center pa-4">
                <h5 class="title h3">All Vendors ({{ totalVendors }})</h5>

                <div class="d-flex gap-3">
                    <!-- Search -->
                    <v-text-field v-model="search" placeholder="Search Vendors" density="compact" variant="outlined"
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
            <div v-if="loading" class="d-flex justify-center" style="height: 200px">
                <v-progress-circular indeterminate color="primary" size="48" class="my-auto" />
            </div>

            <!-- Vendors Table -->
            <v-data-table v-else :headers="headers" :items="filteredVendors" hide-default-footer class="custom-table"
                density="comfortable" @click:row="goToVendorDetail">
                <!-- Business Name with avatar -->
                <template #item.business_name="{ item }">
                    <div class="d-flex align-center gap-3">
                        <v-avatar size="36">
                            <img :src="item.logo ? baseURL + item.logo : '/placeholder.png'" alt="" />
                        </v-avatar>
                        <strong>{{ item.business_name }}</strong>
                    </div>
                </template>

                <template #item.action="{ item }">
                    <v-btn icon :href="item.business_link" target="_blank">
                        <v-icon>mdi-web</v-icon>
                    </v-btn>
                </template>
            </v-data-table>

            <!-- Pagination -->
            <div class="d-flex justify-center mt-4">
                <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchVendors" />
            </div>
        </div>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/plugins/axios'; // your axios instance
import { useRouter } from 'vue-router';
const router = useRouter();
const loading = ref(false);
const search = ref('');
const vendors = ref([]);
const totalVendors = ref(0);
const page = ref(1);
const pageCount = ref(0);

const sortMenu = ref(false);
const currentSort = ref('');

const sortOptions = [
    { label: 'A-Z', value: 'az' },
    { label: 'Z-A', value: 'za' }
];

const headers = [
    { title: 'Business Name', key: 'business_name' },
    { title: 'Location', key: 'location' },
    { title: 'Contact Name', key: 'contact_name' },
    { title: 'Email', key: 'email' },
    { title: 'Phone', key: 'phone' },
    { title: 'Action', key: 'action', sortable: false }
];

// Fetch Vendors API
const fetchVendors = async () => {
    loading.value = true;
    const userString = localStorage.getItem('user'); // get the string
    const user = userString ? JSON.parse(userString) : null;
    const org_id = localStorage.getItem('organization_id'); // get the string

    try {
        console.log(user.organization_id)
        const response = await api.get(`/vendors/list/${user.organization_id || org_id}`, {
            // params: {
            //     page: page.value,
            //     search: search.value || '',
            //     sort: currentSort.value
            // }
        });

        // Adjusted to your API response
        if (response.data.success) {
            const result = response.data.data; // main data object
            vendors.value = result.data; // array of vendors
            totalVendors.value = result.total; // total count
            pageCount.value = result.last_page; // total pages
        } else {
            vendors.value = [];
            totalVendors.value = 0;
        }
    } catch (error) {
        console.error('Failed to fetch vendors:', error);
    } finally {
        loading.value = false;
    }
};

const goToVendorDetail = (event, item) => {
    // item.item is the actual vendor data
    router.push({ name: 'VendorDetail', params: { id: item.item.id } });
};
// Client-side search
const filteredVendors = computed(() => {
    if (!search.value) return vendors.value;
    const q = search.value.toLowerCase();
    return vendors.value.filter(
        (v) =>
            v.business_name.toLowerCase().includes(q) ||
            v.contact_name.toLowerCase().includes(q) ||
            v.email.toLowerCase().includes(q) ||
            v.phone.includes(q)
    );
});

const applySort = (value) => {
    currentSort.value = value;
    fetchVendors();
};

const viewVendor = (item) => {
    // handle action click (go to website / open modal)
    console.log('Vendor clicked:', item);
};

onMounted(fetchVendors);
watch(page, fetchVendors);
watch(search, () => {
    page.value = 1;
    fetchVendors();
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
