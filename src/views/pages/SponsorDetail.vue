<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/plugins/axios'; // axios instance
import MetricCard from '@/components/dashboard/MetricCard.vue';
import ticketIcon from '@/assets/images/icons/ticket.svg';

const route = useRoute();
const sponsorId = route.params.id; // changed to sponsorId

// states
const loading = ref(false);
const sponsor = ref(null);
const upcomingEvents = ref([]);
const pastEvents = ref([]);
const cancelledEvents = ref([]);
const activeTab = ref('upcoming');

// dialog + form states (if you want to update sponsor info)
const updateDialog = ref(false);
const form = ref({
    business_name: '',
    link: '',
    logo: null // will hold File object
});

// Fetch sponsor detail API
const fetchSponsorDetails = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/sponsors/info/${sponsorId}`);

        if (response.data.status) {
            sponsor.value = response.data.data.sponsor;
            upcomingEvents.value = response.data.data.upcomingEvents;
            pastEvents.value = response.data.data.pastEvents;
            cancelledEvents.value = response.data.data.cancelledEvents;
        }
    } catch (error) {
        console.error('Failed to fetch sponsor info:', error);
    } finally {
        loading.value = false;
    }
};

// open dialog and pre-fill form
const openUpdateDialog = () => {
    if (sponsor.value) {
        form.value = {
            business_name: sponsor.value.business_name,
            link: sponsor.value.link,
            logo: null // don’t preload the file
        };
        updateDialog.value = true;
    }
};

// Update API call (if you implement update endpoint)
const updateSponsor = async () => {
    try {
        loading.value = true;

        // prepare form data
        const fd = new FormData();
        fd.append('business_name', form.value.business_name);
        fd.append('link', form.value.link);

        // only append logo if user selected one
        if (form.value.logo instanceof File) {
            fd.append('logo', form.value.logo);
        }

        // required because Laravel expects PUT via _method in multipart
        fd.append('_method', 'PUT');

        await api.post(`/sponsors/update/${sponsorId}`, fd);

        updateDialog.value = false;
        await fetchSponsorDetails(); // refresh data
    } catch (error) {
        console.error('Failed to update sponsor:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchSponsorDetails);
</script>
<template>
    <v-container>
        <!-- Loader -->
        <div v-if="loading" class="d-flex justify-center align-center" style="height: 300px">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        </div>

        <div v-else>
            <v-row>
                <!-- Sponsor Info -->
                <v-col cols="12" md="4">
                    <v-card class="pa-4" elevation="0" rounded="lg">
                        <div class="d-flex justify-space-between align-center">
                            <h4 class="mb-2 font-weight-bold h3 mb-4">Sponsor Information</h4>
                        </div>
                        <div v-if="sponsor">
                            <p class="text-h6 mb-0">{{ sponsor.business_name }}</p>
                            <h3 class="my-4 h5" style="color: #525454">Basic Information</h3>
                            <p class="mb-2">
                                Website : <br />
                                <strong>
                                    <a :href="sponsor.link" target="_blank">{{ sponsor.link }}</a>
                                </strong>
                            </p>
                            <p v-if="sponsor.logo">
                                Logo : <br />
                                <img
                                    v-if="sponsor.logo"
                                    :src="`https://eventelite-eanm.onrender.com/${sponsor.logo}`"
                                    alt="logo"
                                    width="120"
                                />
                            </p>
                        </div>
                    </v-card>
                </v-col>

                <!-- Total Events Sponsored Metric -->
                <v-col cols="12" md="4">
                    <MetricCard
                        v-if="sponsor"
                        title="Total Events Sponsored"
                        :value="sponsor.events_count"
                        :icon="ticketIcon"
                        avatarColor="primary"
                    />
                </v-col>

                <v-col cols="12" md="4" class="d-flex justify-end mt-3">
                    <v-btn color="primary" size="large" @click="openUpdateDialog">Update</v-btn>
                </v-col>
            </v-row>

            <!-- Tabs: Events -->
            <div style="margin-top: 20px; background-color: white; width: 100%; padding: 10px; border-radius: 10px">
                <v-row class="align-center">
                    <v-col>
                        <v-tabs v-model="activeTab" background-color="white" color="primary" slider-color="primary" class="main-tabs">
                            <v-tab value="upcoming" class="text-body-1">Upcoming Events</v-tab>
                            <v-tab value="past" class="text-body-1">Past Events</v-tab>
                            <v-tab value="cancelled" class="text-body-1">Cancelled Events</v-tab>
                        </v-tabs>
                    </v-col>
                </v-row>

                <!-- Tabs Content -->
                <v-window v-model="activeTab">
                    <v-window-item value="upcoming">
                        <v-data-table
                            :headers="[
                                { title: 'Event Name', key: 'event_name' },
                                { title: 'Event Date', key: 'start_datetime' },
                                { title: 'Venue', key: 'venue' }
                            ]"
                            :items="upcomingEvents"
                            hide-default-footer
                        >
                            <template #item.start_datetime="{ item }">
                                {{ new Date(item.start_datetime).toLocaleDateString() }}
                            </template>
                        </v-data-table>
                    </v-window-item>

                    <v-window-item value="past">
                        <v-data-table
                            :headers="[
                                { title: 'Event Name', key: 'event_name' },
                                { title: 'Event Date', key: 'start_datetime' },
                                { title: 'Venue', key: 'venue' }
                            ]"
                            :items="pastEvents"
                            hide-default-footer
                        >
                            <template #item.start_datetime="{ item }">
                                {{ new Date(item.start_datetime).toLocaleDateString() }}
                            </template>
                        </v-data-table>
                    </v-window-item>

                    <v-window-item value="cancelled">
                        <v-data-table
                            :headers="[
                                { title: 'Event Name', key: 'event_name' },
                                { title: 'Event Date', key: 'start_datetime' },
                                { title: 'Venue', key: 'venue' }
                            ]"
                            :items="cancelledEvents"
                            hide-default-footer
                        >
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
                <v-card-title class="text-h4">Update Sponsor</v-card-title>
                <v-card-text>
                    <v-label>Business Name</v-label>
                    <v-text-field v-model="form.business_name" variant="outlined"></v-text-field>

                    <v-label>Website Link</v-label>
                    <v-text-field v-model="form.link" variant="outlined"></v-text-field>

                    <v-label>Logo</v-label>
                    <input type="file" accept="image/*" @change="(e) => (form.logo = e.target.files[0])" />
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn text @click="updateDialog = false">Cancel</v-btn>
                    <v-btn color="primary" @click="updateSponsor">Save</v-btn>
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
