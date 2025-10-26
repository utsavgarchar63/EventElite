<script setup lang="ts">
import { router } from '@/router';
import { useEventStore } from '@/store/eventStore';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const store = useEventStore();
const copied = ref(false);
const eventId = route.query.event_id; // from URL
const goToEventList = () => {
    router.push({ name: "Events" });
};

const toUrlSafeBase64 = (str: string) =>
    btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const seeThisEvent = () => {
    const encoded = toUrlSafeBase64(String(eventId));
    router.push({ name: "EventDetail", query: { id: encoded } });
};

// Copy Event URL
const copyEventUrl = () => {
    const encoded = toUrlSafeBase64(String(eventId));
    const url = `${window.location.origin}/user/events/detail?id=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
        copied.value = true;
        setTimeout(() => (copied.value = false), 2000); // reset after 2s
    });
};
</script>
<template>
    <div class="authentication">
        <v-container fluid class="pa-0 ma-0 d-flex align-center justify-center"
            style="min-height: 100vh; background-color: white">
            <v-card rounded="md" elevation="0" class="px-sm-1 px-0 withbg mx-auto" max-width="500">
                <v-col cols="12" class="text-center">
                    <!-- Checkmark Circle -->
                    <div class="checkmark-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none"
                            stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>

                    <!-- Success Heading -->
                    <h2>Event Created Successfully</h2>
                    <p>Your event has been created successfully. You can check this event now or find it later in the
                        Events tab.</p>

                    <!-- Two Flex Buttons -->
                    <div class="button-group">
                        <v-row class="mt-4">
                            <v-col cols="12" class="d-flex justify-end flex-wrap">
                                <v-btn @click="goToEventList" color="primary" size="large" variant="outlined"
                                    class="mr-2">
                                    Go To Event List
                                </v-btn>
                                <v-btn @click="seeThisEvent" type="submit" color="primary" size="large" class="mr-2">
                                    See This Event
                                </v-btn>
                                <v-btn @click="copyEventUrl" color="success" size="large">
                                    {{ copied ? "Copied!" : "Copy Event URL" }}
                                </v-btn>
                            </v-col>
                        </v-row>
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
