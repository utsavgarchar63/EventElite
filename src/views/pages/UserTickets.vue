<template>
  <v-container>
    <!-- Tickets Card -->
    <div class="event-tabs-card">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center pa-4">
        <div>
          <h5 class="title h3">My Tickets</h5>
          <p style="color: grey">Your digital tickets and QR codes</p>
        </div>
      </div>

      <!-- Tabs -->
      <v-row class="align-center">
        <v-col>
          <v-tabs
            v-model="activeTab"
            background-color="white"
            color="primary"
            slider-color="primary"
            class="main-tabs"
          >
            <v-tab
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="text-body-1"
            >
              {{ tab.label }}
            </v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <!-- Tabs Content -->
      <v-window v-model="activeTab">
        <v-window-item
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
        >
          <UserTicket :ticketType="tab.value" />
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UserTicket from "./UserTicket.vue";

const activeTab = ref("upcoming");

// Define tabs dynamically
const tabs = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];
</script>

<style scoped>
.event-tabs-card {
  margin-top: 20px;
  background-color: white;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
}
</style>
