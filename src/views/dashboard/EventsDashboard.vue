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
          <v-tabs
            v-model="activeTab"
            background-color="white"
            color="primary"
            slider-color="primary"
            class="main-tabs"
          >
            <v-tab value="upcoming" class="text-body-1">Upcoming Events</v-tab>
            <v-tab value="past" class="text-body-1">Past Events</v-tab>
            <v-tab value="cancelled" class="text-body-1">Cancelled Events</v-tab>
          </v-tabs>
        </v-col>

        <!-- Refresh and Search Section -->
        <v-col cols="auto" class="d-flex align-center gap-3">
          <!-- Refresh Button -->
          <v-btn
            variant="outlined"
            color="#525454"
            style="border-color: #D5D6DA;"
            icon="mdi-refresh"
            @click="refreshEvents"
          ></v-btn>

          <!-- Search Field -->
          <v-text-field
            v-model="searchQuery"
            density="compact"
            variant="outlined"
            hide-details
            placeholder="Search events"
            prepend-inner-icon="mdi-magnify"
            class="search-field"
          />
        </v-col>
      </v-row>

      <!-- Tabs Content -->
      <v-window v-model="activeTab">
        <v-window-item value="upcoming">
          <UserEvents :eventType="'upcoming'" :search="searchQuery" />
        </v-window-item>

        <v-window-item value="past">
          <UserEvents :eventType="'past'" :search="searchQuery" />
        </v-window-item>

        <v-window-item value="cancelled">
          <UserEvents :eventType="'cancelled'" :search="searchQuery" />
        </v-window-item>
      </v-window>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UserEvents from "../pages/UserEvents.vue";

const activeTab = ref("upcoming");
const searchQuery = ref("");

const refreshEvents = () => {
  console.log("Refreshing events...");
  // Add your refresh logic here (e.g., reload from API)
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
