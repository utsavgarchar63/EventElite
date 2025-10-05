<template>
  <v-container fluid>
    <!-- Event Banner -->
    <div style="position: relative;">
      <v-img :src="event?.image" height="300" class="rounded-lg mb-4" cover></v-img>

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
        {{ event?.category || "Event" }}
      </v-chip>

      <!-- Event Info (Bottom Overlay) -->
      <div style="
          position: absolute;
          bottom: 15px;
          left: 20px;
          color: white;
        ">
        <h1 class="text-h4 font-weight-bold mb-2">{{ event?.title }}</h1>

        <div class="d-flex align-center flex-wrap" style="gap: 15px; font-size: 14px;">
          <!-- <div class="d-flex align-center">
            <v-icon size="18" class="me-1" color="white">mdi-calendar</v-icon>
            <span>{{ event?.date }}</span>
          </div> -->
          <div class="d-flex align-center">
            <v-icon size="18" class="me-1" color="white">mdi-calendar-blank-outline</v-icon>
            <span>{{ event?.date }}</span>
          </div>

          <div class="d-flex align-center">
            <v-icon size="18" class="me-1" color="white">mdi-clock-outline</v-icon>
            <span>{{ event?.time || "9:00 AM – 6:00 PM" }}</span>
          </div>
          <div class="d-flex align-center">
            <v-icon size="18" class="me-1" color="white">mdi-map-marker-outline</v-icon>
            <span>{{ event?.location }}</span>
          </div>
        </div>

        <!-- Add to Calendar Button -->
        <v-btn size="small" color="white" class="mt-3" style="color: #0a0a0a; font-weight: 600;"
          prepend-icon="mdi-calendar-plus-outline">
          Add to Calendar
        </v-btn>
      </div>
    </div>


  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import CryptoJS from "crypto-js";
import { events } from "@/data/events";

const route = useRoute();
const event = ref<any>(null);

onMounted(() => {
  const encryptedId = route.query.id as string;
  if (encryptedId) {
    const bytes = CryptoJS.AES.decrypt(encryptedId, import.meta.env.VITE_SECRET_KEY);
    const id = parseInt(bytes.toString(CryptoJS.enc.Utf8));
    console.log("Decrypted Event ID:", id);

    event.value = events.find((e) => e.id === id) || null;
  }
});

// Status chip color
const getStatusColor = (status?: string) => {
  if (!status) return "grey";
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
</script>

<style scoped>
.v-img {
  border-radius: 12px;
}
</style>
