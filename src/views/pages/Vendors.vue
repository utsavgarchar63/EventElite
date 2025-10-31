    <template>
        <v-container>
            <div style="background: white; border-radius: 8px">
                <!-- Header -->
                <div class="header-section pa-4">
                    <v-row class="d-flex align-center" dense>
                        <v-col cols="12" sm="6" class="d-flex align-center">
                            <h5 class="title h3 mb-2 mb-sm-0">All Vendors ({{ totalVendors }})</h5>
                        </v-col>

                        <v-col cols="12" sm="6" class="d-flex justify-end flex-wrap gap-2">
                            <v-text-field v-model="search" placeholder="Search Vendors" density="compact"
                                variant="outlined" hide-details clearable append-inner-icon="mdi-magnify"
                                class="search-bar" />
                            <v-select v-model="sortType" :items="[
                                { title: 'A → Z', value: 1 },
                                { title: 'Z → A', value: 2 }
                            ]" density="compact" label="Sort By" style="width:200px" variant="outlined" hide-details
                                @update:model-value="applySort" />
                        </v-col>
                    </v-row>
                </div>

                <!-- Loader -->
                <div v-if="loading" class="loader-wrapper">
                    <v-progress-circular indeterminate color="primary" size="48" />
                </div>

                <!-- Vendors Table -->
                <!-- Vendors Table -->
                <div v-else class="table-wrapper">
                    <v-data-table :headers="headers" :items="filteredVendors" hide-default-footer class="custom-table"
                        density="comfortable" @click:row="goToVendorDetail">
                        <!-- <template #item.business_name="{ item }">
                            <div class="d-flex align-center gap-2 flex-wrap">
                                <v-avatar v-if="item.logo" size="32">
                                    <img :src="item.logo" alt="" />
                                </v-avatar>
                                <strong class="truncate">{{ item.business_name }}</strong>
                            </div>
                        </template> -->
                        <template #item.business_name="{ item }">
                            <div class="d-flex align-center gap-3">
                                <!-- Avatar: show logo if exists, fallback to placeholder if broken -->
                                <v-avatar v-if="item.logo || placeholder" size="36">
                                    <img :src="item.logo || placeholder" @error="onImageError($event)"
                                        alt="Business Logo" />
                                </v-avatar>

                                <strong>{{ item.business_name }}</strong>
                            </div>
                        </template>



                        <template #item.action="{ item }">
                            <a style="color:rgb(33 33 33);" :href="item.business_link" target="_blank">
                                <v-icon>mdi-web</v-icon>
                            </a>
                        </template>
                    </v-data-table>
                </div>

                <!-- Pagination -->
                <div class="d-flex justify-center mt-4 flex-wrap">
                    <v-pagination v-model="page" :length="pageCount" total-visible="5"
                        @update:modelValue="fetchVendors" />
                </div>

            </div>
        </v-container>
    </template>

<script setup>
import CryptoJS from "crypto-js";
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/plugins/axios'; // your axios instance
import { useRouter } from 'vue-router';
import placeholder from '@/assets/images/logos/placeholder.png';

const router = useRouter();
const loading = ref(false);
const search = ref('');
const vendors = ref([]);
const totalVendors = ref(0);
const page = ref(1);
const pageCount = ref(0);
const sortType = ref(null);
const currentSort = ref('');


const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

const onImageError = (event) => {
    event.target.src = placeholder;
};

const headers = [
    { title: 'Business Name', key: 'business_name' },
    { title: 'Contact Name', key: 'contact_name' },
    { title: 'Email', key: 'email' },
    { title: 'Phone', key: 'phone' },
    { title: 'Action', key: 'action', sortable: false }
];

const applySort = () => {
  currentSort.value = sortType.value;
  page.value = 1;
  fetchVendors();
};

// Fetch Vendors API
const fetchVendors = async () => {
    loading.value = true;

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const orgId = localStorage.getItem('organization_id');
    const role = localStorage.getItem('role');

    try {
        const response = await api.get(
            `/vendors/list/${role === "super_admin" ? orgId : user.organization_id}`,
            {
                params: {
                    page: page.value,
                    search: search.value || '',
                    sort: currentSort.value  // ✅ API sorting
                }
            }
        );

        if (response.data.success) {
            const result = response.data.data;
            vendors.value = result.data;
            totalVendors.value = result.total;
            pageCount.value = result.last_page;
        } else {
            vendors.value = [];
            totalVendors.value = 0;
        }
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};


const goToVendorDetail = (event, item) => {
    const id = item.item.id.toString();

    // Encrypt and URL encode
    const encryptedId = CryptoJS.AES.encrypt(id, SECRET_KEY).toString();
    const encodedId = encodeURIComponent(encryptedId);

    router.push({ name: 'VendorDetail', params: { id: encodedId } });
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

/* Hover effect for table rows */
::v-deep(.custom-table tbody tr:hover) {
    background-color: #e3e3e368 !important;
    /* light blue */
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.table-wrapper {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 8px;
    /* add a little space for scrollbar */
}

.custom-table {
    min-width: 650px;
    /* forces horizontal scroll when too narrow */
}

.truncate {
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.search-bar {
    width: 100%;
    max-width: 250px;
    background-color: #f4f4f4;
    border-radius: 8px;
}

@media (max-width: 600px) {
    .search-bar {
        max-width: 100%;
    }
}

.loader-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    /* taller so it feels balanced */
    width: 100%;
}
</style>
