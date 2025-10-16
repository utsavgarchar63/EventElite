// /src/store/userEventStore.ts
import { defineStore } from "pinia";

export const useUserEventStore = defineStore("userEventStore", {
  state: () => ({
    selectedEvent: null as any
  }),

  actions: {
    setSelectedEvent(event: any) {
      this.selectedEvent = event;
    },
    clearSelectedEvent() {
      this.selectedEvent = null;
    }
  }
});
