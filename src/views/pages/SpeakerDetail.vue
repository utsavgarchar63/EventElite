<script setup>
import { ref, onMounted } from 'vue';
import CryptoJS from "crypto-js";
import { useRoute } from 'vue-router';
import api from '@/plugins/axios'; // axios instance
import MetricCard from '@/components/dashboard/MetricCard.vue';
import ticketIcon from '@/assets/images/icons/ticket.svg';

const route = useRoute();
const encryptedId = route.params.id;

const decodedId = decodeURIComponent(encryptedId);
const bytes = CryptoJS.AES.decrypt(decodedId, import.meta.env.VITE_SECRET_KEY);
const speakerId = bytes.toString(CryptoJS.enc.Utf8);

// states
const loading = ref(false);
const speaker = ref(null);
const upcomingEvents = ref([]);
const pastEvents = ref([]);
const cancelledEvents = ref([]);
const activeTab = ref('upcoming');

// dialog + form states
const updateDialog = ref(false);
const form = ref({
    name: '',
    email: '',
    phone: ''
});

// Fetch speaker detail API
const fetchSpeakerDetails = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/speakers/info/${speakerId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.data.status) {
            speaker.value = response.data.data.speaker;
            upcomingEvents.value = response.data.data.upcomingEvents;
            pastEvents.value = response.data.data.pastEvents;
            cancelledEvents.value = response.data.data.cancelledEvents;
        }
    } catch (error) {
        console.error('Failed to fetch speaker info:', error);
    } finally {
        loading.value = false;
    }
};

// open dialog and pre-fill form
const openUpdateDialog = () => {
    if (speaker.value) {
        form.value = {
            name: speaker.value.name,
            email: speaker.value.email,
            phone: speaker.value.phone
        };
        updateDialog.value = true;
    }
};

// Update API call
const updateSpeaker = async () => {
    try {
        loading.value = true;
        await api.put(`/speakers/update/${speakerId}`, form.value);
        updateDialog.value = false;
        await fetchSpeakerDetails(); // refresh data
    } catch (error) {
        console.error('Failed to update speaker:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchSpeakerDetails);
</script>
<template>
    <v-container>
        <!-- Loader -->
        <div v-if="loading" class="d-flex justify-center align-center" style="height: 300px">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        </div>

        <div v-else>
            <v-row>
                <!-- User Info -->
                <v-col cols="12" md="4">
                    <v-card class="pa-4" elevation="0" rounded="lg">
                        <div class="d-flex justify-space-between align-center">
                            <h4 class="mb-2 font-weight-bold h3 mb-4">Users Information</h4>
                        </div>
                        <div v-if="speaker">
                            <p class="text-h6 mb-0">{{ speaker.name }}</p>
                            <h3 class="my-4 h5" style="color: #525454">Basic Information</h3>
                            <p class="mb-2">
                                Email address : <br />
                                <strong>{{ speaker.email }}</strong>
                            </p>
                            <p>
                                Phone number : <br />
                                <strong>{{ speaker.phone }}</strong>
                            </p>
                        </div>
                    </v-card>
                </v-col>

                <!-- Total Events Spoken Metric -->
                <v-col cols="12" md="4">
                    <MetricCard v-if="speaker" title="Total Events Spoken" :value="speaker.events_count"
                        :icon="ticketIcon" avatarColor="primary" />
                </v-col>
                <v-col cols="12" md="4" class="d-flex justify-end mt-3">
                    <v-btn color="primary" size="large" @click="openUpdateDialog">Update</v-btn>
                </v-col>
            </v-row>

            <!-- Tabs: Events -->
            <div style="margin-top: 20px; background-color: white; width: 100%; padding: 10px; border-radius: 10px">
                <v-row class="align-center">
                    <v-col>
                        <v-tabs v-model="activeTab" background-color="white" color="primary" slider-color="primary"
                            class="main-tabs">
                            <v-tab value="upcoming" class="text-body-1">Upcoming Events</v-tab>
                            <v-tab value="past" class="text-body-1">Past Events</v-tab>
                            <v-tab value="cancelled" class="text-body-1">Cancelled Events</v-tab>
                        </v-tabs>
                    </v-col>
                </v-row>

                <!-- Tabs Content -->
                <v-window v-model="activeTab">
                    <v-window-item value="upcoming">
                        <v-data-table :headers="[
                            { title: 'Event Name', key: 'event_name' },
                            { title: 'Event Date', key: 'start_datetime' }
                        ]" :items="upcomingEvents" hide-default-footer>
                            <template #item.start_datetime="{ item }">
                                {{ new Date(item.start_datetime).toLocaleDateString() }}
                            </template>
                        </v-data-table>
                    </v-window-item>

                    <v-window-item value="past">
                        <v-data-table :headers="[
                            { title: 'Event Name', key: 'event_name' },
                            { title: 'Event Date', key: 'start_datetime' }
                        ]" :items="pastEvents" hide-default-footer>
                            <template #item.start_datetime="{ item }">
                                {{ new Date(item.start_datetime).toLocaleDateString() }}
                            </template>
                        </v-data-table>
                    </v-window-item>

                    <v-window-item value="cancelled">
                        <v-data-table :headers="[
                            { title: 'Event Name', key: 'event_name' },
                            { title: 'Event Date', key: 'start_datetime' }
                        ]" :items="cancelledEvents" hide-default-footer>
                            <template #item.start_datetime="{ item }">
                                {{ new Date(item.start_datetime).toLocaleDateString() }}
                            </template>
                        </v-data-table>
                    </v-window-item>
                </v-window>
            </div>
        </div>

        <!-- Update Dialog -->
        <v-dialog v-model="updateDialog" max-width="500px">
            <v-card>
                <v-card-title class="text-h4">Update Speaker</v-card-title>
                <v-card-text>
                    <v-label>Name</v-label>
                    <v-text-field v-model="form.name" variant="outlined"></v-text-field>

                    <v-label>Email</v-label>
                    <v-text-field v-model="form.email" variant="outlined"></v-text-field>

                    <v-label>Phone</v-label>
                    <v-text-field v-model="form.phone" variant="outlined"></v-text-field>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn text @click="updateDialog = false">Cancel</v-btn>
                    <v-btn color="primary" @click="updateSpeaker">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<style scoped>
.main-tabs {
    font-weight: 500;
}
</style>
