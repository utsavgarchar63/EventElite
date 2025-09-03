<template>
     <v-container>
          <div class="mb-5">
               <h4 class="text-h4 font-weight-bold">Event Type</h4>
               <p class="mt-1" style="color: #525454;">Select event type to proceed</p>
          </div>

          <v-row>
               <v-col cols="12" sm="6" md="4" v-for="(event, index) in eventTypes" :key="index">
                    <v-card :class="['event-card', { 'selected-card': selectedEvent === event.title }]">
                         <v-img :src="event.image" height="140" class="mb-4" style="border-radius: 8px; margin: 15px;"
                              cover />
                         <v-card-title style="font-weight:700; font-size:18px;">
                              {{ event.title }}
                         </v-card-title>
                         <v-card-subtitle class="mb-2">{{ event.subtitle }}</v-card-subtitle>
                         <v-list density="compact">
                              <v-list-item v-for="(feature, i) in event.features" :key="i" class="feature-item">
                                   {{ feature }}
                              </v-list-item>
                         </v-list>

                         <v-card-actions>
                              <v-btn color="primary" size="large" variant="outlined" block class="event-btn"
                                   @click="selectEvent(event.title)">
                                   <span class="btn-text">Get Started</span>
                                   <span class="btn-price">&nbsp;{{ event.price }}</span>
                              </v-btn>
                         </v-card-actions>
                    </v-card>
               </v-col>
          </v-row>
     </v-container>
</template>

<script setup>
import { ref } from 'vue'
import enterpriceEventImg from "@/assets/images/events/enterprice.webp"
import growingEventImg from "@/assets/images/events/growing.webp"
import freeEventImg from "@/assets/images/events/free.webp"
import { useEventStore } from '@/store/eventStore'

const selectedEvent = ref('')
const store = useEventStore()

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
          image: freeEventImg,
          price: 'Free'
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
          image: growingEventImg,
          price: '$299'
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
          image: enterpriceEventImg,
          price: '$499'
     }
])

const selectEvent = (eventName) => {
     store.formData.eventType = eventName
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

/* Card hover effect */
.event-card {
     border: 0.5px solid #949BBC;
     border-radius: 8px !important;
     transition: border-color 0.3s;
}

.event-card:hover {
     border: 1.5px solid rgb(var(--v-theme-primary)) !important;
}

/* Selected card always primary */
.selected-card {
     border: 1.5px solid rgb(var(--v-theme-primary)) !important;
}

/* Button hover → change to filled */
.event-btn {
     transition: all 0.3s;
     position: relative;
     display: flex;
     justify-content: center;
     align-items: center;
     gap: 5px;
}

/* Price hidden initially with smooth transition */
.btn-price {
     display: none;
     transform: translateX(5px);
     transition: 0.3s ease, transform 0.3s ease;
}

/* On hover: price fades in + slides */
.event-btn:hover {
     background-color: rgb(var(--v-theme-primary));
     color: white !important;
     border-color: rgb(var(--v-theme-primary));
}

.event-btn:hover .btn-price {
     display: block;
     transform: translateX(0);
}
</style>
