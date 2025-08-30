<template>
     <v-container>
          <v-row>
               <v-col style="padding: 0px 7px;" cols="12" sm="6" md="3" v-for="card in adminCards" :key="card.title">
                    <MetricCard :title="card.title" :avatarColor="card.avatarColor" :value="card.value"
                         :growth="card.growth" :icon="card.icon" :redirect="card.redirect" />
               </v-col>
               <v-col cols="12" lg="8" style="margin-top: 20px;">
                    <RevenueStatistics :revenueData="adminRevenueGraph" />
               </v-col>
               <v-col cols="12" lg="4" style="margin-top: 20px;">
                    <SalesStatistics :salesData="adminSalesData" />
               </v-col>
               <v-col cols="12" lg="5" style="margin-top: 20px;">
                    <v-img :src='onGoingEventImg' cover></v-img>
               </v-col>
               <v-col cols="12" lg="7" style="margin-top: 20px;" v-for="event in onGoingEvents" :key="event.id">
                    <v-card class="py-5 px-1" style="border-radius: 8px !important;">
                         <v-card-title class="text-h4 font-weight-bold">
                              On Going Event List
                         </v-card-title>

                         <v-data-table :headers="headers" class="custom-table" :items="onGoingEvents"
                              hide-default-footer dense>
                              <template #item.start_date="{ item }">
                                   {{ formatDate(item.start_date) }}
                              </template>

                         </v-data-table>
                    </v-card>
               </v-col>
          </v-row>
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
import api from "@/plugins/axios";
import MetricCard from "@/components/dashboard/MetricCard.vue";
import dollarIcon from "@/assets/images/icons/dollar.svg";
import calanderIcon from "@/assets/images/icons/calander.svg";
import ticketIcon from "@/assets/images/icons/ticket.svg";
import RevenueStatistics from "../components/RevenueStatistics.vue";
import { useSnackbarStore } from "@/store/snackbar";
import SalesStatistics from "../components/SalesStatistics.vue";
import onGoingEventImg from '@/assets/images/dashboard/onGoingEvents.png';
import { useRoute } from "vue-router";

const onGoingEvents = ref<any[]>([]);
const role = localStorage.getItem("role");

const route = useRoute();
const adminId = localStorage.getItem("admin_id");
const dashboardId = route.params.id || adminId || 1;
// Dialog state
const dialog = ref(false);
const loading = ref(false);
const adminRevenueGraph = ref<{ month: string; total: number }[]>([
     { month: 'Jan', total: 31000 },
     { month: 'Feb', total: 20000 },
     { month: 'Mar', total: 30000 },
     { month: 'Apr', total: 25000 },
     { month: 'May', total: 12000 },
     { month: 'Jun', total: 25000 },
     { month: 'Jul', total: 35000 },
     { month: 'Aug', total: 41500 },
     { month: 'Sep', total: 28000 },
     { month: 'Oct', total: 31000 },
     { month: 'Nov', total: 17000 },
     { month: 'Dec', total: 40000 }
]);
const adminSalesData = ref({ sold: 0, left: 0, total: 0 });

const headers = [
     { title: "Event Name", key: "name" },
     { title: "Venue", key: "venue" },
     { title: "Date", key: "start_date" },
     { title: "Tickets Sold", key: "tickets_sold" }
];

const formatDate = (dateStr: string) => {
     return new Date(dateStr).toLocaleDateString();
};
// Error state
const errors = ref({
     firstName: "",
     lastName: "",
     email: "",
     phone: "",
     legalName: ""
});


const adminCards = ref([
     {
          title: "Total Events",
          value: 0,
          growth: 0,
          icon: calanderIcon,
          avatarColor: "primary",
          redirect: "/total-events"
     },
     {
          title: "Total Tickets",
          value: 0,
          growth: 0,
          icon: ticketIcon,
          avatarColor: "#FFAA7F",
          redirect: "/total-events"
     },
     {
          title: "Total Revenue",
          value: "$0",
          growth: 0,
          icon: dollarIcon,
          avatarColor: "#33B875",
          redirect: "/total-revenue"
     },
     {
          title: "Upcoming Events",
          value: 0,
          growth: 0,
          icon: calanderIcon,
          avatarColor: "#FF5F5F",
          redirect: "/approvals"
     }
]);

// Fetch stats
const fetchAdminStats = async () => {
     try {
          const response = await api.get(`/admin/dashboard/stats/${dashboardId}`);
          console.log(dashboardId, "dashboardId")
          if (response.data.status) {
               const stats = response.data.data;
               const { graphs, on_going_events } = response.data.data;
               onGoingEvents.value = on_going_events?.data || [];
               // Revenue graph
               adminRevenueGraph.value = graphs.revenue.map((item: any) => ({
                    month: new Date(item.month).toLocaleString('default', { month: 'short' }),
                    total: item.total
               }));


               // Sales data for Doughnut chart
               const latestTickets = graphs.tickets[graphs.tickets.length - 1];
               adminSalesData.value = {
                    sold: latestTickets.sold,
                    left: latestTickets.unsold,
                    total: latestTickets.sold + latestTickets.unsold
               };

               // Update adminCards dynamically if needed
               adminCards.value = [
                    {
                         title: "Total Events",
                         value: stats.total_events || 0,
                         growth: stats.event_growth || 0,
                         icon: calanderIcon,
                         avatarColor: "primary",
                         redirect: "/total-events"
                    },
                    {
                         title: "Total Tickets",
                         value: adminSalesData.value.sold,
                         growth: stats.ticket_growth || 0,
                         icon: ticketIcon,
                         avatarColor: "#FFAA7F",
                         redirect: "/total-events"
                    },
                    {
                         title: "Total Revenue",
                         value: `$${graphs.revenue.reduce((acc: number, item: any) => acc + item.total, 0)}`,
                         growth: stats.revenue_growth || 0,
                         icon: dollarIcon,
                         avatarColor: "#33B875",
                         redirect: "/total-revenue"
                    },
                    {
                         title: "Upcoming Events",
                         value: stats.upcoming_events || 0,
                         growth: stats.upcoming_growth || 0,
                         icon: calanderIcon,
                         avatarColor: "#FF5F5F",
                         redirect: "/approvals"
                    }
               ];
          }
     } catch (error) {
          console.error("Failed to fetch admin stats:", error);
     }
};

onMounted(() => {
     fetchAdminStats();
});
</script>

<style>
/* Add bottom border to every row */
.custom-table .v-table__wrapper table tbody tr>td {
     border-bottom: 1px solid #EDEEF2 !important;
}

/* Add divider under table header as well */
.custom-table .v-table__wrapper table thead tr>th {
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
</style>