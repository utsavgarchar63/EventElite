<template>
  <div>
    <!-- Loader -->
    <div v-if="loading" class="d-flex justify-center my-5">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- No tickets -->
    <div v-else-if="events.length === 0" class="text-center my-5">
      No tickets available.
    </div>

    <!-- Events -->
    <div v-else>
      <div v-for="event in events" :key="event.event_id" class="pa-6 border rounded-lg mt-5 mb-10">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-5 flex-wrap">
          <div>
            <h5 class="mb-1 text-h5 font-weight-medium">{{ event.event_name }}</h5>
            <p class="text-body-2 mt-2" style="color: grey;">
              <v-icon small class="me-1">mdi-calendar</v-icon>
              {{ formatDate(event.details.date) }}
              <v-icon small class="ms-3 me-1">mdi-map-marker</v-icon>
              {{ event.details.location }}
            </p>
          </div>
          <div class="d-flex gap-3">
            <v-btn variant="outlined" color="grey" size="small">Invoice</v-btn>
            <v-btn variant="outlined" color="grey" size="small">Download All</v-btn>
          </div>
        </div>

        <!-- QR Ticket Grid -->
        <v-row dense class="ticket-grid">
          <template v-for="ticket in event.tickets">
            <v-col v-for="qr in ticket.qr_codes" :key="qr.qr_id" cols="12" sm="6" md="4" lg="3">
              <v-card class="pa-5 d-flex flex-column align-center mb-6 text-center ticket-card">
                <v-img :src="`https://api.qrserver.com/v1/create-qr-code/?data=${qr.code}&size=150x150`" width="100"
                  height="100" class="mb-3"></v-img>
                <p class="font-weight-medium text-subtitle-2 mb-1">
                  #{{ qr.code.slice(0, 6).toUpperCase() }}
                </p>
                <p class="text-caption grey--text mb-4">Show at entrance</p>
                <div class="d-flex justify-center mb-3 gap-2">
                  <v-btn variant="outlined" color="primary" size="small">Download</v-btn>
                  <v-btn variant="outlined" color="primary" size="small">Share</v-btn>
                </div>
              </v-card>
            </v-col>
          </template>
        </v-row>



      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import api from "@/plugins/axios";

interface QRCode {
  qr_id: string;
  code: string;
}

interface Ticket {
  ticket_id: string;
  qr_codes: QRCode[];
}

interface EventDetails {
  date: string;
  location: string;
}

interface Event {
  event_id: string;
  event_name: string;
  details: EventDetails;
  tickets: Ticket[];
}

const props = defineProps<{ ticketType: string }>();
const events = ref<Event[]>([]);  // ✅ Tell TypeScript that events is an array of Event
const loading = ref(false);

const fetchTickets = async () => {
  loading.value = true;
  try {
    const response = await api.get("/user/tickets");
    const data = response.data.data;

    if (props.ticketType === "upcoming") events.value = data.upcomingEvents;
    if (props.ticketType === "past") events.value = data.pastEvents;
    if (props.ticketType === "cancelled") events.value = data.cancelledEvents;
    console.log(data.pastEvents)
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTickets);
watch(() => props.ticketType, fetchTickets);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
</script>

<style scoped>
.ticket-card {
  border: 2px dashed #dcdcdc;
  border-radius: 12px;
  transition: all 0.2s ease;
  background-color: #fff;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

.ticket-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.ticket-grid {
  row-gap: 20px !important;
  column-gap: 15px !important;
}

.text-grey {
  color: #666 !important;
}
</style>
