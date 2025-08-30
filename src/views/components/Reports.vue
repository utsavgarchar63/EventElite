<template>
     <v-container>
          <v-row>
               <!-- Role-based dashboard -->
               <template v-if="role === 'super_admin'">
                    <!-- Metric Cards -->
                    <v-col v-for="card in superAdminCards" :key="card.title" cols="12" sm="6" md="3"
                         style="padding: 0 7px;">
                         <MetricCard :title="card.title" :avatarColor="card.avatarColor" :value="card.value"
                              :growth="card.growth" :icon="card.icon" />
                    </v-col>

                    <!-- Tabs for different sections -->
                    <div style="margin-top: 20px;background-color: white; width: 100%;">
                         <v-tabs v-model="activeMainTab" background-color="white" color="primary" slider-color="primary"
                              class="main-tabs">
                              <v-tab value="cancelled_events" class="text-body-1">Cancelled Events</v-tab>
                              <v-tab value="organizations" class="text-body-1">Organizations</v-tab>
                              <!-- <v-tab value="users" class="text-body-1">Users</v-tab> -->
                         </v-tabs>

                         <v-window v-model="activeMainTab" >
                              <v-window-item value="cancelled_events">
                                   <CancelledEvents />
                              </v-window-item>
                              <v-window-item value="organizations">
                                   <Organizations />
                              </v-window-item>
                              <!-- <v-window-item value="users">
                                   <Users />
                              </v-window-item> -->
                         </v-window>
                    </div>
               </template>

               <!-- Admin Section -->
               <template v-else-if="role === 'admin'">
                    <v-col style="padding: 0px 7px;" cols="12" sm="6" md="3" v-for="card in adminCards"
                         :key="card.title">
                         <MetricCard :title="card.title" :avatarColor="card.avatarColor" :value="card.value"
                              :growth="card.growth" :icon="card.icon" :redirect="card.redirect" />
                    </v-col>
               </template>
          </v-row>
     </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/plugins/axios";
import MetricCard from "@/components/dashboard/MetricCard.vue";
import Events from "../components/Events.vue";
import Organizations from "../components/Organizations.vue";

import dollarIcon from "@/assets/images/icons/dollar.svg";
import calanderIcon from "@/assets/images/icons/calander.svg";
import ticketIcon from "@/assets/images/icons/ticket.svg";
import CancelledEvents from "../components/CancelledEvents.vue";

const role = localStorage.getItem("role") || "admin";
const activeMainTab = ref("events"); // default tab

// State for cards
const superAdminCards = ref([
     { title: "Total Organization", value: 0, growth: 0, icon: calanderIcon, avatarColor: "primary", },
     { title: "Total Events", value: 0, growth: 0, icon: calanderIcon, avatarColor: "primary" },
     { title: "Membership Revenue", value: "$0", growth: 0, icon: dollarIcon, avatarColor: "#33B875", },
     { title: "Total Revenue", value: "$0", growth: 0, icon: dollarIcon, avatarColor: "#33B875" }
]);

const adminCards = ref([
     { title: "Total Events", value: 0, growth: 0, icon: calanderIcon, avatarColor: "primary", redirect: "/total-events" },
     { title: "Total Tickets", value: 0, growth: 0, icon: ticketIcon, avatarColor: "#FFAA7F", redirect: "/total-events" },
     { title: "Total Revenue", value: "$0", growth: 0, icon: dollarIcon, avatarColor: "#33B875", redirect: "/total-revenue" },
     { title: "Upcoming Events", value: 0, growth: 0, icon: calanderIcon, avatarColor: "#FF5F5F", redirect: "/approvals" }
]);

// Fetch stats for admin
const fetchAdminStats = async () => {
     try {
          const response = await api.get("/admin/dashboard/stats/1");
          if (response.data.status) {
               const stats = response.data.data.stats;
               adminCards.value = [
                    { title: "Total Events", value: stats.total_events, growth: stats.event_growth, icon: calanderIcon, avatarColor: "primary", redirect: "/total-events" },
                    { title: "Total Tickets", value: stats.tickets_sold, growth: stats.ticket_growth, icon: ticketIcon, avatarColor: "#FFAA7F", redirect: "/total-events" },
                    { title: "Total Revenue", value: `$${stats.total_revenue}`, growth: stats.revenue_growth, icon: dollarIcon, avatarColor: "#33B875", redirect: "/total-revenue" },
                    { title: "Upcoming Events", value: stats.upcoming_events, growth: stats.upcoming_growth, icon: calanderIcon, avatarColor: "#FF5F5F", redirect: "/approvals" }
               ];
          }
     } catch (error) {
          console.error("Failed to fetch admin stats:", error);
     }
};

// Fetch stats for super admin
const fetchSuperAdminStats = async () => {
     try {
          const response = await api.get("/dashboard/stats");
          if (response.data.success) {
               const stats = response.data.data;
               superAdminCards.value = [
                    { title: "Total Organization", value: stats.total_organizations.total, growth: stats.total_organizations.this_month, icon: calanderIcon, avatarColor: "primary", },
                    { title: "Total Events", value: stats.total_events.total, growth: stats.total_events.this_month, icon: calanderIcon, avatarColor: "primary" },
                    { title: "Membership Revenue", value: `$${stats.admin_revenue.total}`, growth: stats.admin_revenue.this_month, icon: dollarIcon, avatarColor: "#33B875", },
                    { title: "Total Revenue", value: `$${stats.total_revenue.total}`, growth: stats.total_revenue.this_month, icon: dollarIcon, avatarColor: "#33B875" }
               ];
          }
     } catch (error) {
          console.error("Failed to fetch super admin stats:", error);
     }
};

// Call correct API on mount
onMounted(() => {
     if (role === "admin") {
          fetchAdminStats();
     } else if (role === "super_admin") {
          fetchSuperAdminStats();
     }
});

</script>


<style scoped>
.custom-tab {
     color: #525454;
}



/* Add bottom border to every row */
.custom-table .v-table__wrapper table tbody tr > td {
     border-bottom: 1px solid #EDEEF2 !important;
}

/* Add divider under table header as well */
.custom-table .v-table__wrapper table thead tr > th {
     border-bottom: 1px solid #EDEEF2 !important;
}

/* Ensure styles penetrate Vuetify component internals */
:deep(.custom-table .v-table__wrapper table) {
     border-collapse: collapse;
}

:deep(.custom-table .v-table__wrapper table tbody tr > td) {
     border-bottom: 1px solid #EDEEF2 !important;
     padding: 12px 16px;
}

:deep(.custom-table .v-table__wrapper table thead tr > th) {
     border-bottom: 1px solid #EDEEF2 !important;
     padding: 12px 16px;
}

.main-section {
     background-color: white;
}

.active-tab {
     color: rgb(var(--v-theme-primary));
     border: 6px;
}

.main-tabs {
     border-bottom: 1px solid #ccc;
}
</style>
