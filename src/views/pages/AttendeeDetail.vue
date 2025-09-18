<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/plugins/axios'; // axios instance
import MetricCard from '@/components/dashboard/MetricCard.vue';
import ticketIcon from '@/assets/images/icons/ticket.svg';

const route = useRoute();
const attendeeId = route.params.id;

// states
const loading = ref(false);
const attendee = ref(null);
const txnHistory = ref([]);
const upcomingEvents = ref([]);
const pastEvents = ref([]);
const cancelledEvents = ref([]);
const activeTab = ref('upcoming');

// Fetch attendee detail
const fetchAttendeeDetails = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/attendees/info/${attendeeId}`);
        if (response.data.status) {
            attendee.value = response.data.data.attendee;
            txnHistory.value = response.data.data.txn_history;
            upcomingEvents.value = response.data.data.upcomingEvents;
            pastEvents.value = response.data.data.pastEvents;
            cancelledEvents.value = response.data.data.cancelledEvents;
        }
    } catch (error) {
        console.error('Failed to fetch attendee info:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchAttendeeDetails);
</script>

<template>
    <v-container>
        <!-- Loader -->
        <div v-if="loading" class="d-flex justify-center align-center" style="height: 300px">
            <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        </div>

        <div v-else>
            <v-row>
                <!-- Attendee Info -->
                <v-col cols="12" md="4">
                    <v-card class="pa-4" elevation="2" rounded="lg">
                        <v-card-title class="text-h5 font-weight-bold mb-2">Attendee Information</v-card-title>
                        <v-divider></v-divider>
                        <v-card-text v-if="attendee">
                            <v-row>
                                <v-col cols="12">
                                    <span class="text-subtitle-1 font-weight-medium">Name:</span>
                                    <span class="ml-2">{{ attendee.name }}</span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <span class="text-subtitle-1 font-weight-medium">Email:</span>
                                    <span class="ml-2">{{ attendee.email }}</span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <span class="text-subtitle-1 font-weight-medium">Phone:</span>
                                    <span class="ml-2">{{ attendee.phone }}</span>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- Metrics -->
                <v-col cols="12" md="4">
                    <MetricCard title="Events Attended" :value="attendee?.events_attended || 0" :icon="ticketIcon" avatarColor="primary" />
                </v-col>
                <v-col cols="12" md="4">
                    <MetricCard title="Total Spend" :value="attendee?.total_spend || 0" :icon="ticketIcon" avatarColor="success" />
                </v-col>
            </v-row>

            <!-- Tabs: Events Attended -->
            <div class="mt-4" style="background-color: white; padding: 10px; border-radius: 10px">
                <v-tabs v-model="activeTab" background-color="white" color="primary" slider-color="primary" class="main-tabs">
                    <v-tab value="upcoming">Upcoming Events</v-tab>
                    <v-tab value="past">Past Events</v-tab>
                    <v-tab value="cancelled">Cancelled Events</v-tab>
                    <v-tab value="txn">Transaction History</v-tab>
                </v-tabs>

                <v-window v-model="activeTab">
                    <!-- Upcoming Events -->
                    <v-window-item value="upcoming">
                        <v-data-table
                            :headers="[
                                { title: 'Event Name', key: 'event_name' },
                                { title: 'Event Date', key: 'event_date' },
                                { title: 'Tickets', key: 'total_tickets' },
                                { title: 'Amount', key: 'amount' },
                                { title: 'Status', key: 'status' }
                            ]"
                            :items="upcomingEvents"
                            hide-default-footer
                        >
                            <template #item.event_date="{ item }">
                                {{ new Date(item.event_date).toLocaleDateString() }}
                            </template>
                        </v-data-table>
                    </v-window-item>

                    <!-- Past Events -->
                    <v-window-item value="past">
                        <v-data-table
                            :headers="[
                                { title: 'Event Name', key: 'event_name' },
                                { title: 'Event Date', key: 'event_date' },
                                { title: 'Tickets', key: 'total_tickets' },
                                { title: 'Amount', key: 'amount' },
                                { title: 'Status', key: 'status' }
                            ]"
                            :items="pastEvents"
                            hide-default-footer
                        >
                            <template #item.event_date="{ item }">
                                {{ new Date(item.event_date).toLocaleDateString() }}
                            </template>
                        </v-data-table>
                    </v-window-item>

                    <!-- Cancelled Events -->
                    <v-window-item value="cancelled">
                        <v-data-table
                            :headers="[
                                { title: 'Event Name', key: 'event_name' },
                                { title: 'Event Date', key: 'event_date' },
                                { title: 'Tickets', key: 'total_tickets' },
                                { title: 'Amount', key: 'amount' },
                                { title: 'Status', key: 'status' }
                            ]"
                            :items="cancelledEvents"
                            hide-default-footer
                        >
                            <template #item.event_date="{ item }">
                                {{ new Date(item.event_date).toLocaleDateString() }}
                            </template>
                        </v-data-table>
                    </v-window-item>

                    <!-- Transaction History -->
                    <v-window-item value="txn">
                        <v-data-table
                            :headers="[
                                { title: 'Txn ID', key: 'txn_id' },
                                { title: 'Event Name', key: 'event_name' },
                                { title: 'Txn Date', key: 'txn_date' },
                                { title: 'Method', key: 'method' },
                                { title: 'Amount', key: 'amount' },
                                { title: 'Status', key: 'status' }
                            ]"
                            :items="txnHistory"
                            hide-default-footer
                        >
                            <template #item.txn_date="{ item }">
                                {{ new Date(item.txn_date).toLocaleDateString() }}
                            </template>
                        </v-data-table>
                    </v-window-item>
                </v-window>
            </div>
        </div>
    </v-container>
</template>

<style scoped>
.main-tabs {
    font-weight: 500;
}
</style>
