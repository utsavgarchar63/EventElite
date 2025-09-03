<template>
     <v-container>
          <!-- Metrics Section -->
          <v-row>
               <v-col cols="12" sm="6" md="3" v-for="card in eventCards" :key="card.title">
                    <MetricCard :title="card.title" :avatarColor="card.avatarColor" :value="card.value"
                         :icon="card.icon" />
               </v-col>

               <!-- Create Event Button -->
               <v-col cols="12" sm="6" md="3" class="d-flex justify-center justify-md-end mt-4 mt-md-0">
                    <v-btn color="primary" class="h-fit" size="large" prepend-icon="mdi-plus">
                         Create Event
                    </v-btn>
               </v-col>
          </v-row>

          <!-- Tabs for Events -->
          <div style="margin-top: 20px; background-color: white; width: 100%; padding: 10px; border-radius: 10px;">
               <v-row class="align-center">

                    <!-- Tabs -->
                    <v-col>
                         <v-tabs v-model="activeTab" background-color="white" color="primary" slider-color="primary"
                              class="main-tabs">
                              <v-tab value="upcoming" class="text-body-1">Upcoming Events</v-tab>
                              <v-tab value="past" class="text-body-1">Past Events</v-tab>
                              <v-tab value="draft" class="text-body-1">Draft Events</v-tab>
                              <v-tab value="cancelled" class="text-body-1">Cancelled Events</v-tab>
                         </v-tabs>
                    </v-col>

                    <!-- End Download Button -->
                    <v-col cols="auto" class="d-flex align-center">
                         <v-btn variant="outlined" color="#525454" style="border-color: #D5D6DA;"
                              prepend-icon="mdi-download" @click="downloadReport">
                              Download
                         </v-btn>
                    </v-col>
               </v-row>

               <!-- Tabs Content -->
               <v-window v-model="activeTab">
                    <v-window-item value="upcoming">
                         <EventList eventType="upcoming" />
                    </v-window-item>
                    <v-window-item value="past">
                         <EventList eventType="past" />
                    </v-window-item>
                    <v-window-item value="draft">
                         <EventList eventType="draft" />
                    </v-window-item>
                    <v-window-item value="cancelled">
                         <EventList eventType="cancelled" />
                    </v-window-item>
               </v-window>
          </div>


          <!-- Snackbar for notifications -->
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
     </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import MetricCard from "@/components/dashboard/MetricCard.vue";
import { useSnackbarStore } from "@/store/snackbar";

// Icons
import dollarIcon from "@/assets/images/icons/dollar.svg";
import grommetIcon from "@/assets/images/icons/grommet.svg";
import ticketIcon from "@/assets/images/icons/ticket.svg";
import EventList from "../components/events/EventList.vue";

const activeTab = ref("upcoming");

const eventCards = ref([
     { title: "Total Events", value: 0, icon: ticketIcon, avatarColor: "primary" },
     { title: "Total Tickets", value: 0, icon: grommetIcon, avatarColor: "#FFAA7F" },
     { title: "Total Revenue", value: "$0", icon: dollarIcon, avatarColor: "#33B875" }
]);

const downloadReport = () => {
     console.log("Download report logic here");
     // You can add CSV, Excel, or PDF download logic here
};

const fetchEventStats = async () => {
     // try {
     //      const response = await api.get(`/events/stats/1`, {
     //           headers: {
     //                Authorization: `Bearer ${localStorage.getItem("token")}`
     //           }
     //      });

     //      if (response.data && response.data.data) {
     //           const stats = response.data.data;
     eventCards.value = [
          {
               title: "Total Events",
               // value: stats.total_events || 0,
               value: 150,
               icon: ticketIcon,
               avatarColor: "primary"
          },
          {
               title: "Total Tickets",
               // value: stats.total_tickets || 0,
               value: 35000,
               icon: grommetIcon,
               avatarColor: "#FFAA7F"
          },
          {
               title: "Total Revenue",
               // value: `$${stats.total_revenue || 0}`,
               value: `$1,40,000`,
               icon: dollarIcon,
               avatarColor: "#33B875"
          }
     ];
     //      }
     // } catch (error) {
     //      console.error("Failed to fetch event stats:", error);
     //      useSnackbarStore().show("Failed to load event stats", "error");
     // }
};

onMounted(() => {
     fetchEventStats();
});
</script>
