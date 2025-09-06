<template>
     <v-container class="d-flex justify-center align-center" style="min-height: 100vh;">
          <div class="form-wrapper">
               <div class="mb-8">
                    <h4 class="text-h2 font-weight-bold">Speakers</h4>
                    <p class="mt-1" style="color: #525454;">
                         Please provide the list of speakers of the event.
                    </p>
               </div>

               <v-form @submit.prevent="handleSubmit" class="ms-lg-3">
                    <v-row v-for="(speaker, index) in store.formData.speakers" :key="index" class="mb-1">
                         <v-col cols="12 pa-0 mb-3">
                              <h4 class="font-weight-bold text-h4">Speaker {{ index + 1 }}</h4>
                         </v-col>

                         <v-col cols="12" md="6" class="pa-0 ma-0 pe-lg-2">
                              <v-text-field v-model="speaker.name" label="Name" variant="outlined" />
                         </v-col>
                         <v-col cols="12" md="6" class="pa-0 ma-0 ps-lg-2">
                              <v-text-field v-model="speaker.email" label="Email" variant="outlined" />
                         </v-col>

                         <v-col cols="12" md="6" class="pa-0 ma-0 pe-lg-2">
                              <v-text-field v-model="speaker.phone" label="Phone Number" placeholder="xxx-xxx-xxxx"
                                   variant="outlined" />
                         </v-col>
                         <v-col cols="12" md="6" class="pa-0 ma-0 ps-lg-2">
                              <v-text-field v-model="speaker.location" label="Location" variant="outlined" />
                         </v-col>

                         <v-col cols="12" md="6" class="pa-0 ma-0 pe-lg-2">
                              <v-menu v-model="speaker.startMenu" :close-on-content-click="false"
                                   transition="scale-transition" offset-y max-width="290">
                                   <template #activator="{ props }">
                                        <v-text-field v-bind="props" v-model="speaker.startFormatted"
                                             label="Start Date Time" readonly append-inner-icon="mdi-calendar"
                                             variant="outlined" />
                                   </template>
                                   <v-date-picker v-model="speaker.startDate"
                                        @update:model-value="val => formatDate(val, speaker, 'start')" />
                              </v-menu>
                         </v-col>

                         <v-col cols="12" md="6" class="pa-0 ma-0 ps-lg-2">
                              <v-menu v-model="speaker.endMenu" :close-on-content-click="false"
                                   transition="scale-transition" offset-y max-width="290">
                                   <template #activator="{ props }">
                                        <v-text-field v-bind="props" v-model="speaker.endFormatted"
                                             label="End Date Time" readonly append-inner-icon="mdi-calendar"
                                             variant="outlined" />
                                   </template>
                                   <v-date-picker v-model="speaker.endDate"
                                        @update:model-value="val => formatDate(val, speaker, 'end')" />
                              </v-menu>
                         </v-col>
                    </v-row>

                    <v-btn icon color="primary" class="mb-4" @click="store.addSpeaker">
                         <v-icon>mdi-plus</v-icon>
                    </v-btn>

                    <v-row class="mt-4">
                         <v-col cols="12" class="d-flex justify-end">
                              <v-btn color="primary" size="large" variant="outlined" class="mr-2"
                                   @click="handleCancel">Go Back</v-btn>
                              <v-btn type="submit" color="primary" size="large">Save & Next</v-btn>
                         </v-col>
                    </v-row>
               </v-form>
          </div>
     </v-container>
</template>
<script setup>
import { useEventStore } from '@/store/eventStore';
import { ref } from 'vue';

const store = useEventStore();

// Reference speakers directly from the store
const speakers = ref(store.formData.speakers.length
     ? store.formData.speakers
     : [
          {
               name: '',
               email: '',
               phone: '',
               location: '',
               startDate: null,
               endDate: null,
               startFormatted: '',
               endFormatted: '',
               startMenu: false,
               endMenu: false,
          },
     ]
);

// keep store updated reactively
store.formData.speakers = speakers.value;

const addSpeaker = () => {
     speakers.value.push({
          name: '',
          email: '',
          phone: '',
          location: '',
          startDate: null,
          endDate: null,
          startFormatted: '',
          endFormatted: '',
          startMenu: false,
          endMenu: false,
     });

     // sync with store
     store.formData.speakers = speakers.value;
};


const formatDate = (val, speaker, type) => {
     const formatted = new Date(val).toLocaleString();
     if (type === 'start') speaker.startFormatted = formatted;
     else speaker.endFormatted = formatted;
};

const handleSubmit = () => {
     store.nextStep();
};

const handleCancel = () => {
     store.resetSpeakers();
};
</script>

<style scoped>
.form-wrapper {
     width: 100%;
     max-width: 700px;
}

@media (max-width: 600px) {
     .form-wrapper {
          max-width: 100% !important;
     }
}
</style>
