<template>
     <v-card class="mx-auto pa-6 rounded-2xl shadow-lg" >
          <!-- Header Section -->
          <div class="d-flex justify-space-between align-center mb-3">
               <div class="d-flex align-center">
                    <v-avatar size="64" class="mr-3">
                         <img :src="defaultAvatar" alt="User" />
                    </v-avatar>
                    <div>
                         <h4 class="font-weight-medium text-h6 mb-1">{{ user.name }}</h4>
                         <p class="text-body-2 text-grey-darken-1 mb-0">{{ user.email }}</p>
                         <p v-if="user.phone" class="text-body-2 text-grey-darken-1 mb-0">{{ user.phone }}</p>
                    </div>
               </div>

               <v-btn icon size="small" variant="text">
                    <v-icon>mdi-close</v-icon>
               </v-btn>
          </div>

          <!-- Tags Section -->
          <div class="d-flex flex-wrap justify-start mb-4">
               <v-chip color="primary" text-color="white" variant="flat" size="small" class="mr-2 mb-2">
                    <v-icon start size="16">mdi-account-star</v-icon>
                    Event Enthusiast
               </v-chip>

               <v-chip color="success" variant="tonal" size="small" class="mb-2">
                    <v-icon start size="16">mdi-ticket-confirmation</v-icon>
                    {{ user.eventsAttended }} Events Attended
               </v-chip>
          </div>

          <!-- Stats Section -->
          <v-row>
               <v-col cols="4" class="pa-1">
                    <v-sheet class="pa-3 text-center rounded-md bg-grey-lighten-4">
                         <h3 class="text-h6 font-weight-bold mb-1">{{ user.eventsAttended }}</h3>
                         <p class="text-caption text-grey-darken-1">Events<br />Attended</p>
                    </v-sheet>
               </v-col>

               <v-col cols="4" class="pa-1">
                    <v-sheet class="pa-3 text-center rounded-md bg-grey-lighten-4">
                         <h3 class="text-h6 font-weight-bold mb-1">{{ user.upcomingEvents }}</h3>
                         <p class="text-caption text-grey-darken-1">Upcoming<br />Events</p>
                    </v-sheet>
               </v-col>

               <v-col cols="4" class="pa-1">
                    <v-sheet class="pa-3 text-center rounded-md bg-amber-lighten-5 border">
                         <h3 class="text-h6 font-weight-bold mb-1 text-amber-darken-2">₹{{ user.totalSpent }}</h3>
                         <p class="text-caption text-grey-darken-1">Total<br />Spent</p>
                    </v-sheet>
               </v-col>
          </v-row>
     </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import api from '@/plugins/axios';

const user = ref({
     name: '',
     email: '',
     phone: '',
     eventsAttended: 0,
     upcomingEvents: 0,
     totalSpent: 0
});

const defaultAvatar = '/src/assets/images/users/avatar-1.png';

onMounted(async () => {
     try {
          const res = await api.get('/user/overview');

          const data = res.data.data;

          user.value = {
               name: data.user_details.name,
               email: data.user_details.email,
               phone: data.user_details.phone_no,
               eventsAttended: data.eventsAttended,
               upcomingEvents: data.upcomingEvents,
               totalSpent: data.totalSpent,
          };
     } catch (err) {
          console.error('Error fetching user data:', err);
     }
});
</script>

<style scoped>
.v-card {
     background-color: #fff;
}

.text-caption {
     line-height: 1.2;
}
</style>
