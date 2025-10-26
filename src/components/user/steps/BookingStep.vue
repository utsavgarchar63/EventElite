<script setup lang="ts">
import type { Attendee, Buyer, EventDetails, Payment } from '../types';


defineProps<{
  buyer: Buyer;
  attendees: Attendee[];
  payment: Payment;
  event: EventDetails;
}>();
</script>

<template>
  <v-card class="pa-6">
    <h3 class="mb-4 font-weight-medium">Buyer Information</h3>
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field label="Full Name" variant="outlined" v-model="buyer.name" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field label="Email" variant="outlined" v-model="buyer.email" type="email" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field label="Phone" variant="outlined" v-model="buyer.phone" />
      </v-col>
    </v-row>

    <h3 class="mt-6 mb-4 font-weight-medium">Attendees</h3>
    <div v-for="(att, i) in attendees" :key="i" class="mb-4">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field label="Name" variant="outlined" v-model="att.name" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field label="Email" variant="outlined" v-model="att.email" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field label="Phone" variant="outlined" v-model="att.phone_no" />
        </v-col>
        <v-col cols="12" md="6">
          <!-- ✅ Fix item-title -->
          <v-select :items="event.tickets || []"
            :item-title="ticket => `${ticket.ticket_name} ${ticket.is_free ? '(Free)' : `(${ticket.price}₹)`}`"
            item-value="id" :item-disabled="(ticket: { capacity: number; }) => ticket.capacity <= 0" label="Select Ticket" variant="outlined"
            v-model="att.ticket_id" />

        </v-col>
        <v-col cols="12" md="6">
          <v-text-field label="Quantity" variant="outlined" v-model.number="att.quantity" type="number" min="1" />
        </v-col>
      </v-row>
      <v-divider v-if="i < attendees.length - 1" class="my-3" />
    </div>

    <v-btn color="secondary" @click="$emit('addAttendee')">
      <v-icon start>mdi-plus</v-icon> Add Attendee
    </v-btn>

    <h3 class="mt-6 mb-4 font-weight-medium">Payment Information</h3>
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field label="Card Number" variant="outlined" v-model="payment.card_number" maxlength="16" />
      </v-col>
      <v-col cols="6" md="3">
        <v-text-field label="Expiry Month" variant="outlined" v-model="payment.expiry_month" maxlength="2" />
      </v-col>
      <v-col cols="6" md="3">
        <v-text-field label="Expiry Year" variant="outlined" v-model="payment.expiry_year" maxlength="4" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field label="Card Holder Name" variant="outlined" v-model="payment.card_holder_name" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field label="CVV" variant="outlined" v-model="payment.cvv" maxlength="3" type="password" />
      </v-col>
    </v-row>

    <div class="d-flex justify-end mt-4">
      <v-btn size="large" color="primary" @click="$emit('next')">Next</v-btn>
    </div>
  </v-card>
</template>
