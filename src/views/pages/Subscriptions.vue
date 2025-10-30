<template>
  <v-container>
    <div class="table-wrapper" style="background: white; border-radius: 8px; padding: 16px">
      <!-- Header -->
      <div class="header-section  d-flex justify-space-between align-center flex-wrap mb-4">
        <h5 class="title h3 mb-2 mb-md-0">
          All Subscription Plans ({{ totalSubscriptions }})
        </h5>

        <div class="d-flex gap-3 flex-wrap">

          <v-text-field v-model="search" placeholder="Search Plan" density="compact" variant="outlined" hide-details
            clearable append-inner-icon="mdi-magnify" class="search-bar" />
          <v-select v-model="sortType" :items="[
            { title: 'A → Z', value: 1 },
            { title: 'Z → A', value: 2 },
            { title: 'Low → High Price', value: 3 },
            { title: 'High → Low Price', value: 4 }
          ]" density="compact" label="Sort By" style="width:200px" variant="outlined" hide-details
            @update:model-value="fetchSubscriptions" />
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">Add Plan</v-btn>

        </div>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="loader-wrapper">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <v-data-table :headers="headers" :items="filteredSubscriptions" hide-default-footer class="custom-table"
          density="comfortable">
          <!-- Status -->
          <template #item.is_active="{ item }">
            <v-chip :style="{
              backgroundColor: item.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: item.is_active ? '#10B981' : '#EF4444',
              fontWeight: '600'
            }" variant="flat" size="small">
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>


          <!-- Created Date -->
          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-2"><v-btn color="primary" icon="mdi-pencil" variant="text" size="small"
                @click="openEditDialog(item)"></v-btn>
              <v-btn color="error" icon="mdi-delete" variant="text" size="small"
                @click="confirmDelete(item.id)"></v-btn>
            </div>
          </template>
        </v-data-table>
      </div>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h6">Confirm Delete</v-card-title>
          <v-card-text>Are you sure you want to delete this subscription plan?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="outlined" color="grey" @click="deleteDialog = false">Cancel</v-btn>
            <v-btn color="error" variant="elevated" @click="deleteSubscription">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Add / Edit Dialog -->
      <v-dialog v-model="formDialog" max-width="600px" persistent>
        <v-card class="rounded-lg elevation-3">

          <!-- HEADER (Sticky) -->
          <div class="dialog-header px-4 py-3 d-flex justify-space-between align-center">
            <h3 class="font-weight-bold m-0">
              {{ isEdit ? 'Update Subscription Plan' : 'Add Subscription Plan' }}
            </h3>
            <v-btn icon variant="text" @click="closeFormDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <!-- BODY -->
          <v-card-text class="px-4 py-3" style="max-height: 65vh; overflow-y: auto;">
            <v-form ref="planForm" lazy-validation>

              <v-text-field v-model="form.title" label="Title" variant="outlined" density="comfortable" required />

              <v-text-field v-model="form.sub_title" label="Sub Title" variant="outlined" density="comfortable" />

              <v-textarea v-model="form.description" label="Description" variant="outlined" density="comfortable"
                rows="3" />

              <v-text-field v-model="form.price" label="Price (₹)" type="number" variant="outlined"
                density="comfortable" required />

              <!-- Drag & Drop Image Upload -->
              <div class="drop-zone mt-3" @dragover.prevent @drop.prevent="handleDrop" @click="fileInput.click()">
                <template v-if="!form.imagePreview">
                  <v-icon size="40" class="text-primary">mdi-image-plus</v-icon>
                  <p class="text-grey text-caption mt-1">
                    Drag & drop or click to upload
                  </p>
                </template>

                <v-img v-else :src="form.imagePreview" max-height="150" class="rounded-lg" cover />
                <input type="file" accept="image/*" ref="fileInput" class="d-none" @change="handleFileChange" />
              </div>

            </v-form>
          </v-card-text>

          <!-- FOOTER (Sticky) -->
          <v-card-actions class="dialog-footer px-4 py-3">
            <v-spacer></v-spacer>

            <v-btn variant="outlined" color="grey-darken-1" @click="closeFormDialog">
              Cancel
            </v-btn>

            <v-btn color="primary" variant="flat" @click="saveSubscription" :loading="formLoading">
              {{ isEdit ? 'Update' : 'Save' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </div>
  </v-container>
  <v-snackbar v-model="useSnackbarStore().snackbar" :color="useSnackbarStore().color" timeout="4000"
    location="top right" transition="slide-x-reverse-transition" class="custom-snackbar">
    <div class="snackbar-content">
      <v-icon v-if="useSnackbarStore().color === 'success'" size="22" class="me-1" color="white">
        mdi-check-circle
      </v-icon>
      <v-icon v-else-if="useSnackbarStore().color === 'error'" size="22" class="me-1" color="white">
        mdi-alert-circle
      </v-icon>
      <v-icon v-else size="22" color="white" class="me-1">
        mdi-information
      </v-icon>
      <span class="snackbar-text">{{ useSnackbarStore().message }}</span>
    </div>
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/plugins/axios';
import { useSnackbarStore } from '@/store/snackbar';

const snackbar = useSnackbarStore();
const loading = ref(false);
const subscriptions = ref([]);
const search = ref('');
const sortType = ref(null);
const totalSubscriptions = ref(0);
const deleteDialog = ref(false);
const selectedId = ref(null);

// Add/Edit dialog
const formDialog = ref(false);
const isEdit = ref(false);
const formLoading = ref(false);
const fileInput = ref(null);


const form = ref({
  id: null,
  title: '',
  sub_title: '',
  description: '',
  price: '',
  image: null,
  imagePreview: null,
});

// Table headers
const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Sub Title', key: 'sub_title' },
  { title: 'Description', key: 'description' },
  { title: 'Price (₹)', key: 'price' },
  { title: 'Status', key: 'is_active' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
];

// Fetch Subscription Data
const fetchSubscriptions = async () => {
  loading.value = true;

  try {
    const params = {};

    if (sortType.value) {
      params.sort = sortType.value;
    }

    const response = await api.get('/super-admin/get-subscription-plans', { params });

    subscriptions.value = response.data.data;
    totalSubscriptions.value = subscriptions.value.length;

  } finally {
    loading.value = false;
  }
};

// Confirm Delete
const confirmDelete = (id) => {
  selectedId.value = id;
  deleteDialog.value = true;
};

// Delete Subscription
const deleteSubscription = async () => {
  try {
    await api.delete(`/subscription-plans/${selectedId.value}`);
    subscriptions.value = subscriptions.value.filter(sub => sub.id !== selectedId.value);
    totalSubscriptions.value = subscriptions.value.length;
    snackbar.show("Subscription plan deleted successfully!", "success");
  } catch (error) {
    snackbar.show("Failed to delete subscription plan.", "error");
  } finally {
    deleteDialog.value = false;
  }
};


// Open Add Dialog
const openAddDialog = () => {
  isEdit.value = false;
  resetForm();
  formDialog.value = true;
};

// Open Edit Dialog
const openEditDialog = (item) => {
  isEdit.value = true;
  form.value = { ...item, imagePreview: item.image || null };
  formDialog.value = true;
};

// Close Dialog
const closeFormDialog = () => {
  formDialog.value = false;
  resetForm();
};

// Reset form
const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    sub_title: '',
    description: '',
    price: '',
    image: null,
    imagePreview: null,
  };
};

