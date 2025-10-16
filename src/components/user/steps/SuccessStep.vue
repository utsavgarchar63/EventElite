<template>
     <v-card class="pa-10 text-center">
          <v-icon size="64" color="success">mdi-check-circle-outline</v-icon>
          <h2 class="mt-4">Booking Successful!</h2>
          <p class="mt-2">Your tickets have been booked successfully for <b>{{ event.event_name }}</b>.</p>
          <v-btn color="primary" class="mt-4" @click="$emit('done')">Go to My Events</v-btn>
     </v-card>
</template>

<script setup lang="ts">
defineProps({ event: Object });
const emit = defineEmits(["done"]);
</script>
