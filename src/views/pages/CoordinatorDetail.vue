<template>
     <v-container>

          <!-- Loader -->
          <div v-if="loading" class="d-flex justify-center align-center" style="height: 200px;">
               <v-progress-circular indeterminate color="primary" size="48" />
          </div>

          <!-- Coordinator Details -->
          <v-card v-else class="pa-6" style="border-radius: 10px !important;">
               <v-row>
                    <v-col cols="12" sm="6">
                         <h2 class="text-h4 mb-2">{{ coordinator.name }}</h2>
                         <p class="text-subtitle-1 mb-1"><strong>Email:</strong> {{ coordinator.email }}</p>
                         <p class="text-subtitle-1 mb-1"><strong>Phone:</strong> {{ coordinator.phone }}</p>
                         <p class="text-subtitle-1"><strong>Created At:</strong> {{ formatDate(coordinator.created_at)
                              }}</p>
                    </v-col>
               </v-row>

               <v-divider class="my-4" />

               <!-- Events Section -->
               <v-row>
                    <v-col cols="12">
                         <h3 class="text-h5 mb-3">Assigned Events</h3>

                         <div v-if="coordinator.events && coordinator.events.length" class="d-flex flex-wrap gap-2">
                              <v-chip v-for="event in coordinator.events" :key="event.id" color="primary"
                                   variant="outlined" size="small">
                                   {{ event.event_name }}
                              </v-chip>
                         </div>
                         <div v-else class="text-grey">No events assigned</div>
                    </v-col>
               </v-row>
          </v-card>

          <!-- Snackbar -->
          <v-snackbar v-model="useSnackbarStore().snackbar" :color="useSnackbarStore().color" timeout="4000"
               location="top right" transition="slide-x-reverse-transition">
               <v-icon v-if="useSnackbarStore().color === 'success'" size="22" color="white" class="me-2">
                    mdi-check-circle
               </v-icon>
               <v-icon v-else size="22" color="white" class="me-2">mdi-alert-circle</v-icon>
               {{ useSnackbarStore().message }}
          </v-snackbar>
     </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/plugins/axios";
import { useSnackbarStore } from "@/store/snackbar";

const route = useRoute();
const router = useRouter();
const snackbar = useSnackbarStore();

const coordinator = ref({});
const loading = ref(true);

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

// Fetch Coordinator by ID
const fetchCoordinator = async () => {
     loading.value = true;
     try {
          const token = localStorage.getItem("admin_token");
          const id = route.params.id;

          const { data } = await api.get(`/coordinators/selected/${id}`, {
               headers: { Authorization: `Bearer ${token}` },
          });

          if (data.status && data.data.length) {
               coordinator.value = data.data[0];
          } else {
               snackbar.show("Coordinator not found", "error");
               router.back();
          }
     } catch (err) {
          console.error("Failed to fetch coordinator:", err);
          snackbar.show("Error fetching coordinator details", "error");
          router.back();
     } finally {
          loading.value = false;
     }
};

onMounted(fetchCoordinator);
</script>

<style scoped>
h2 {
     font-weight: 600;
}

.text-grey {
     color: #888;
}
</style>
