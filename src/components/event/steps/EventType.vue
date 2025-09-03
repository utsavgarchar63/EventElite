<template>
     <v-container>
          <div class="mb-5">
               <h4 class="text-h4 font-weight-bold ">Event Type</h4>
               <p class="mt-1" style="color: #525454;">Select event type to proceed</p>
          </div>
          <v-row>
               <v-col cols="12" sm="6" md="4" v-for="(event, index) in eventTypes" :key="index">
                    <v-card class="pa-1" :class="{ 'selected-card': selectedEvent === event.title }"
                         style="border : 0.5px solid #949BBC; border-radius: 8px !important;">
                         <v-img :src="event.image" height="140" class="mb-4" style="border-radius: 8px; margin: 15px;"
                              cover />
                         <v-card-title style="font-weight:700; font-size:18px;">{{ event.title }}</v-card-title>
                         <v-card-subtitle class="mb-2">{{ event.subtitle }}</v-card-subtitle>
                         <v-list density="compact">
                              <v-list-item v-for="(feature, i) in event.features" :key="i" class="feature-item">
                                   {{ feature }}
                              </v-list-item>
                         </v-list>

                         <v-card-actions>
                              <v-btn color="primary" variant="outlined" block @click="selectEvent(event.title)">
                                   Get Started
                              </v-btn>
                         </v-card-actions>
                    </v-card>

               </v-col>
          </v-row>

          <!-- <div class="mt-6">
               <h5>Selected Event: {{ selectedEvent }}</h5>
          </div> -->
     </v-container>
</template>

<script setup>
import { ref } from 'vue'
import enterpriceEventImg from "@/assets/images/events/enterprice.webp"
import growingEventImg from "@/assets/images/events/growing.webp"
import freeEventImg from "@/assets/images/events/free.webp"
import { useEventStore } from '@/store/eventStore'
const selectedEvent = ref('')
const store = useEventStore();
const eventTypes = ref([
     {
          title: 'Free Events',
          subtitle: 'Ideal for community gatherings and small events',
          features: [
               'Create free custom events',
               'Access multiple templates',
               'Drafts and event scheduling',
               'Mobile application',
               'Instant Setup'
          ],
          image: freeEventImg
     },
     {
          title: 'Growing Events',
          subtitle: 'Perfect for events with up to 200 paid attendees',
          features: [
               'All Free Events features',
               'Analytics',
               'Ticket confirmation and money reconciliation',
               'QR code scanner'
          ],
          image: growingEventImg
     },
     {
          title: 'Enterprise Events',
          subtitle: 'Designed for large-scale events with 200+ attendees',
          features: [
               'All Growing Events features',
               'Dedicated account manager',
               'Priority support',
               'Custom branding and integrations (upon request)'
          ],
          image: enterpriceEventImg
     }
])

const selectEvent = (eventName) => {
     selectedEvent.value = eventName;
     store.nextStep()
}
</script>

<style>
.feature-item {
     color: #525454;
     min-height: auto !important;
}

.feature-item::before {
     content: "•";
     margin-left: 0px;
     padding-right: 10px;
     color: #555;
}

.selected-card {
     border: 1.5px solid rgb(var(--v-theme-primary)) !important;
}
</style>