<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import StepProgress from '@/components/event/StepProgress.vue';
import { useEventStore } from '@/store/eventStore';
import { useSnackbarStore } from '@/store/snackbar';
import api from '@/plugins/axios';

const store = useEventStore();
const snackbar = useSnackbarStore();
const route = useRoute();
const loading = ref(false);

// Lazy load step components
const stepComponents = {
    eventType: defineAsyncComponent(() => import('@/components/event/steps/EventType.vue')),
    basicInfo: defineAsyncComponent(() => import('@/components/event/steps/BasicInfo.vue')),
    eventDetails: defineAsyncComponent(() => import('@/components/event/steps/EventDetails.vue')),
    speakers: defineAsyncComponent(() => import('@/components/event/steps/Speakers.vue')),
    sponsors: defineAsyncComponent(() => import('@/components/event/steps/Sponsors.vue')),
    vendors: defineAsyncComponent(() => import('@/components/event/steps/Vendors.vue')),
    organizerInfo: defineAsyncComponent(() => import('@/components/event/steps/OrganizerInfo.vue')),
    ticketInfo: defineAsyncComponent(() => import('@/components/event/steps/TicketInfo.vue')),
    uploadImage: defineAsyncComponent(() => import('@/components/event/steps/UploadImage.vue')),
    paymentSummary: defineAsyncComponent(() => import('@/components/event/steps/PaymentSummary.vue'))
};

// Filter steps based on conditions
const steps = computed(() => {
    const { basicInfo } = store.formData;
    const eventId = route.query.id;

    const allSteps = [
        { id: 1, title: 'Event Type', key: 'eventType' },
        { id: 2, title: 'Basic Info', key: 'basicInfo' },
        { id: 3, title: 'Event Details', key: 'eventDetails' },
        { id: 4, title: 'Speakers', key: 'speakers', condition: 'has_speaker' },
        { id: 5, title: 'Sponsors', key: 'sponsors', condition: 'has_sponsor' },
        { id: 6, title: 'Vendors', key: 'vendors', condition: 'has_vendor' },
        { id: 7, title: 'Organizer Info', key: 'organizerInfo' },
        { id: 8, title: 'Ticket Info', key: 'ticketInfo' },
        { id: 9, title: 'Upload Image', key: 'uploadImage' },
        { id: 10, title: 'Payment Summary', key: 'paymentSummary' }
    ];

    return allSteps
        .filter((step) => {
            // Hide "Event Type" only if editing
            if (eventId && step.key === 'eventType') return false;

            if (step.condition === 'has_speaker') return basicInfo?.has_speaker;
            if (step.condition === 'has_sponsor') return basicInfo?.has_sponsor;
            if (step.condition === 'has_vendor') return basicInfo?.has_vendor;
            return true;
        })
        .map((step, index) => ({
            ...step,
            id: index + 1 // renumber steps
        }));
});


// Dynamically pick the active step component
const currentComponent = computed(() => {
    const currentStepObj = steps.value.find((s) => s.id === store.currentStep);
    return currentStepObj ? stepComponents[currentStepObj.key] : null;
});

// Handle submit
function submitEvent() {
    console.log('Event Data:', store.formData);
}

// Load event data if id is present in URL
onMounted(async () => {
    const eventId = route.query.id;
    if (eventId) {
        loading.value = true;
        try {
            const res = await api.get(`/event-detail/${eventId}`);
            const data = res.data.data;

            store.formData.eventType = data.event_type || {};
            store.formData.basicInfo = {
                event_id: data.id,
                event_name: data.event_name,
                event_type: data.event_type,
                description: data.description,
                has_speaker: data.has_speaker,
                has_vendor: data.has_vendor,
                has_sponsor: data.has_sponsor
            } || {};
            store.formData.eventDetails = {
                event_id: data?.details?.event_id || {},
                start_datetime: data.details.start_datetime,
                end_datetime: data.details.end_datetime,
                venue: data.details.venue,
                venue_address: data.details.venue_address,
            } || {};
            store.formData.speakers = data.speakers?.length ? data.speakers : store.formData.speakers;
            store.formData.sponsors = data.sponsors || [];
            store.formData.vendors = data.vendors || [];
            store.formData.organizerInfo = data.organizerInfo || {};
            store.formData.ticketInfo = data.ticketInfo || {};
            store.formData.uploadImage = data.uploadImage || null;
            store.formData.finalData = data.finalData || {};

            store.currentStep = 1;

            snackbar.show?.('Event loaded successfully', 'success');
        } catch (err) {
            console.error(err);
            snackbar.show?.('Error loading event details', 'error');
        } finally {
            loading.value = false;
        }
    }
});


onUnmounted(() => {
    store.formData = {};  // clear all form data
    store.currentStep = 1; // reset to first step
    snackbar.clear();
});

// Clear snackbar when leaving page
onUnmounted(() => {
    snackbar.clear();
});
</script>

<template>
    <v-container class="pa-0">
        <v-row>
            <v-col cols="12">
                <div class="pa-4 pa-md-6 pa-lg-8 rounded-lg" style="background: white; min-height: 300px">
                    <h3 class="text-h5 text-sm-h4 text-md-h3 font-weight-bold mb-4">Create Event</h3>

                    <!-- Stepper -->
                    <StepProgress />

                    <!-- Step Content -->
                    <div class="mt-6">
                        <component v-if="!loading" :is="currentComponent" />
                        <div v-else class="text-center py-6">
                            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                        </div>
                    </div>


                    <!-- Navigation Buttons -->
                    <!--
          <div class="d-flex justify-space-between mt-4 flex-wrap gap-2">
            <v-btn :disabled="store.currentStep === 1" @click="store.prevStep">Previous</v-btn>
            <v-btn v-if="store.currentStep < store.totalSteps" @click="store.nextStep">Next</v-btn>
            <v-btn v-else color="primary" @click="submitEvent">Submit</v-btn>
          </div>
          -->
                </div>
            </v-col>
        </v-row>

        <v-snackbar v-model="useSnackbarStore().snackbar" :color="useSnackbarStore().color" timeout="4000"
            location="top right" transition="slide-x-reverse-transition" class="custom-snackbar">
            <div class="snackbar-content">
                <v-icon v-if="useSnackbarStore().color === 'success'" size="22" class="me-1"
                    color="white">mdi-check-circle</v-icon>
                <v-icon v-else-if="useSnackbarStore().color === 'error'" size="22" class="me-1"
                    color="white">mdi-alert-circle</v-icon>
                <v-icon v-else size="22" color="white" class="me-1">mdi-information</v-icon>
                <span class="snackbar-text">{{ useSnackbarStore().message }}</span>
            </div>
        </v-snackbar>
    </v-container>
</template>
