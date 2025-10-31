<template>
  <v-container>
    <!-- Tabs Section -->
    <div class="event-tabs-card">
      <div class="d-flex justify-space-between align-center pa-4">
        <div>
          <h5 class="title h3">My Events</h5>
          <p style="color: grey">View and manage your purchased events</p>
        </div>
      </div>

      <v-row class="align-center">
        <!-- Tabs -->
        <v-col>
          <v-tabs v-model="activeTab" background-color="white" color="primary" slider-color="primary" class="main-tabs">
            <v-tab value="upcoming" class="text-body-1">Upcoming</v-tab>
            <v-tab value="past" class="text-body-1">Past</v-tab>
            <v-tab value="cancelled" class="text-body-1">Cancelled</v-tab>
          </v-tabs>
        </v-col>

        <!-- Refresh and Search Section -->
        <v-col cols="auto" class="d-flex align-center gap-3">
          <!-- Refresh Button -->
          <v-btn variant="outlined" color="#525454" style="border-color: #D5D6DA;" icon="mdi-refresh"
            @click="refreshEvents"></v-btn>

          <!-- Search Field -->
          <v-text-field v-model="searchQuery" density="compact" variant="outlined" hide-details
            placeholder="Search events" prepend-inner-icon="mdi-magnify" class="search-field" />
          <v-select v-model="sortValue" :items="[
            { title: 'A → Z', value: 1 },
            { title: 'Z → A', value: 2 },
            { title: 'Date ↑', value: 3 },
            { title: 'Date ↓', value: 4 }
          ]" density="compact" variant="outlined" hide-details label="Sort By" class="search-field"
            style="width: 150px;" />

        </v-col>
      </v-row>

      <!-- Tabs Content -->
      <v-window v-model="activeTab">
        <v-window-item value="upcoming">
          <UserEvents :eventType="'upcoming'" :search="searchQuery" :sort="sortValue"
            :refreshKey="refreshKeys.upcoming" />
        </v-window-item>

        <v-window-item value="past">
          <UserEvents :eventType="'past'" :search="searchQuery" :sort="sortValue" :refreshKey="refreshKeys.past" />
        </v-window-item>

        <v-window-item value="cancelled">
          <UserEvents :eventType="'cancelled'" :search="searchQuery"   :sort="sortValue" :refreshKey="refreshKeys.cancelled" />
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>

<script setup lang="ts">

import { reactive, ref } from "vue";
import UserEvents from "../pages/UserEvents.vue";

const activeTab = ref("upcoming");
const searchQuery = ref("");
const sortValue = ref(1);

// This object will trigger child re-fetch when changed
const refreshKeys = reactive({
  upcoming: 0,
  past: 0,
  cancelled: 0
});

const refreshEvents = () => {
  if (activeTab.value === "upcoming") refreshKeys.upcoming++;
  else if (activeTab.value === "past") refreshKeys.past++;
  else if (activeTab.value === "cancelled") refreshKeys.cancelled++;
};
</script>

<style scoped>
.event-tabs-card {
  margin-top: 20px;
  background-color: white;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
}

.search-field {
  width: 220px;
}
</style>
