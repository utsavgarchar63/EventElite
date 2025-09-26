<template>
  <v-container>
    <div class="wrapper">
      <!-- Header -->
      <div class="header-section pa-4">
        <v-row class="d-flex align-center" dense>
          <v-col cols="12" sm="6" class="d-flex align-center">
            <h5 class="title h3 mb-2 mb-sm-0">All Sponsors ({{ totalSponsors }})</h5>
          </v-col>

          <v-col cols="12" sm="6" class="d-flex justify-end flex-wrap gap-2">
            <!-- Search -->
            <v-text-field v-model="search" placeholder="Search Sponsors" density="compact" variant="outlined"
              hide-details clearable append-inner-icon="mdi-magnify" class="search-bar" />

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
          </v-col>
        </v-row>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="loader-wrapper">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <!-- Sponsors Table -->
      <div v-else class="table-wrapper">
        <v-data-table :headers="headers" :items="filteredSponsors" hide-default-footer class="custom-table"
          density="comfortable" @click:row="goToSponsorDetailFromRow">
          <!-- Business Name with Logo -->
          <template #item.business_name="{ item }">
            <div class="d-flex align-center gap-3">
              <!-- Show avatar only if logo exists or fallback -->
              <v-avatar v-if="item.logo || placeholder" size="36">
                <img :src="item.logo || placeholder" @error="onImageError($event)" alt="Business Logo" />
              </v-avatar>

              <strong>{{ item.business_name }}</strong>
            </div>
          </template>

          <!-- Link column -->
          <template #item.link="{ item }">
            <a :href="item.link" target="_blank" class="truncate-link" :title="item.link">
              {{ item.link }}
            </a>
          </template>

          <!-- Events count -->
          <template #item.events_count="{ item }">
            {{ item.events_count }} Events
          </template>

          <!-- Action button -->
          <template #item.action="{ item }">
            <v-btn icon @click.stop="viewSponsor(item)">
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-center mt-4 flex-wrap">
        <v-pagination v-model="page" :length="pageCount" total-visible="5" @update:modelValue="fetchSponsors" />
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
import placeholder from "@/assets/images/logos/placeholder.png"
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

const router = useRouter();
const snackbar = useSnackbarStore();

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


const headers = [
  { title: 'Business Name', key: 'business_name' },
  { title: 'Link', key: 'link' },
  { title: 'Events Count', key: 'events_count' },
  { title: 'Action', key: 'action', sortable: false }
];


const onImageError = (event) => {
  event.target.src = placeholder;
};
const fetchSponsors = async () => {
  loading.value = true;
  try {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const response = await api.get(`/sponsors/list/${user.organization_id}`, {
      params: {
        page: page.value,
        search: search.value || '',
        sort: currentSort.value
      }
    });

    if (response.data.success) {
      const result = response.data.data;
      sponsors.value = result.data;
      totalSponsors.value = result.total;
      pageCount.value = result.last_page;
    } else {
      sponsors.value = [];
      totalSponsors.value = 0;
    }
  } catch (err) {
    snackbar.show('Something went wrong', 'error');
  } finally {
    loading.value = false;
  }
};

const goToSponsorDetail = (id) => {
  const encryptedId = CryptoJS.AES.encrypt(id.toString(), SECRET_KEY).toString();
  const encodedId = encodeURIComponent(encryptedId);
  router.push({ name: 'SponsorDetail', params: { id: encodedId } });
};

const goToSponsorDetailFromRow = (event, item) => {
  goToSponsorDetail(item.item.id);
};

const filteredSponsors = computed(() => {
  if (!search.value) return sponsors.value;
  const q = search.value.toLowerCase();
  return sponsors.value.filter(
    (s) =>
      s.business_name.toLowerCase().includes(q) ||
      (s.link && s.link.toLowerCase().includes(q))
  );
});

const applySort = (value) => {
  currentSort.value = value;
  fetchSponsors();
};

const viewSponsor = (item) => {
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
.wrapper {
  background: white;
  border-radius: 8px;
}

.title {
  font-weight: bold;
}

/* Loader */
.loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  width: 100%;
}

/* Search bar */
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

/* Table */
.table-wrapper {
  overflow-x: auto;
  width: 100%;
  padding-bottom: 8px;
}

.custom-table {
  min-width: 650px;
  /* Force horizontal scroll when narrow */
  background: white;
  width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}

/* Hover effect */
::v-deep(.custom-table tbody tr:hover) {
  background-color: #e3e3e368 !important;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Truncate business name & link */
.truncate {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.truncate-link {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}
</style>
