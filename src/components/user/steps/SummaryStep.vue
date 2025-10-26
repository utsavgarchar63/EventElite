<template>
  <v-card class="pa-6">
    <h3 class="text-h5 mb-4 font-weight-medium">Payment Summary</h3>

    <!-- Buyer & Payment Info -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-3 mb-3">
          <h4 class="text-subtitle-1 font-weight-medium mb-2">Buyer</h4>
          <p><strong>Name:</strong> {{ buyer.name }}</p>
          <p><strong>Email:</strong> {{ buyer.email }}</p>
          <p><strong>Phone:</strong> {{ buyer.phone }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined class="pa-3 mb-3">
          <h4 class="text-subtitle-1 font-weight-medium mb-2">Payment</h4>
          <p><strong>Card Holder:</strong> {{ payment.card_holder_name }}</p>
          <p>
            <strong>Card Number:</strong>
            **** **** **** {{ payment.card_number.slice(-4) }}
          </p>
          <p><strong>Expiry:</strong> {{ payment.expiry_month }}/{{ payment.expiry_year }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Attendees Summary -->
    <v-card outlined class="pa-3">
      <h4 class="text-subtitle-1 font-weight-medium mb-2">Attendees & Tickets</h4>
      <v-divider class="my-2" />

      <div v-if="attendees.length === 0" class="text-grey">
        No attendees added yet.
      </div>

      <div v-else>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Attendee</th>
              <th class="text-left">Ticket</th>
              <th class="text-right">Price</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Fee</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(a, i) in attendees" :key="i">
              <td>
                <strong>{{ a.name }}</strong><br />
                <small>{{ a.email }}</small><br />
                <small>{{ a.phone_no }}</small>
              </td>
              <td>{{ getTicketName(a.ticket_id) }}</td>
              <td class="text-right">
                ₹{{ getTicketPrice(a.ticket_id).toFixed(2) }}
              </td>
              <td class="text-right">{{ a.quantity }}</td>
              <td class="text-right">
                ₹{{ getConvenienceFee(a.ticket_id).toFixed(2) }}
              </td>
              <td class="text-right">
                ₹{{ getAttendeeTotal(a).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card>

    <!-- Total Summary -->
    <v-divider class="my-4" />
    <div class="text-right">
      <p class="text-body-1 mb-1">
        <strong>Subtotal:</strong> ₹{{ subTotal.toFixed(2) }}
      </p>
      <p class="text-body-1 mb-1">
        <strong>Total Convenience Fee:</strong> ₹{{ totalFee.toFixed(2) }}
      </p>
      <h4 class="text-h6 font-weight-bold mt-2">
        Grand Total: ₹{{ totalAmount.toFixed(2) }}
      </h4>
    </div>

    <!-- Actions -->
    <div class="d-flex justify-space-between mt-4">
      <v-btn variant="outlined" @click="$emit('back')">Back</v-btn>
      <v-btn color="success" @click="$emit('confirm')">Confirm & Pay</v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Attendee, Buyer, EventDetails, Payment } from "../types";

const props = defineProps<{
  buyer: Buyer;
  attendees: Attendee[];
  payment: Payment;
  event: EventDetails;
}>();

const emit = defineEmits(["back", "confirm"]);

const getTicket = (id: number | null) =>
  props.event?.tickets?.find((x) => x.id === id);

const getTicketName = (id: number | null) => {
  const t = getTicket(id);
  return t ? t.ticket_name : "N/A";
};

const getTicketPrice = (id: number | null) => {
  const t = getTicket(id);
  if (!t) return 0;
  return t.is_free ? 0 : parseFloat(t.price || "0");
};

const getConvenienceFee = (id: number | null) => {
  const t = getTicket(id);
  return t ? parseFloat(t.convenience_fee || "0") : 0;
};

const getAttendeeTotal = (a: Attendee) => {
  const price = getTicketPrice(a.ticket_id);
  const fee = getConvenienceFee(a.ticket_id);
  return (price + fee) * (a.quantity || 1);
};

const subTotal = computed(() => {
  return props.attendees.reduce((sum, a) => {
    const price = getTicketPrice(a.ticket_id);
    return sum + price * (a.quantity || 1);
  }, 0);
});

const totalFee = computed(() => {
  return props.attendees.reduce((sum, a) => {
    const fee = getConvenienceFee(a.ticket_id);
    return sum + fee * (a.quantity || 1);
  }, 0);
});

const totalAmount = computed(() => subTotal.value + totalFee.value);
</script>
