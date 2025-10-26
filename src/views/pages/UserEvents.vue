<template>
  <v-container>
    <v-row>
      <!-- Loader -->
      <div v-if="loading" class="d-flex justify-center align-center w-100" style="height: 200px;">
        <v-progress-circular indeterminate color="primary" size="48" class="my-auto"></v-progress-circular>
      </div>

      <!-- Event List -->
      <template v-else>
        <v-col v-for="(event, index) in filteredEvents" :key="index" cols="12">
          <v-card class="event-card" elevation="0">
            <v-row no-gutters style="cursor:pointer" @click="goToDetail(event.event_id)">
              <!-- Event Image -->
              <v-col cols="12" sm="3">
                <v-img :src="event?.image || defaultEventImg" height="130" class="rounded-lg" cover
                  @error="onImageError" />
              </v-col>

              <!-- Event Info -->
              <v-col cols="12" sm="7" class="d-flex flex-column justify-center px-4">
                <div class="font-weight-bold text-h6 mb-2">
                  {{ event?.event_name }}
                </div>
                <div class="text-body-2 mb-1" style="color: #717182;">
                  <v-icon size="18" color="#717182" class="me-1">mdi-calendar</v-icon>
                  {{ formatDate(event?.event_date) }}
                </div>

                <div class="text-body-2 mb-1" style="color: #717182;">
                  <v-icon size="18" color="#717182" class="me-1">mdi-map-marker</v-icon>
                  {{ event?.venue }}
                </div>
                <div class="text-body-2" style="color: #717182;">
                  <v-icon size="18" color="#717182" class="me-1">mdi-ticket</v-icon>
                  {{ event?.tickets?.length || 0 }} tickets purchased
                </div>
              </v-col>

              <!-- Status Tag -->
              <v-col cols="12" sm="2" class="d-flex align-start justify-end pe-4">
                <v-chip :color="getStatusColor(props.eventType)" text-color="white" style="font-weight: 600;" label
                  size="small">
                  {{ props.eventType }}
                </v-chip>
                <v-icon size="24" color="#717182" class="ms-2" style="cursor:pointer"
                  @click="goToDetail(event.event_id)">
                  mdi-chevron-right
                </v-icon>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- No Events Found -->
        <v-col v-if="filteredEvents.length === 0" cols="12"
          class="d-flex flex-column align-center justify-center text-center py-16">
          <v-avatar size="80" color="grey-lighten-4" class="mb-4">
            <v-icon size="40" color="grey-darken-1">mdi-calendar-remove</v-icon>
          </v-avatar>
          <h5 class="text-h6 font-weight-medium mb-1">No Events Found</h5>
          <p class="text-body-2" style="color: #999;">
            Looks like there are no {{ props.eventType }} events at the moment.
          </p>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import CryptoJS from "crypto-js";
import { useRouter } from "vue-router";
import defaultEventImg from '@/assets/images/events/banner.webp';
import api from "@/plugins/axios";

const router = useRouter();

interface EventItem {
  event_id: number;
  event_name: string;
  event_date: string;
  venue: string;
  tickets: number;
  image?: string;
}


// Add this in props
const props = defineProps<{
  eventType: "upcoming" | "past" | "cancelled";
  search: string;
  refreshKey: number;  // 👈 new prop
}>();
// Watch for refreshKey changes
watch(() => props.refreshKey, () => {
  fetchEvents();
});

const formatDate = (isoDate: string) => {
  if (!isoDate) return "Date not specified";
  const date = new Date(isoDate);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
};


const events = ref<{
  upcomingEvents: EventItem[];
  pastEvents: EventItem[];
  cancelledEvents: EventItem[];
}>({
  upcomingEvents: [],
  pastEvents: [],
  cancelledEvents: []
});


const loading = ref(false); // 👈 loading state

const fetchEvents = async () => {
  loading.value = true; // 👈 start loader
  try {
    const res = await api.get("/user/events");
    if (res.data.status) {
      events.value = res.data.data;
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  } finally {
    loading.value = false; // 👈 stop loader
  }
};


const onImageError = (value?: string) => {
  // `value` is ignored, we just set fallback
  return defaultEventImg; // or set src manually if needed
};


onMounted(fetchEvents);

// Computed filter for selected tab and search
const filteredEvents = computed(() => {
  const allEvents =
    props.eventType === "upcoming"
      ? events.value.upcomingEvents
      : props.eventType === "past"
        ? events.value.pastEvents
        : events.value.cancelledEvents;

  return allEvents.filter(
    (e) =>
      !props.search ||
      e.event_name.toLowerCase().includes(props.search.toLowerCase()) ||
      e.venue.toLowerCase().includes(props.search.toLowerCase())
  );
});
const toUrlSafeBase64 = (str: string) =>
  btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const goToDetail = (id: number) => {
  // numeric id -> string -> base64 (URL-safe)
  const encoded = toUrlSafeBase64(String(id));
  router.push({ name: "EventDetail", query: { id: encoded } });
};
// const goToDetail = (id: number) => {
//   const encryptedId = CryptoJS.AES.encrypt(
//     id.toString(),
//     import.meta.env.VITE_SECRET_KEY
//   ).toString();
//   router.push({ name: "EventDetail", query: { id: encryptedId } });
// };

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "upcoming":
      return "#33B875";
    case "past":
      return "#999999";
    case "cancelled":
      return "#E53935";
    default:
      return "grey";
  }
};


// Re-fetch events whenever tab changes
watch(() => props.eventType, fetchEvents);
watch(() => props.refreshKey, () => {
  fetchEvents();
});
</script>

<style scoped>
.event-card {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.text-grey {
  color: #9e9e9e;
}
</style>
