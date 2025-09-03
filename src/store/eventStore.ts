import { defineStore } from 'pinia';

export const useEventStore = defineStore('event', {
  state: () => ({
    currentStep: 1,
    totalSteps: 10,
    formData: {
      eventType: '',
      basicInfo: {},
      eventDetails: {},
      speakers: [],
      sponsors: [],
      vendors: [],
      organizerInfo: {},
      ticketInfo: {},
      uploadImage: null,
      finalData: {}
    }
  }),
  actions: {
    nextStep() {
      if (this.currentStep < this.totalSteps) this.currentStep++;
    },
    prevStep() {
      if (this.currentStep > 1) this.currentStep--;
    },
    goToStep(step: number) {
      if (step >= 1 && step <= this.totalSteps) this.currentStep = step;
    }
  }
});
