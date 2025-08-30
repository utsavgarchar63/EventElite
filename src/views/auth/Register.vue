<script setup lang="ts">
import RegisterForm from '@/components/auth/RegisterForm.vue';
import CommonLayout from '@/components/auth/CommonLayout.vue';
</script>
<template>
    <div class="authentication">
        <v-container fluid class="pa-0 ma-0">
            <v-row no-gutters>

                <!-- Left column: Fixed Login Form -->
                <v-col cols="12" md="6" class="register-fixed">
                    <v-card rounded="md" elevation="0" class="px-sm-1 px-0 withbg mx-auto" max-width="500">
                        <v-card-item class="pa-sm-8">
                            <h2 class="mb-2 font-weight-bold">Create Account</h2>
                            <div class="text-body-1 text-muted mb-3">
                                Enter your details below to create your account.
                            </div>
                            <RegisterForm />
                            <h6 class="text-h6 mt-8 text-muted font-weight-medium d-flex justify-center align-center mt-3">
                                Already have an account?
                                <RouterLink to="/auth/login"
                                    class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium pl-2">
                                    Login
                                </RouterLink>
                            </h6>
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
.register-fixed {
    position: sticky;
    /* Keeps it fixed relative to container */
    top: 0;
    /* height: 100vh; */
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
     margin-bottom: 20px;
}
</style>