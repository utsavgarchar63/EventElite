<template>
  <v-card class="pa-6">
    <h3 class="mb-4 font-weight-medium">Payment Summary</h3>
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-3 mb-3">
          <h4>Buyer</h4>
          <p><strong>Name:</strong> {{ buyer.name }}</p>
          <p><strong>Email:</strong> {{ buyer.email }}</p>
          <p><strong>Phone:</strong> {{ buyer.phone }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined class="pa-3 mb-3">
          <h4>Payment</h4>
          <p><strong>Card Holder:</strong> {{ payment.card_holder_name }}</p>
          <p><strong>Card Number:</strong> **** **** **** {{ payment.card_number.slice(-4) }}</p>
          <p><strong>Expiry:</strong> {{ payment.expiry_month }}/{{ payment.expiry_year }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined class="pa-3">
      <h4>Attendees</h4>
      <v-divider class="my-2" />
      <div v-for="(a, i) in attendees" :key="i" class="mb-2">
        <p>
          <strong>{{ a.name }}</strong> ({{ a.email }}) — {{ a.phone_no }}
          <br />
          Ticket: {{ getTicketName(a?.ticket_id) }} | Qty: {{ a.quantity }}
        </p>
        <v-divider v-if="i < attendees.length - 1" />
      </div>
    </v-card>

    <div class="d-flex justify-space-between mt-4">
      <v-btn variant="outlined" @click="$emit('back')">Back</v-btn>
      <v-btn color="success" @click="$emit('confirm')">Confirm & Pay</v-btn>
    </div>
  </v-card>
</template>
<script setup lang="ts">
import type { Attendee, Buyer, EventDetails, Payment } from '../types';


const props = defineProps<{
  buyer: Buyer;
  attendees: Attendee[];
  payment: Payment;
  event: EventDetails;
}>();

const emit = defineEmits(["back", "confirm"]);

const getTicketName = (id: number | null) => {
  const t = props.event?.tickets?.find((x) => x.id === id);
  return t ? t.ticket_name : "N/A";
};
</script>
