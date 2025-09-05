<template>
     <v-container class="d-flex justify-center align-center" style="min-height: 100vh;">
          <div class="form-wrapper">
               <div class="mb-8">
                    <h4 class="text-h4 font-weight-bold">Event Details</h4>
                    <p class="mt-1" style="color: #525454;">
                         Please provide the details of the event.
                    </p>
               </div>

               <!-- Event Details Form -->
               <v-form @submit.prevent="handleSubmit">
                    <v-row>
                         <!-- Start Date -->
                         <v-col cols="12" md="6" class="pa-0 pr-md-2 mb-3">
                              <v-label>Start Date</v-label>
                              <v-menu v-model="startDateMenu" :close-on-content-click="false"
                                   transition="scale-transition" offset-y>
                                   <template #activator="{ props }">
                                        <v-text-field v-bind="props" v-model="startDateFormatted"
                                             placeholder="Select Start Date" variant="outlined" 
                                             hide-details readonly append-inner-icon="mdi-calendar" />
                                   </template>
                                   <v-date-picker v-model="startDate" @update:model-value="formatStartDate" />
                              </v-menu>
                         </v-col>

                         <!-- End Date -->
                         <v-col cols="12" md="6" class="pa-0 pl-md-2 mb-3">
                              <v-label>End Date</v-label>
                              <v-menu v-model="endDateMenu" :close-on-content-click="false"
                                   transition="scale-transition" offset-y>
                                   <template #activator="{ props }">
                                        <v-text-field v-bind="props" v-model="endDateFormatted"
                                             placeholder="Select End Date" variant="outlined" 
                                             hide-details readonly append-inner-icon="mdi-calendar" />
                                   </template>
                                   <v-date-picker v-model="endDate" @update:model-value="formatEndDate" />
                              </v-menu>
                         </v-col>

                         <!-- Start Time -->
                         <v-col cols="12" md="6" class="pa-0 pr-md-2 mb-3">
                              <v-label>Start Time</v-label>
                              <v-menu v-model="startTimeMenu" :close-on-content-click="false"
                                   transition="scale-transition" offset-y max-width="290">
                                   <template #activator="{ props }">
                                        <v-text-field v-bind="props" v-model="startTimeFormatted"
                                             placeholder="Select Start Time" readonly
                                             append-inner-icon="mdi-clock-outline" variant="outlined" 
                                             hide-details />
                                   </template>

                                   <v-time-picker v-model="startTime" format="ampm" @update:model-value="val => {
                                        startTimeFormatted = val;
                                   }" />
                              </v-menu>
                         </v-col>

                         <!-- End Time -->
                         <v-col cols="12" md="6" class="pa-0 pl-md-2 mb-3">
                              <v-label>End Time</v-label>
                              <v-menu v-model="endTimeMenu" :close-on-content-click="false"
                                   transition="scale-transition" offset-y max-width="290">
                                   <template #activator="{ props }">
                                        <v-text-field v-bind="props" v-model="endTimeFormatted"
                                             placeholder="Select End Time" readonly
                                             append-inner-icon="mdi-clock-outline" variant="outlined" 
                                             hide-details />
                                   </template>

                                   <v-time-picker v-model="endTime" format="ampm" @update:model-value="val => {
                                        endTimeFormatted = val;
                                   }" />
                              </v-menu>
                         </v-col>




                         <!-- Venue -->
                         <v-col cols="12" class="pa-0 mb-3">
                              <v-label>Venue</v-label>
                              <v-text-field v-model="venue" placeholder="Enter venue name" variant="outlined"
                                   hide-details="auto" color="primary" />
                         </v-col>

                         <!-- Location -->
                         <v-col cols="12" class="pa-0 mb-3">
                              <v-label>Location</v-label>
                              <v-textarea v-model="location" style="border-radius: 8px;" placeholder="Enter event location" variant="outlined"
                                   hide-details="auto" color="primary" />
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

const store = useEventStore();

const startDateMenu = ref(false);
const endDateMenu = ref(false);
const startTimeMenu = ref(false);
const endTimeMenu = ref(false);

const startDate = ref(null);
const endDate = ref(null);
const startTime = ref('');
const endTime = ref('');
const venue = ref("");
const location = ref("");


const startDateFormatted = ref("");
const endDateFormatted = ref("");
const startTimeFormatted = ref('');
const endTimeFormatted = ref('');

// Formatters
const formatStartDate = (val) => {
     startDateFormatted.value = new Date(val).toLocaleDateString();
};
const formatEndDate = (val) => {
     endDateFormatted.value = new Date(val).toLocaleDateString();
};
const formatStartTime = (val) => {
     startTimeFormatted.value = val;
};
const formatEndTime = (val) => {
     endTimeFormatted.value = val;
};

const handleSubmit = () => {
     // Save to store or API
     store.formData.eventDetails = {
          startDate: startDate.value,
          endDate: endDate.value,
          startTime: startTime.value,
          endTime: endTime.value,
          venue: venue.value,
          location: location.value,
     };

     store.nextStep();
};

const handleCancel = () => {
     startDate.value = "";
     endDate.value = "";
     startTime.value = "";
     endTime.value = "";
     venue.value = "";
     location.value = "";
     store.prevStep();
};
</script>

<style scoped>
.form-wrapper {
     width: 100%;
     max-width: 500px;
}

/* On small screens */
@media (max-width: 600px) {
     .form-wrapper {
          max-width: 100% !important;
     }
}
</style>
