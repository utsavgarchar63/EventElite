<template>
  <v-container fluid>
    <!-- Loader -->
    <div v-if="loading" class="d-flex justify-center" style="height: 200px">
      <v-progress-circular indeterminate color="primary" size="48" class="my-auto"></v-progress-circular>
    </div>

    <!-- Event Details -->
    <div v-else-if="event">
      <div style="position: relative;">
        <!-- Event Banner -->
        <v-img :src="bannerImage" height="300" class="rounded-lg mb-4" cover @error="onImageError"></v-img>

        <!-- Dark Gradient Overlay -->
        <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 0.5rem;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%);
          "></div>

        <!-- Category Chip -->
        <v-chip color="white" size="small" class="text-body-2 font-weight-bold" style="
            position: absolute;
            background-color: rgba(255, 255, 255, 0.3);
            top: 15px;
            left: 15px;
            color: #fff;
          " label>
          {{ event.event_type || "Event" }}
        </v-chip>

        <!-- Event Info (Bottom Overlay) -->
        <div style="
            position: absolute;
            bottom: 15px;
            left: 20px;
            color: white;
          ">
          <h1 class="text-h1 font-weight-bold mb-2">
            {{ event.event_name }}
          </h1>

          <div class="d-flex align-center flex-wrap" style="gap: 15px; font-size: 14px;">
            <div class="d-flex align-center">
              <v-icon size="18" class="me-1" color="white">mdi-calendar-blank-outline</v-icon>
              <span>
                {{ formatDate(event.details?.start_datetime) }} -
                {{ formatDate(event.details?.end_datetime) }}
              </span>
            </div>

            <div class="d-flex align-center">
              <v-icon size="18" class="me-1" color="white">mdi-map-marker-outline</v-icon>
              <span>{{ event.details?.venue_address || "N/A" }}</span>
            </div>
          </div>

          <!-- Add to Calendar Button -->
          <v-btn size="small" color="white" class="mt-3" style="color: #0a0a0a; font-weight: 600;"
            prepend-icon="mdi-calendar-plus-outline">
            Add to Calendar
          </v-btn>
        </div>
      </div>

      <!-- About Section -->
      <div class="border rounded-lg pa-5 mb-5" style="background: white;">
        <h3 class="text-h4 mb-4">About This Event</h3>
        <p class="pt-2" style="line-height: 1.7;">
          {{ event.description || "N/A" }}
        </p>

        <v-row class="mt-5">
          <!-- Left Column: What's Included -->
          <v-col cols="12" md="6">
            <h4 class="text-h5 font-weight-bold mb-3">What's Included</h4>
            <div v-for="(item, index) in whatsIncluded" :key="index" class="d-flex align-center mb-2">
              <v-icon color="success" size="20" class="me-2">mdi-check-circle-outline</v-icon>
              <span>{{ item }}</span>
            </div>
          </v-col>

          <!-- Right Column: Schedule Highlights -->
          <v-col cols="12" md="6">
            <h4 class="text-h5 font-weight-bold mb-3">Schedule Highlights</h4>
            <div v-for="(highlight, index) in scheduleHighlights" :key="index"
              class="d-flex align-center justify-space-between mb-2">
              <span style="font-weight: 500;color: grey;">{{ highlight.time }}</span>
              <span>{{ highlight.activity }}</span>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- What's Included & Schedule Highlights -->
      <div class="border rounded-lg pa-5" style="background: white;">
        <h3 class="text-h4 mb-4">Venue Information</h3>
        <v-row>
          <v-col cols="12" md="6">
            <h4 class="font-weight-bold mb-2">{{ event.details?.venue || "Venue Name" }}</h4>
            <p class="text-body-2 mb-4">
              {{ event.details?.venue_address || "Address not available" }}
            </p>

            <div class="d-flex align-center flex-wrap mb-4" style="gap: 20px;">
              <div class="d-flex align-start">
                <v-icon style="color: grey;" class="me-2">mdi-phone</v-icon>
                <div>
                  <strong>(555) 123-4567</strong><br />
                  <small style="color: grey;">Phone</small>
                </div>
              </div>

              <div class="d-flex align-start">
                <v-icon style="color: grey;" class="me-2">mdi-email-outline</v-icon>
                <div>
                  <strong>info@venue.com</strong><br />
                  <small style="color: grey;">Email</small>
                </div>
              </div>

              <div class="d-flex align-start">
                <v-icon style="color: grey;" class="me-2">mdi-web</v-icon>
                <div>
                  <strong>www.venue.com</strong><br />
                  <small style="color: grey;">Website</small>
                </div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex justify-center align-center rounded-lg"
              style="height: 200px; background-color: #f4f5f7;">
              <div class="text-center">
                <v-icon color="grey" size="36">mdi-map-outline</v-icon>
                <p class="mt-2 text-subtitle-2 text-grey">Interactive map coming soon</p>
              </div>
            </div>

            <v-btn class="mt-4 w-100" color="grey-lighten-4" variant="outlined" prepend-icon="mdi-map-marker-outline"
              :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.details?.venue_address || '')}`"
              target="_blank">
              View in Google Maps
            </v-btn>
          </v-col>
        </v-row>

      </div>
    </div>

    <!-- No Event Found -->
    <div v-else class="text-center mt-10">
      <v-icon size="48" color="grey">mdi-alert-circle-outline</v-icon>
      <p class="text-subtitle-1 mt-3">No event details found.</p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import CryptoJS from "crypto-js";
import api from "@/plugins/axios";
import defaultEventImg from "@/assets/images/events/banner.webp";

const route = useRoute();
const event = ref<any>(null);
const loading = ref<boolean>(true);
const bannerImage = ref<string>(defaultEventImg);

// Static "What's Included"
const whatsIncluded = ref([
  "Full conference access",
  "Networking sessions",
  "Welcome reception",
  "Conference materials",
  "Lunch and refreshments",
  "Certificate of attendance",
]);

// Static "Schedule Highlights"
const scheduleHighlights = ref([
  { time: "9:00 AM", activity: "Registration & Welcome Coffee" },
  { time: "10:00 AM", activity: "Keynote: The Future of Technology" },
  { time: "11:30 AM", activity: "Panel: AI in Business" },
  { time: "12:30 PM", activity: "Networking Lunch" },
  { time: "2:00 PM", activity: "Breakout Sessions" },
  { time: "4:00 PM", activity: "Innovation Showcase" },
  { time: "5:30 PM", activity: "Closing Reception" },
]);

// Helper: Format date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Handle image load error
const onImageError = () => {
  bannerImage.value = defaultEventImg;
};

onMounted(async () => {
  const encryptedId = route.query.id as string;
  if (encryptedId) {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedId,
        import.meta.env.VITE_SECRET_KEY
      );
      const id = parseInt(bytes.toString(CryptoJS.enc.Utf8));

      // Fetch event details from API
      const res = await api.get(`/event-detail/${id}`);

      if (res.data?.status && res.data?.data) {
        event.value = res.data.data;
        console.log(res.data.data, "res.data.data");
        // Use sponsor logo if available, otherwise default banner
        if (event.value.sponsors?.length) {
          bannerImage.value = `https://eventelite-eanm.onrender.com/storage/${event.value.sponsors[0].logo}`;
        }
      } else {
        event.value = null;
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      event.value = null;
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});
</script>

<style scoped>
.v-img {
  border-radius: 12px;
}
</style>
