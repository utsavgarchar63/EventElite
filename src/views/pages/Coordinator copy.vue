<template>
  <v-container>
    <!-- Add Button -->
    <div class="justify-end d-flex mb-4">
      <v-btn color="primary" class="d-flex align-center gap-2" @click="openDialog()">
        <v-icon>mdi-plus</v-icon>
        Add Coordinator
      </v-btn>
    </div>

    <!-- Table Section -->
    <div style="background: white; border-radius: 8px">
      <!-- Header -->
      <div class="header-section pa-4">
        <v-row class="d-flex align-center" dense>
          <v-col cols="12" sm="6">
            <h5 class="title h3 mb-2 mb-sm-0">All Coordinators ({{ totalCoordinators }})</h5>
          </v-col>

          <v-col cols="12" sm="6" class="d-flex justify-end flex-wrap gap-2">
            <v-text-field v-model="search" placeholder="Search Coordinators" density="compact" variant="outlined"
              hide-details clearable append-inner-icon="mdi-magnify" class="search-bar" />

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

      <!-- Table -->
      <div v-else class="table-wrapper">
        <v-data-table :headers="headers" :items="filteredCoordinators" hide-default-footer class="custom-table"
          density="comfortable" @click:row="(event, row) => onRowClick(row.item)">
          <!-- Name -->
          <template #item.name="{ item }">
            <strong>{{ item.name }}</strong>
          </template>

          <!-- Events -->
          <template #item.events="{ item }">
            <div v-if="item.events?.length" class="d-flex flex-wrap gap-2 py-2">
              <v-chip v-for="event in item.events" :key="event.id" size="small" color="primary" variant="outlined">
                {{ event.event_name }}
              </v-chip>
            </div>
            <span v-else class="text-grey">No Events</span>
          </template>

          <!-- Created At -->
          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <!-- Actions -->
          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex justify-center">
              <!-- Edit -->
              <v-btn icon color="primary" variant="text" @click="openDialog(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>

              <!-- Delete -->
              <v-btn icon color="error" variant="text" @click="confirmDelete(item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>

        </v-data-table>
      </div>
    </div>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="pa-1">
        <v-card-title>
          <span class="text-h4">{{ isEdit ? "Update Coordinator" : "Add Coordinator" }}</span>
        </v-card-title>

        <v-card-text>
          <v-container fluid>
            <v-row>
              <!-- Name -->
              <v-col cols="12">
                <v-text-field v-model="form.name" label="Full Name" variant="outlined" color="primary"
                  hide-details="auto" :rules="[rules.required, rules.name]" required />
              </v-col>

              <!-- Email -->
              <v-col cols="12">
                <v-text-field v-model="form.email" label="Email Address" variant="outlined" color="primary"
                  hide-details="auto" :disabled="isEdit" :rules="[rules.required, rules.email]" required />
              </v-col>

              <!-- Phone -->
              <v-col cols="12">
                <v-text-field v-model="form.phone" label="Phone Number" variant="outlined" color="primary"
                  hide-details="auto" :rules="[rules.required, rules.phone]" required />
              </v-col>

              <!-- Event Select -->
              <v-col cols="12">
                <v-select v-model="form.event_ids" :items="events" item-title="name" item-value="id"
                  label="Select Events" variant="outlined" color="primary" hide-details="auto" multiple chips clearable
                  :loading="eventLoading" placeholder="Choose one or more events" :rules="[rules.events]" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>



        <v-card-actions class="d-flex justify-end">
          <v-btn size="large" variant="outlined" @click="closeDialog">Cancel</v-btn>
          <v-btn size="large" color="primary" variant="elevated" :loading="saving" @click="saveCoordinator">
            {{ isEdit ? "Update" : "Create" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Delete Coordinator</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ selectedCoordinator?.name }}</strong>?
        </v-card-text>

        <v-card-actions class="d-flex justify-end">
          <v-btn variant="outlined" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" :loading="deleting" @click="deleteCoordinator">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted } from "vue";
import api from "@/plugins/axios";
import { useSnackbarStore } from "@/store/snackbar";
import { router } from "@/router";

const snackbar = useSnackbarStore();

const loading = ref(false);
const saving = ref(false);
const dialog = ref(false);
const isEdit = ref(false);
const search = ref("");
const sortMenu = ref(false);
const coordinators = ref([]);
const totalCoordinators = ref(0);
const selectedCoordinator = ref(null);

const deleteDialog = ref(false);
const deleting = ref(false);


const events = ref([]);
const eventLoading = ref(false);

const form = ref({
  name: "",
  email: "",
  phone: "",
  event_ids: [],
});

const headers = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Phone", key: "phone" },
  { title: "Events", key: "events" },
  { title: "Created At", key: "created_at" },
  { title: "Actions", key: "actions", align: "center", sortable: false },
];

const rules = {
  required: (v) => !!v || "This field is required",
  email: (v) =>
    !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address",
  phone: (v) =>
    !v || /^[0-9]{10}$/.test(v) || "Enter a valid 10-digit phone number",
  name: (v) =>
    !v || /^[a-zA-Z\s]+$/.test(v) || "Name should contain only letters",
  events: (v) => (v && v.length > 0) || "Select at least one event",
};

const sortOptions = [
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
];

