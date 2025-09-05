<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import StepProgress from '@/components/event/StepProgress.vue';
import { useEventStore } from '@/store/eventStore';

const store = useEventStore();

// Lazy load step components
const stepComponents: Record<number, any> = {
  1: defineAsyncComponent(() => import('@/components/event/steps/EventType.vue')),
  2: defineAsyncComponent(() => import('@/components/event/steps/BasicInfo.vue')),
  3: defineAsyncComponent(() => import('@/components/event/steps/EventDetails.vue')),
  // ...other steps
};

const currentComponent = computed(() => stepComponents[store.currentStep]);

function submitEvent() {
  console.log('Event Data:', store.formData);
}
</script>

<template>
  <v-container class="pa-0">
    <v-row>
      <v-col cols="12">
        <div class="pa-4 pa-md-6 pa-lg-8 rounded-lg" style="background: white; min-height: 300px;">
          <h3 class="text-h5 text-sm-h4 text-md-h3 font-weight-bold mb-4">
            Create Event
          </h3>

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
  </v-container>
</template>
