<template>
  <v-container fluid>
    <div v-if="!event" class="d-flex justify-center align-center" style="height: 200px;">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <div v-else>
      <!-- Banner Section (same as your current) -->
      <div style="position: relative;">
        <v-img :src="bannerImage" height="300" class="rounded-lg mb-4" cover>
          <template #error>
            <v-img :src="bannerImage || defaultEventImg" @error="onBannerImageError" height="300"
              class="rounded-lg mb-4" cover />
          </template>
        </v-img>

        <div style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 0.5rem;
              background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%);
            "></div>

        <v-chip color="white" size="small" class="text-body-2 font-weight-bold" style="
              position: absolute;
              background-color: rgba(255, 255, 255, 0.3);
              top: 15px;
              left: 15px;
              color: #fff;
            " label>
          {{ event.event_type || "Event" }}
        </v-chip>

        <div style="
              position: absolute;
              bottom: 15px;
              left: 20px;
              color: white;
            ">
          <h1 class="text-h1 font-weight-bold mb-2">
            {{ event.event_name }}
          </h1>

          <div class="d-flex align-center flex-wrap" style="gap: 15px; font-size: 14px;">
            <div class="d-flex align-center">
              <v-icon size="18" class="me-1" color="white">mdi-calendar-blank-outline</v-icon>
              <span>
                {{ formatDate(event.start_datetime) }} -
                {{ formatDate(event.details?.end_datetime) }}
              </span>
            </div>

            <div class="d-flex align-center">
              <v-icon size="18" class="me-1" color="white">mdi-map-marker-outline</v-icon>
              <span>{{ event?.venue_address || "N/A" }}</span>
            </div>
          </div>

          <v-btn size="small" color="white" class="mt-3" style="color: #0a0a0a; font-weight: 600;"
            prepend-icon="mdi-calendar-plus-outline">
            Add to Calendar
          </v-btn>
        </div>
      </div>
      <!-- Stepper -->
      <div class="d-flex justify-center">
        <div class="stepper-container my-6">
          <div v-for="(step, index) in steps" :key="step.id" class="step-wrapper">
            <div class="step-line" v-if="index !== 0"></div>
            <div class="step-circle" :class="{ active: currentStep === step.id, completed: currentStep > step.id }"
              @click="goToStep(step.id)">
              <v-icon v-if="currentStep > step.id" size="20">mdi-check</v-icon>
              <span v-else>{{ step.id }}</span>
            </div>
            <div class="step-title" :class="{ 'active-title': currentStep === step.id }">{{ step.title }}</div>
          </div>
        </div>
      </div>

      <BookingStep v-if="currentStep === 1" :buyer="buyer" :attendees="attendees" :payment="payment" :event="event"
        @next="goToStep(2)" @addAttendee="addAttendee" />

      <SummaryStep v-if="currentStep === 2" :buyer="buyer" :attendees="attendees" :payment="payment" :event="event"
        @back="goToStep(1)" @confirm="submitBooking" />

      <SuccessStep v-if="currentStep === 3" :event="event" @done="goToEvents" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserEventStore } from "@/store/userEventStore";
import { useRouter } from "vue-router";
import defaultEventImg from "@/assets/images/events/banner.webp";
import api from "@/plugins/axios";
import BookingStep from "@/components/user/steps/BookingStep.vue";
import SummaryStep from "@/components/user/steps/SummaryStep.vue";
import SuccessStep from "@/components/user/steps/SuccessStep.vue";
import type { Attendee, Buyer, Payment } from "@/components/user/types";

const router = useRouter();
const store = useUserEventStore();
const event = store.selectedEvent;
const bannerImage = ref(event?.banner || defaultEventImg);

const currentStep = ref(1);
const steps = [
  { id: 1, title: "Booking Details" },
  { id: 2, title: "Summary" },
  { id: 3, title: "Success" },
];

const buyer = ref<Buyer>({ name: "", email: "", phone: "" });
const attendees = ref<Attendee[]>([
  { name: "", email: "", phone_no: "", ticket_id: null, quantity: 1 }
]);
const payment = ref<Payment>({
  card_number: "",
  expiry_month: "",
  expiry_year: "",
  card_holder_name: "",
  cvv: ""
});
const goToStep = (stepId: number) => {
  currentStep.value = stepId;
};

const onBannerImageError = () => {
  bannerImage.value = defaultEventImg;
};

const submitBooking = async () => {
  try {
    const payload = { buyer: buyer.value, event_id: event.id, payment: payment.value, attendees: attendees.value };
    console.log(payload,'<<<<<<<<<<<<<payload')
    await api.post("/tickets/purchase", payload);
    currentStep.value = 3;
  } catch (err) {
    alert("Booking failed!");
  }
};

const goToEvents = () => router.push("/user/events");


const addAttendee = () => {
  attendees.value.push({
    name: "",
    email: "",
    phone_no: "",
    ticket_id: null,
    quantity: 1,
  });
};

console.log(event.tickets,"<event")

const formatDate = (date: string) => date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
</script>


<style scoped>
.stepper-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin: 30px 0;
}

.step-wrapper {
  text-align: center;
  position: relative;
  flex: 1;
  /* On desktop, each step takes equal space */
}

.step-line {
  position: absolute;
  top: 20px;
  left: -50%;
  width: 100%;
  height: 2px;
  background-color: #ddd;
  z-index: 0;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  position: relative;
  z-index: 1;
  margin: 0 auto;
  cursor: pointer;
}

.step-circle.active {
  border-color: #2563eb;
  color: #2563eb;
}

.step-circle.completed {
  background: #70cf97;
  color: white;
  border-color: #70cf97;
  font-weight: bold;
}

.step-title {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 400;
  color: #525454;
}

.step-title.active-title {
  font-weight: 500;
  color: black;
}

/* ✅ Mobile: Enable horizontal scroll */
@media (max-width: 1366px) {
  .stepper-container {
    justify-content: flex-start;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    /* Firefox */
  }

  .stepper-container::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari */
  }

  .step-wrapper {
    flex: 0 0 auto;
    /* Don't shrink */
    width: 120px;
    /* Each step fixed width for scrolling */
  }

  .step-title {
    font-size: 12px;
  }

  .step-circle {
    width: 35px;
    height: 35px;
  }
}
</style>
