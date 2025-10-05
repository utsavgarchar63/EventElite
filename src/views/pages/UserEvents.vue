<template>
  <v-container>
    <v-row>
      <v-col v-for="(event, index) in filteredEvents" :key="index" cols="12">
        <v-card class="event-card" elevation="0">
          <v-row no-gutters style="cursor:pointer" @click="goToDetail(event.id)">
            <!-- Event Image -->
            <v-col cols="12" sm="3">
              <v-img :src="event.image" height="130" class="rounded-lg" cover></v-img>
            </v-col>

            <!-- Event Info -->
            <v-col cols="12" sm="7" class="d-flex flex-column justify-center px-4">
              <div class="font-weight-bold text-h6 mb-2">
                {{ event.title }}
              </div>
              <div class="text-body-2 mb-1" style="color: #717182;">
                <v-icon size="18" color="#717182" class="me-1">mdi-calendar</v-icon>
                {{ event.date }}
              </div>
              <div class="text-body-2 mb-1" style="color: #717182;">
                <v-icon size="18" color="#717182" class="me-1">mdi-map-marker</v-icon>
                {{ event.location }}
              </div>
              <div class="text-body-2" style="color: #717182;">
                <v-icon size="18" color="#717182" class="me-1">mdi-ticket</v-icon>
                {{ event.tickets }} tickets purchased
              </div>
            </v-col>

            <!-- Status Tag -->
            <v-col cols="12" sm="2" class="d-flex align-start justify-end pe-4">
              <v-chip :color="getStatusColor(event.status)" text-color="white" style="font-weight: 600;" label
                size="small">
                {{ event.status }}
              </v-chip>
              <v-icon size="24" color="#717182" class="ms-2" style="cursor:pointer" @click="goToDetail(event.id)">
                mdi-chevron-right
              </v-icon>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- No Results Found -->
      <v-col v-if="filteredEvents.length === 0" cols="12" class="text-center py-8">
        <v-icon size="40" color="grey-lighten-1">mdi-magnify</v-icon>
        <p class="mt-2 text-grey">No events found</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CryptoJS from "crypto-js";
import { useRouter } from "vue-router";
import { events } from "@/data/events";

// interface Event {
//   id: number;
//   title: string;
//   date: string;
//   location: string;
//   tickets: number;
//   status: string;
//   image: string;
// }

const router = useRouter();

const props = defineProps<{
  eventType: "upcoming" | "past" | "cancelled";
  search: string;
}>();

// Dummy data
// const events: Event[] = [
//   {

//     id: 2, title: "Tech Innovation Summit 2024",
//     date: "20 October 2024",
//     location: "Hard Rock Stadium, Miami, FL",
//     tickets: 12,
//     status: "Upcoming",
//     image: "https://images.unsplash.com/photo-1531058020387-3be344556be6"
//   },
//   {

//     id: 2, title: "Cloud Computing Summit",
//     date: "5 December 2024",
//     location: "Austin Convention Center, TX",
//     tickets: 2,
//     status: "Upcoming",
//     image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564"
//   },
//   {

//     id: 2, title: "AI Expo 2023",
//     date: "15 June 2023",
//     location: "London Tech Park, UK",
//     tickets: 45,
//     status: "Past",
//     image: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51"
//   },
//   {

//     id: 2, title: "Startup Conclave 2023",
//     date: "22 August 2023",
//     location: "Bangalore International Center, IN",
//     tickets: 0,
//     status: "Cancelled",
//     image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
//   }
//   , {
//     id: 2,
//     title: "Startup Conclave 2023",
//     date: "22 August 2023",
//     location: "Bangalore International Center, IN",
//     tickets: 0,
//     status: "Cancelled",
//     image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
//   }
// ];

// Computed filter based on tab + search
const filteredEvents = computed(() =>
  events.filter((e) => {
    const matchesType = e.status.toLowerCase() === props.eventType.toLowerCase();
    const matchesSearch =
      !props.search ||
      e.title.toLowerCase().includes(props.search.toLowerCase()) ||
      e.location.toLowerCase().includes(props.search.toLowerCase());
    return matchesType && matchesSearch;
  })
);


const goToDetail = (id: number) => {
  const encryptedId = CryptoJS.AES.encrypt(id.toString(), import.meta.env.VITE_SECRET_KEY).toString();
  router.push({ name: 'EventDetail', query: { id: encryptedId } });
};

const getStatusColor = (status: string) => {
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
.event-card {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}
</style>
