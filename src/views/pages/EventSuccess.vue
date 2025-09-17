<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

// Navigate to Event List page
const goToEventList = () => {
    router.push('/admin/events'); // change to your event list route
};

// Navigate to this specific Event page
const seeThisEvent = () => {
    router.push('/events/123'); // dynamically replace 123 with your event ID
};
</script>
<template>
    <div class="authentication">
        <v-container fluid class="pa-0 ma-0 d-flex align-center justify-center" style="min-height: 100vh; background-color: white">
            <v-card rounded="md" elevation="0" class="px-sm-1 px-0 withbg mx-auto" max-width="500">
                <v-col cols="12" class="text-center">
                    <!-- Checkmark Circle -->
                    <div class="checkmark-wrapper">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>

                    <!-- Success Heading -->
                    <h2>Event Created Successfully</h2>
                    <p>Your event has been created successfully. You can check this event now or find it later in the Events tab.</p>

                    <!-- Two Flex Buttons -->
                    <div class="button-group">
                        <v-row class="mt-4">
                            <v-col cols="12" class="d-flex justify-end">
                                <v-btn @click="goToEventList" color="primary" size="large" variant="outlined" class="mr-2">
                                    Go To Event List
                                </v-btn>
                                <v-btn @click="seeThisEvent" type="submit" color="primary" size="large">See This Event</v-btn>
                            </v-col>
                        </v-row>
                        <!-- <v-btn @click="goToEventList" color="primary" size="large" flat block> Go To Event List </v-btn>
                        <v-btn @click="seeThisEvent" color="success" size="large" flat block> See This Event </v-btn> -->
                    </div>
                </v-col>
            </v-card>
        </v-container>
    </div>
</template>
<style scoped>
.checkmark-wrapper {
    width: 60px;
    height: 60px;
    background: #70cf97;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 15px #70cf97;
    margin: 0 auto 20px;
}

h2 {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 24px;
    text-align: center;
    margin-bottom: 10px;
}

p {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #525454;
    text-align: center;
    margin-bottom: 20px;
    line-height: 22.65px;
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

@media (min-width: 600px) {
    .button-group {
        flex-direction: row;
        justify-content: center;
    }
    .button-group .v-btn {
        flex: 1;
    }
}
</style>
