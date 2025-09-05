<template>
     <v-container class="d-flex justify-center align-center" style="min-height: 100vh;">
          <div class="form-wrapper">
               <div class="mb-8">
                    <h4 class="text-h4 font-weight-bold">Basic Information</h4>
                    <p class="mt-1" style="color: #525454;">
                         Please enter the event basic information below.
                    </p>
               </div>

               <!-- Your form -->
               <v-form @submit.prevent="handleSubmit">
                    <v-row>
                         <!-- Event Name -->
                         <v-col cols="12" class="pa-0 pl-2 pl-lg-3 mb-3">
                              <v-label>Event Name</v-label>
                              <v-text-field v-model="eventName" variant="outlined" placeholder="Enter event name"
                                   hide-details="auto" color="primary" :error="!!errors.eventName"
                                   :error-messages="errors.eventName" />
                         </v-col>

                         <!-- Event Type -->
                         <v-col cols="12" class="pa-0 pl-2 pl-lg-3 mb-3">
                              <v-label>Event Type</v-label>
                              <v-select v-model="eventType" :items="['', ...eventTypes]" variant="outlined"
                                   hide-details="auto" color="primary" :error="!!errors.eventType"
                                   :error-messages="errors.eventType">
                                   <template v-slot:selection="{ item }">
                                        <span v-if="!item.value" style="color: #9e9e9e;">Select event type</span>
                                        <span v-else>{{ item.title }}</span>
                                   </template>
                              </v-select>
                         </v-col>

                         <!-- Event Description -->
                         <v-col cols="12" class="pa-0 pl-2 pl-lg-3 mb-3">
                              <v-label>Event Description</v-label>
                              <v-textarea v-model="eventDescription" variant="outlined"
                                   placeholder="Enter event description here" hide-details="auto" color="primary" />
                         </v-col>

                         <!-- Add-ons -->
                         <v-col cols="12" class="pa-0 pl-2 pl-lg-3">
                              <div class="d-flex flex-column">
                                   <v-checkbox v-model="addons.speakers" label="Add Speakers ($29.99)" color="primary"
                                        density="compact" class="ma-0" hide-details />
                                   <v-checkbox v-model="addons.sponsors" label="Add Sponsors ($29.99)" color="primary"
                                        density="compact" class="ma-0" hide-details />
                                   <v-checkbox v-model="addons.vendors" label="Add Vendors ($29.99)" color="primary"
                                        density="compact" class="ma-0" hide-details />
                              </div>
                         </v-col>

                         <!-- Buttons -->
                         <v-col cols="12" class="pa-0 mt-4  pl-2 pl-lg-3 mb-3 d-flex justify-end">
                              <v-btn color="primary" size="large" variant="outlined" class="mr-2" @click="handleCancel">
                                   Cancel
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

<style scoped>
.form-wrapper {
     width: 100%;
     max-width: 500px;
     /* On laptop+ screens */
}

/* On small screens, take full width */
@media (max-width: 600px) {
     .form-wrapper {
          max-width: 100% !important;
     }
}
</style>

<script setup>
import { ref } from "vue";
import { useEventStore } from "@/store/eventStore";

const store = useEventStore();

const eventName = ref("");
const eventType = ref("");
const eventDescription = ref("");
const addons = ref({
     speakers: false,
     sponsors: false,
     vendors: false,
});

const eventTypes = ["Conference", "Workshop", "Seminar", "Webinar"];

const errors = ref({
     eventName: "",
     eventType: "",
});

const validateForm = () => {
     let valid = true;
     errors.value.eventName = "";
     errors.value.eventType = "";

     if (!eventName.value) {
          errors.value.eventName = "Event name is required";
          valid = false;
     }

     if (!eventType.value) {
          errors.value.eventType = "Please select an event type";
          valid = false;
     }

     return valid;
};

const handleSubmit = () => {
     if (!validateForm()) return;

     // Save to store or API
     store.formData.basicInfo = {
          name: eventName.value,
          type: eventType.value,
          description: eventDescription.value,
          addons: addons.value,
     }

     store.nextStep();
};

const handleCancel = () => {
     eventName.value = "";
     eventType.value = "";
     eventDescription.value = "";
     addons.value = { speakers: false, sponsors: false, vendors: false };
     store.prevStep()
};
</script>