// Handle Image
const handleDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (file) previewFile(file);
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) previewFile(file);
};

const previewFile = (file) => {
  form.value.image = file;
  const reader = new FileReader();
  reader.onload = () => (form.value.imagePreview = reader.result);
  reader.readAsDataURL(file);
};

// Save or Update
const saveSubscription = async () => {
  formLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('sub_title', form.value.sub_title);
    formData.append('description', form.value.description);
    formData.append('price', form.value.price);

    // ✅ Only append if a new file is selected
    if (form.value.image instanceof File) {
      formData.append('image', form.value.image);
    }

    let response;
    if (isEdit.value) {
      // Use method override if Laravel expects PUT
      response = await api.post(`/subscription-plans/${form.value.id}?_method=PUT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      snackbar.show("Subscription plan updated successfully!", "success");
    } else {
      response = await api.post('/subscription-plans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      snackbar.show("Subscription plan added successfully!", "success");
    }

    await fetchSubscriptions();
    closeFormDialog();
  } catch (error) {
    if (error.response?.data) {
      const errData = error.response.data;
      if (errData.errors) {
        const messages = Object.values(errData.errors).flat().join('\n');
        snackbar.show(messages, "error");
      } else {
        snackbar.show(errData.message || "Something went wrong while saving the plan.", "error");
      }
    } else {
      snackbar.show("Network error. Please try again.", "error");
    }
  } finally {
    formLoading.value = false;
  }
};



// Search filter
const filteredSubscriptions = computed(() => {
  if (!search.value) return subscriptions.value;
  const q = search.value.toLowerCase();
  return subscriptions.value.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.sub_title.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
});

// Format Date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return '-';
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(fetchSubscriptions);
</script>

<style scoped>
.title {
  font-weight: bold;
}

.search-bar {
  background-color: #f4f4f4;
  border-radius: 8px;
  height: fit-content;
  width: 250px;
}

.loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.drop-zone {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s;
}

.drop-zone:hover {
  background-color: #f7f7f7;
}

.dialog-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-bottom: 1px solid #eee;
}

.dialog-footer {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 10;
  border-top: 1px solid #eee;
}

.drop-zone {
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border-color: #1976d2;
  background: #f3f8ff;

  cursor: pointer;
}
</style>
