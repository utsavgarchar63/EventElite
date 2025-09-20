import { defineStore } from 'pinia';

export const useEventStore = defineStore('event', {
    state: () => ({
        currentStep: 1,
        totalSteps: 10,
        formData: {
            eventType: {},
            basicInfo: {},
            eventDetails: {},
            speakers: [
                {
                    id: null,
                    selectedId: null,
                    name: '',
                    email: '',
                    phone: '',
                    location: '',
                    startDate: null,
                    endDate: null,
                    startFormatted: '',
                    endFormatted: '',
                    startMenu: false,
                    endMenu: false,
                    isSelected: false,
                }
            ],
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
            // this.saveToLocalStorage();
        },
        prevStep() {
            if (this.currentStep > 1) this.currentStep--;
            // this.saveToLocalStorage();
        },
        goToStep(step: number) {
            if (step >= 1 && step <= this.totalSteps) {
                this.currentStep = step;
                // this.saveToLocalStorage();
            }
        },

        addSpeaker() {
            this.formData.speakers.push({
                id: null,
                selectedId: null,
                name: '',
                email: '',
                phone: '',
                location: '',
                startDate: null,
                endDate: null,
                startFormatted: '',
                endFormatted: '',
                startMenu: false,
                endMenu: false,
                isSelected: false
            });
            // this.saveToLocalStorage();
        },
        resetSpeakers() {
            this.formData.speakers = [
                {
                    id: null,
                    selectedId: null,
                    name: '',
                    email: '',
                    phone: '',
                    location: '',
                    startDate: null,
                    endDate: null,
                    startFormatted: '',
                    endFormatted: '',
                    startMenu: false,
                    endMenu: false,
                    isSelected: false
                }
            ];
            // this.saveToLocalStorage();
        },

        // 🔹 Save state to localStorage
        // saveToLocalStorage() {
        //   localStorage.setItem('eventStore', JSON.stringify(this.$state));
        // },

        // // 🔹 Load state from localStorage
        // loadFromLocalStorage() {
        //   const data = localStorage.getItem('eventStore');
        //   if (data) {
        //     this.$patch(JSON.parse(data));
        //   }
        // },

        resetAll() {
            localStorage.removeItem('eventStore');
            this.$reset();
        }
    }
});
