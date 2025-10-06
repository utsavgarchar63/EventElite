<template>
  <v-container fluid>
    <!-- Loader -->
    <div v-if="loading" class="d-flex justify-center" style="height: 200px">
      <v-progress-circular indeterminate color="primary" size="48" class="my-auto"></v-progress-circular>
    </div>

    <!-- Event Details -->
    <div v-else-if="event" style="position: relative;">
      <!-- Event Banner -->
      <v-img
        :src="bannerImage"
        height="300"
        class="rounded-lg mb-4"
        cover
        @error="onImageError"
      ></v-img>

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
      <v-chip
        color="white"
        size="small"
        class="text-body-2 font-weight-bold"
        style="
          position: absolute;
          background-color: rgba(255, 255, 255, 0.3);
          top: 15px;
          left: 15px;
          color: #fff;
        "
        label
      >
        {{ event.event_type || "Event" }}
      </v-chip>

      <!-- Event Info (Bottom Overlay) -->
      <div style="
          position: absolute;
          bottom: 15px;
          left: 20px;
          color: white;
        ">
        <h1 class="text-h4 font-weight-bold mb-2">{{ event.event_name }}</h1>

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
import defaultEventImg from '@/assets/images/events/banner.webp';

const route = useRoute();
const event = ref<any>(null);
const loading = ref<boolean>(true);
const bannerImage = ref<string>(defaultEventImg);

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
