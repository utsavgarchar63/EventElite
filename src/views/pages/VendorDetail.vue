<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import CryptoJS from "crypto-js";
import api from '@/plugins/axios'; // axios instance
import MetricCard from '@/components/dashboard/MetricCard.vue';
import ticketIcon from '@/assets/images/icons/ticket.svg';

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY; 
const route = useRoute();
const encryptedId = route.params.id;

// Decode & decrypt
const decodedId = decodeURIComponent(encryptedId);
const bytes = CryptoJS.AES.decrypt(decodedId, SECRET_KEY);
const vendorId = bytes.toString(CryptoJS.enc.Utf8);
// states
const loading = ref(false);
const vendor = ref(null);
const upcomingEvents = ref([]);
const pastEvents = ref([]);
const cancelledEvents = ref([]);
const activeTab = ref('upcoming');

// dialog + form states
const updateDialog = ref(false);
const form = ref({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    business_link: '',
    logo: null
});

// Fetch vendor detail
const fetchVendorDetails = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/vendors/info/${vendorId}`);

        if (response.data.status) {
            vendor.value = response.data.data.vendor;
            upcomingEvents.value = response.data.data.upcomingEvents;
            pastEvents.value = response.data.data.pastEvents;
            cancelledEvents.value = response.data.data.cancelledEvents;
        }
    } catch (error) {
        console.error('Failed to fetch vendor info:', error);
    } finally {
        loading.value = false;
    }
};

// Open dialog and prefill form
const openUpdateDialog = () => {
    if (vendor.value) {
        form.value = {
            business_name: vendor.value.business_name || '',
            contact_name: vendor.value.contact_name || '',
            email: vendor.value.email || '',
            phone: vendor.value.phone || '',
            business_link: vendor.value.business_link || '',
            logo: null // do not preload file
        };
        updateDialog.value = true;
    }
};

// Update API call
const updateVendor = async () => {
    loading.value = true;
    try {
        const fd = new FormData();
        fd.append('business_name', form.value.business_name);
        fd.append('contact_name', form.value.contact_name);
        fd.append('email', form.value.email);
        fd.append('phone', form.value.phone);
        fd.append('business_link', form.value.business_link);

        if (form.value.logo instanceof File) {
            fd.append('logo', form.value.logo);
        }

        fd.append('_method', 'PUT');

        await api.post(`/vendors/update/${vendorId}`, fd);

        updateDialog.value = false;
        await fetchVendorDetails(); // refresh
    } catch (error) {
        console.error('Failed to update vendor:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchVendorDetails);
</script>

<template>
    <v-container>
        <!-- Loader -->
        <div v-if="loading" class="d-flex justify-center align-center" style="height: 300px">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        </div>

        <div v-else>
            <v-row>
                <!-- Vendor Info -->
                <v-col cols="12" md="4">
                    <v-card class="pa-4" elevation="2" rounded="lg">
                        <v-card-title class="text-h5 font-weight-bold mb-2">Vendor Information</v-card-title>
                        <v-divider></v-divider>

                        <v-card-text v-if="vendor">
                            <v-row>
                                <v-col cols="12">
                                    <span class="text-subtitle-1 font-weight-medium">Business Name:</span>
                                    <span class="ml-2">{{ vendor.business_name }}</span>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12">
                                    <span class="text-subtitle-1 font-weight-medium">Contact Name:</span>
                                    <span class="ml-2">{{ vendor.contact_name }}</span>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12">
                                    <span class="text-subtitle-1 font-weight-medium">Email:</span>
                                    <span class="ml-2">{{ vendor.email }}</span>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12">
                                    <span class="text-subtitle-1 font-weight-medium">Phone:</span>
                                    <span class="ml-2">{{ vendor.phone }}</span>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12">
                                    <span class="text-subtitle-1 font-weight-medium">Website:</span>
                                    <a :href="vendor.business_link" target="_blank" class="ml-2 text-primary">{{ vendor.business_link }}</a>
                                </v-col>
                            </v-row>

                            <v-row v-if="vendor.logo">
                                <v-col cols="12">
                                    <span class="text-subtitle-1 font-weight-medium">Logo:</span>
                                    <v-img
                                        :src="`https://eventelite-eanm.onrender.com/${vendor.logo}`"
                                        alt="logo"
                                        max-width="120"
                                        class="mt-2"
                                        contain
                                    ></v-img>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- Total Events Metric -->
                <v-col cols="12" md="4">
                    <MetricCard
                        v-if="vendor"
                        title="Total Events Sponsored"
                        :value="vendor.events_count"
                        :icon="ticketIcon"
                        avatarColor="primary"
                    />
                </v-col>

                <v-col cols="12" md="4" class="d-flex justify-end mt-3">
                    <v-btn color="primary" size="large" @click="openUpdateDialog">Update</v-btn>
                </v-col>
            </v-row>

            <!-- Tabs: Events -->
            <div class="mt-4" style="background-color: white; padding: 10px; border-radius: 10px">
                <v-tabs v-model="activeTab" background-color="white" color="primary" slider-color="primary" class="main-tabs">
                    <v-tab value="upcoming">Upcoming Events</v-tab>
                    <v-tab value="past">Past Events</v-tab>
                    <v-tab value="cancelled">Cancelled Events</v-tab>
                </v-tabs>

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
                <v-card-title class="text-h4">Update Vendor</v-card-title>
                <v-card-text>
                    <v-text-field v-model="form.business_name" label="Business Name" variant="outlined"></v-text-field>
                    <v-text-field v-model="form.contact_name" label="Contact Name" variant="outlined"></v-text-field>
                    <v-text-field v-model="form.email" label="Email" variant="outlined"></v-text-field>
                    <v-text-field v-model="form.phone" label="Phone" variant="outlined"></v-text-field>
                    <v-text-field v-model="form.business_link" label="Website Link" variant="outlined"></v-text-field>
                    <v-label>Logo</v-label>
                    <input type="file" accept="image/*" @change="(e) => (form.logo = e.target.files[0])" />
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn text @click="updateDialog = false">Cancel</v-btn>
                    <v-btn color="primary" :loading="loading" @click="updateVendor">Save</v-btn>
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
