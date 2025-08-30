<script setup lang="ts">
/* Components */
import VerifyOTPForm from '@/components/auth/VerifyOtpForm.vue';
import CommonLayout from '@/components/auth/CommonLayout.vue';

</script>

<template>
     <div class="authentication">
          <v-container fluid class="pa-0 ma-0">
               <v-row no-gutters>

                    <v-col cols="12" md="6" class="verify-otp-fixed">
                         <v-card rounded="md" elevation="0" class="px-sm-1 px-0 withbg mx-auto" max-width="500">
                              <v-card-item class="pa-sm-8">
                                   <h2 class="mb-2">Enter verification code</h2>
                                   <VerifyOTPForm />
                              </v-card-item>
                         </v-card>
                    </v-col>

                    <!-- Right column: Scrollable or dynamic content -->
                    <v-col cols="12" md="6" class="d-flex align-center justify-center">
                         <CommonLayout />
                    </v-col>

               </v-row>
          </v-container>
     </div>
</template>

<style scoped>
.verify-otp-fixed {
     position: sticky;
     /* Keeps it fixed relative to container */
     top: 0;
     height: 100vh;
     /* Full viewport height */
     display: flex;
     align-items: center;
     justify-content: center;
     background-color: #fff;
     /* Optional: keep consistent background */
     z-index: 10;
}
</style>