// Fetch coordinators
const fetchCoordinators = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("admin_token");
    const { data } = await api.get("/coordinators/list");
    if (data.status) {
      coordinators.value = data.data;
      totalCoordinators.value = data.data.length;
    }
  } catch (err) {
    snackbar.show("Failed to fetch coordinators", "error");
    console.error("Failed to fetch coordinators:", err);
  } finally {
    loading.value = false;
  }
};

// Fetch events
const fetchEvents = async () => {
  eventLoading.value = true;
  try {
    const token = localStorage.getItem("admin_token");
    const { data } = await api.get("/coordinators/events", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data.status) {
      events.value = data.data.map((e) => ({
        id: e.id,
        name: e.event_name || `Event #${e.id}`,
      }));
    }
  } catch (err) {
    snackbar.show("Failed to fetch events", "error");
    console.error("Failed to fetch events:", err);
  } finally {
    eventLoading.value = false;
  }
};

// Redirect to Coordinator Detail Page
const goToCoordinatorDetail = (id) => {
  router.push({ name: 'CoordinatorDetail', params: { id } });
};

const onRowClick = (coordinator) => {
  // Prevent redirect when clicking edit/delete buttons
  if (event.target.closest(".v-btn")) return;

  goToCoordinatorDetail(coordinator.id);
};


// Confirm delete
const confirmDelete = (coordinator) => {
  selectedCoordinator.value = coordinator;
  deleteDialog.value = true;
};

// Delete coordinator
const deleteCoordinator = async () => {
  if (!selectedCoordinator.value?.id) return;

  deleting.value = true;
  try {
    const { data } = await api.delete(
      `/coordinators/delete/${selectedCoordinator.value.id}`,

    );

    if (data.success) {
      snackbar.show("Coordinator deleted successfully!", "success");
      await fetchCoordinators();
    } else {
      snackbar.show(data.message || "Failed to delete coordinator", "error");
    }
  } catch (err) {
    console.error("Error deleting coordinator:", err);
    snackbar.show("Something went wrong while deleting", "error");
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
  }
};


// Format date
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Open dialog
const openDialog = async (coordinator = null) => {
  await fetchEvents();
  if (coordinator) {
    isEdit.value = true;
    selectedCoordinator.value = coordinator;
    form.value = {
      name: coordinator.name,
      email: coordinator.email,
      phone: coordinator.phone,
      event_ids: coordinator.events?.map((e) => e.id) || [],
    };
  } else {
    isEdit.value = false;
    selectedCoordinator.value = null;
    resetForm();
  }
  dialog.value = true;
};

// Close dialog
const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

// Reset form
const resetForm = () => {
  form.value = { name: "", email: "", phone: "", event_ids: [] };
};

// ✅ Snackbar-based validation
const validateForm = () => {
  const { name, email, phone, event_ids } = form.value;

  if (!name) return snackbar.show("Name is required", "error");
  if (!/^[a-zA-Z\s]+$/.test(name)) return snackbar.show("Enter a valid name", "error");

  if (!isEdit.value) {
    if (!email) return snackbar.show("Email is required", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return snackbar.show("Enter a valid email address", "error");
  }

  if (!phone) return snackbar.show("Phone number is required", "error");
  if (!/^[0-9]{10}$/.test(phone))
    return snackbar.show("Enter a valid 10-digit phone number", "error");

  if (!event_ids || event_ids.length === 0)
    return snackbar.show("Select at least one event", "error");

  return true;
};

// Save coordinator (Add/Update)
const saveCoordinator = async () => {
  if (validateForm() !== true) return;

  saving.value = true;
  try {
    const token = localStorage.getItem("admin_token");
    const payload = {
      name: form.value.name,
      phone: form.value.phone,
      event_ids: form.value.event_ids.join(","),
    };

    let res;
    if (isEdit.value && selectedCoordinator.value) {
      res = await api.put(`/coordinators/update/${selectedCoordinator.value.id}`, payload);
    } else {
      res = await api.post("/coordinators/add", { ...payload, email: form.value.email });
    }

    if (res.data.success || res.data.status) {
      snackbar.show(isEdit.value ? "Coordinator updated successfully!" : "Coordinator added successfully!", "success");
      await fetchCoordinators();
      closeDialog();
    } else {
      snackbar.show(res.data.message || "Failed to save coordinator", "error");
    }
  } catch (err) {
    console.error("Error saving coordinator:", err);
    snackbar.show("Something went wrong while saving", "error");
  } finally {
    saving.value = false;
  }
};

// Search filter
const filteredCoordinators = computed(() => {
  const q = search.value.toLowerCase();
  return coordinators.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
  );
});

// Sort
const applySort = (type) => {
  if (type === "az") coordinators.value.sort((a, b) => a.name.localeCompare(b.name));
  if (type === "za") coordinators.value.sort((a, b) => b.name.localeCompare(a.name));
  sortMenu.value = false;
};

onMounted(fetchCoordinators);
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
  border-radius: 8px;
  margin-top: 10px;
}

::v-deep(.custom-table tbody tr:hover) {
  background-color: #e3e3e368 !important;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.table-wrapper {
  overflow-x: auto;
  padding-bottom: 8px;
}

.loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

::v-deep(.custom-table tbody tr:hover) {
  background-color: #f2f2f2 !important;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
</style>
