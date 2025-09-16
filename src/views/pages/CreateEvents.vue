<script setup>
// script setup
import { computed, defineAsyncComponent, onUnmounted } from 'vue';
import StepProgress from '@/components/event/StepProgress.vue';
import { useEventStore } from '@/store/eventStore';
import { useSnackbarStore } from '@/store/snackbar';

const store = useEventStore();
const snackbar = useSnackbarStore();

// Lazy load step components by key instead of ID
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

// Get the filtered steps from store
const steps = computed(() => {
    const { basicInfo } = store.formData;
    return [
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
    ]
        .filter((step) => {
            if (step.condition === 'has_speaker') return basicInfo?.has_speaker;
            if (step.condition === 'has_sponsor') return basicInfo?.has_sponsor;
            if (step.condition === 'has_vendor') return basicInfo?.has_vendor;
            return true;
        })
        .map((step, index) => ({
            ...step,
            id: index + 1
        }));
});

// Dynamically pick the active step’s component key
const currentComponent = computed(() => {
    const currentStepObj = steps.value.find((s) => s.id === store.currentStep);
    return currentStepObj ? stepComponents[currentStepObj.key] : null;
});

function submitEvent() {
    console.log('Event Data:', store.formData);
}

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
                        <component :is="currentComponent" />
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
        <v-snackbar
            v-model="useSnackbarStore().snackbar"
            :color="useSnackbarStore().color"
            timeout="4000"
            location="top right"
            transition="slide-x-reverse-transition"
            class="custom-snackbar"
        >
            <div class="snackbar-content">
                <v-icon v-if="useSnackbarStore().color === 'success'" size="22" class="me-1" color="white"> mdi-check-circle </v-icon>
                <v-icon v-else-if="useSnackbarStore().color === 'error'" size="22" class="me-1" color="white"> mdi-alert-circle </v-icon>
                <v-icon v-else size="22" color="white" class="me-1"> mdi-information </v-icon>
                <span class="snackbar-text">{{ useSnackbarStore().message }}</span>
            </div>
        </v-snackbar>
    </v-container>
</template>
