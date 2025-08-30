<script setup lang="ts">
import CommonLayout from '@/components/auth/CommonLayout.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const goToLogin = () => {
     router.push("/auth/login");
};
</script>

<template>
     <div class="authentication">
          <v-container fluid class="pa-0 ma-0">
               <v-row no-gutters>

                    <!-- Left column: Fixed Login Form -->
                    <v-col cols="12" md="6" class="reset-password-success-fixed">
                         <v-card rounded="md" elevation="0" class="px-sm-1 px-0 withbg mx-auto" max-width="500">
                              <v-col cols="12" class="text-center">
                                   <div class="checkmark-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"
                                             viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                                             stroke-linecap="round" stroke-linejoin="round">
                                             <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                   </div>
                                   <h2>Password Reset</h2>
                                   <p>Your password has been reset successfully. Click below to login.</p>

                                   <v-btn @click="goToLogin" color="primary" size="large" block flat>
                                        Log in
                                   </v-btn>

                              </v-col>
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
/* Custom green checkmark */
.checkmark-wrapper {
     width: 60px;
     height: 60px;
     background: #70CF97;
     /* Green */
     border-radius: 50%;
     display: flex;
     align-items: center;
     justify-content: center;
     box-shadow: 0 0 15px #70CF97;
     margin: 0 auto 20px;
     position: relative;
}

.checkmark {
     color: #fff;
     font-size: 36px;
     font-weight: bold;
     line-height: 1;
}

.reset-password-success-fixed {
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

h2 {
     font-family: "Poppins", sans-serif;
     font-weight: 700;
     font-style: bold;
     font-size: 24px;
     line-height: 32.36px;
     letter-spacing: 0%;
     text-align: center;
     text-transform: capitalize;
     margin-bottom: 10px;
}

/* Description text */
p {
     font-family: "Inter", sans-serif;
     font-weight: 400;
     font-style: normal;
     font-size: 14px;
     color: #525454;
     line-height: 22.65px;
     letter-spacing: 0%;
     text-align: center;
     margin-bottom: 20px;
}

</style>