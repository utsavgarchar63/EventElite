<template>
  <v-container>
    <div class="mb-5">
      <h4 class="text-h4 font-weight-bold">Event Type</h4>
      <p class="mt-1" style="color: #525454;">Select event type to proceed</p>
    </div>

    <!-- Loader while fetching -->
    <div v-if="loading" class="d-flex justify-center" style="height: 200px;">
      <v-progress-circular indeterminate color="primary" size="48" class="my-auto"></v-progress-circular>
    </div>

    <!-- Show event cards once data is loaded -->
    <v-row v-else>
      <v-col cols="12" sm="6" md="4" v-for="(event, index) in eventTypes" :key="index">
        <v-card :class="['event-card', { 'selected-card': selectedEvent === event.title }]">
          <v-img :src="event.image || defaultImage" height="140" class="mb-4"
                 style="border-radius: 8px; margin: 15px;" cover />
          <v-card-title style="font-weight:700; font-size:18px;">
            {{ event.title }}
          </v-card-title>
          <v-card-subtitle class="mb-2">{{ event.sub_title }}</v-card-subtitle>
          <v-list density="compact">
            <v-list-item v-for="(desc, index) in event.description.split(',')" :key="index"
                         class="feature-item">
              {{ desc.trim() }}
            </v-list-item>
          </v-list>

          <v-card-actions>
            <v-btn :loading="selecting === event.id" color="primary" size="large" variant="outlined" block class="event-btn"
                   :class="{ 'selected-btn': selectedEvent === event.title }"
                   @click="selectEvent(event)">
              <span class="btn-text">
                Get Started
              </span>
              <!-- Price shown always for selected, or on hover for others -->
              <span class="btn-price" :class="{ 'visible': selectedEvent === event.title }">
                &nbsp; ${{ event.price }}
              </span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useEventStore } from "@/store/eventStore";
import { useSnackbarStore } from "@/store/snackbar";
import api from "@/plugins/axios";
import defaultImage from "@/assets/images/events/free.webp";

const store = useEventStore();
const snackbar = useSnackbarStore();

const selectedEvent = ref("");
const eventTypes = ref([]);
const loading = ref(true);
const selecting = ref(null); // track button loading

// Fetch subscription plans
const fetchPlans = async () => {
  loading.value = true;
  try {
    const res = await api.get("/events/get-subscription-plans");
    if (res.data.status) {
      eventTypes.value = res.data.data.map((plan) => ({
        ...plan,
        image: defaultImage,
      }));

      // Restore previously selected event
      if (store.formData.eventType?.title) {
        selectedEvent.value = store.formData.eventType.title;
      }
    }
  } catch (err) {
    console.error("Error fetching subscription plans:", err);
    snackbar.show("Failed to load subscription plans", "error");
  } finally {
    loading.value = false;
  }
};

// Select an event & call subscription API
const selectEvent = async (eventObj) => {
  const admin_id = localStorage.getItem("admin_id");
  const admin_token = localStorage.getItem("token");

  if (!admin_id || !admin_token) {
    snackbar.show("Admin not logged in", "error");
    return;
  }

  selectedEvent.value = eventObj.title;
  selecting.value = eventObj.id; // show button loading

  try {
    const payload = {
      admin_id: parseInt(admin_id),
      subscription_plan_id: eventObj.id,
    };

    const res = await api.post("/events/subscription", payload, {
      headers: {
        Authorization: `Bearer ${admin_token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.data.status) {
      snackbar.show(res.data.message || "Subscription selected successfully!", "success");

      // Save selection in store & localStorage
      store.formData.eventType = eventObj;
      store.formData.subscription = res.data.data.Subscription;
      store.saveToLocalStorage();

      store.nextStep();
    } else {
      snackbar.show(res.data.message || "Failed to select subscription", "error");
    }
  } catch (err) {
    console.error("API error:", err);
    snackbar.show(err.response?.data?.message || "API call failed", "error");
  } finally {
    selecting.value = null; // stop button loading
  }
};

onMounted(() => {
  store.loadFromLocalStorage();
  fetchPlans();
});
</script>

<style>
.feature-item {
  color: #525454;
  min-height: auto !important;
}

.feature-item::before {
  content: "•";
  margin-left: 0px;
  padding-right: 10px;
  color: #555;
}

/* Card hover effect */
.event-card {
  border: 0.5px solid #949BBC;
  border-radius: 8px !important;
  transition: border-color 0.3s;
}

.event-card:hover {
  border: 1.5px solid rgb(var(--v-theme-primary)) !important;
}

/* Selected card always primary */
.selected-card {
  border: 1.5px solid rgb(var(--v-theme-primary)) !important;
}

.event-btn {
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

/* Price hidden initially */
.btn-price {
  display: none;
  transform: translateX(5px);
  transition: 0.3s ease, transform 0.3s ease;
}

/* Price visible on hover */
.event-btn:hover .btn-price,
.btn-price.visible {
  display: block;
}

/* Button hover effect */
.event-btn:hover {
  background-color: rgb(var(--v-theme-primary));
  color: #fff !important;
  border-color: rgb(var(--v-theme-primary));
}

/* Selected button */
.selected-btn {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: #fff !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}
</style>
