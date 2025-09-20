<template>
  <v-container class="d-flex justify-center align-center" style="min-height: 100vh;">
    <div class="form-wrapper">
      <div class="mb-8">
        <h4 class="text-h4 font-weight-bold">Event Details</h4>
        <p class="mt-1" style="color: #525454;">
          Please provide the details of the event.
        </p>
      </div>

      <v-form @submit.prevent="handleSubmit">
        <v-row>
          <!-- Start Date -->
          <v-col cols="12" md="6" class="pa-0 pr-md-2 mb-3">
            <v-label>Start Date</v-label>
            <div class="vuetify-flatpickr">
              <FlatPickr v-model="startDate" :config="dateConfig" placeholder="Select Start Date" />
            </div>
          </v-col>

          <!-- End Date -->
          <v-col cols="12" md="6" class="pa-0 pl-md-2 mb-3">
            <v-label>End Date</v-label>
            <div class="vuetify-flatpickr">
              <FlatPickr v-model="endDate" :config="dateConfig" placeholder="Select End Date" />
            </div>
          </v-col>

          <!-- Start Time -->
          <v-col cols="12" md="6" class="pa-0 pr-md-2 mb-3">
            <v-label>Start Time</v-label>
            <div class="vuetify-flatpickr">
              <FlatPickr v-model="startTime" :config="timeConfig" placeholder="Select Start Time" />
            </div>
          </v-col>

          <!-- End Time -->
          <v-col cols="12" md="6" class="pa-0 pl-md-2 mb-3">
            <v-label>End Time</v-label>
            <div class="vuetify-flatpickr">
              <FlatPickr v-model="endTime" :config="timeConfig" placeholder="Select End Time" />
            </div>
          </v-col>

          <!-- Venue -->
          <v-col cols="12" class="pa-0 mb-3">
            <v-label>Venue</v-label>
            <v-text-field v-model="venue" placeholder="Enter venue name" variant="outlined" hide-details="auto"
              color="primary" />
          </v-col>

          <!-- Location -->
          <v-col cols="12" class="pa-0 mb-3">
            <v-label>Location</v-label>
            <v-textarea v-model="location" style="border-radius: 8px;" placeholder="Enter event location"
              variant="outlined" hide-details="auto" color="primary" />
          </v-col>

          <!-- Buttons -->
          <v-col cols="12" class="pa-0 d-flex justify-end">
            <v-btn color="primary" size="large" variant="outlined" class="mr-2" @click="handleCancel">
              Go Back
            </v-btn>
            <v-btn type="submit" color="primary" size="large">
              Save & Next
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useEventStore } from "@/store/eventStore";
import { useSnackbarStore } from "@/store/snackbar";
import api from "@/plugins/axios";
import FlatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

const store = useEventStore();
const snackbar = useSnackbarStore();
const startDate = ref(store.formData.eventDetails?.start_datetime ? new Date(store.formData.eventDetails.start_datetime) : null);
const endDate = ref(store.formData.eventDetails?.end_datetime ? new Date(store.formData.eventDetails.end_datetime) : null);

// Extract time in "HH:MM" format if stored
const startTime = ref(
  store.formData.eventDetails?.start_datetime
    ? store.formData.eventDetails.start_datetime.split(" ")[1].slice(0, 5)
    : null
);
const endTime = ref(
  store.formData.eventDetails?.end_datetime
    ? store.formData.eventDetails.end_datetime.split(" ")[1].slice(0, 5)
    : null
);

const venue = ref(store.formData.eventDetails?.venue || "");
const location = ref(store.formData.eventDetails?.venue_address || "");


// Flatpickr configs
const dateConfig = { dateFormat: "Y-m-d", allowInput: true };
const timeConfig = { enableTime: true, noCalendar: true, dateFormat: "H:i", time_24hr: true, allowInput: true };

// Handle errors
const handleBackendErrors = (error) => {
  if (error.response?.data?.errors) {
    const messages = Object.values(error.response.data.errors).flat();
    snackbar.show(messages.join(", "), "error");
  } else {
    snackbar.show("Something went wrong. Please try again.", "error");
  }
};

// Submit form
const handleSubmit = async () => {
  try {
    const formatDateTime = (date, time) => {
      const d = new Date(date);
      const [hours, minutes] = time.split(":");
      d.setHours(hours, minutes, 0, 0);
      return d.toISOString().slice(0, 19).replace("T", " ");
    };

    const payload = {
      event_id: store.formData.eventType.id,
      start_datetime: formatDateTime(startDate.value, startTime.value),
      end_datetime: formatDateTime(endDate.value, endTime.value),
      venue: venue.value,
      venue_address: location.value,
    };

    const res = await api.post("/events/details", payload);

    if (res.data.status) {
      store.formData.eventDetails = payload;
      store.nextStep();
    } else {
      snackbar.show(res.data.message || "Failed to save event details", "error");
    }
  } catch (err) {
    handleBackendErrors(err);
  }
};

// Cancel form
const handleCancel = () => {
  startDate.value = null;
  endDate.value = null;
  startTime.value = null;
  endTime.value = null;
  venue.value = "";
  location.value = "";
  store.prevStep();
};
</script>

<style scoped>
.vuetify-flatpickr input {
  width: 100%;
  height: 56px;
  padding: 0 16px;
  border: 1px solid #c7c7c7;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background: #fff;
  transition: border-color 0.2s ease;
}

.vuetify-flatpickr input:focus {
  border-color: #1976d2;
  outline: none;
  box-shadow: 0 0 0 1px #1976d2;
}

.vuetify-flatpickr input::placeholder {
  color: #9e9e9e;
}
</style>
