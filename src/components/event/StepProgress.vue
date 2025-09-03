<template>
     <div class="stepper-container">
          <div v-for="(step, index) in steps" :key="step.id" class="step-wrapper">
               <div class="step-line" v-if="index !== 0"></div>

               <div class="step-circle" :class="{
                    active: store.currentStep === step.id,
                    completed: store.currentStep > step.id
               }" @click="store.goToStep(step.id)">
                    <v-icon v-if="store.currentStep > step.id" size="20">mdi-check</v-icon>
                    <span v-else>{{ step.id }}</span>
               </div>
               <div class="step-title" :class="{ 'active-title': store.currentStep === step.id }">
                    {{ step.title }}
               </div>

          </div>
     </div>
</template>

<script setup lang="ts">
import { useEventStore } from '@/store/eventStore';

const store = useEventStore();

const steps = [
     { id: 1, title: 'Event Type' },
     { id: 2, title: 'Basic Info' },
     { id: 3, title: 'Event Details' },
     { id: 4, title: 'Speakers' },
     { id: 5, title: 'Sponsors' },
     { id: 6, title: 'Vendors' },
     { id: 7, title: 'Organizer Info' },
     { id: 8, title: 'Ticket Info' },
     { id: 9, title: 'Upload Image' },
     { id: 10, title: 'Create Event' }
];
</script>
<style scoped>
.stepper-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin: 30px 0;
}

.step-wrapper {
  text-align: center;
  position: relative;
  flex: 1; /* On desktop, each step takes equal space */
}

.step-line {
  position: absolute;
  top: 20px;
  left: -50%;
  width: 100%;
  height: 2px;
  background-color: #ddd;
  z-index: 0;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 2px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  position: relative;
  z-index: 1;
  margin: 0 auto;
  cursor: pointer;
}

.step-circle.active {
  border-color: #2563eb;
  color: #2563eb;
}

.step-circle.completed {
  background: #70CF97;
  color: white;
  border-color: #70CF97;
  font-weight: bold;
}

.step-title {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 400;
  color: #525454;
}

.step-title.active-title {
  font-weight: 500;
  color: black;
}

/* ✅ Mobile: Enable horizontal scroll */
@media (max-width: 1366px) {
  .stepper-container {
    justify-content: flex-start;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }

  .stepper-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }

  .step-wrapper {
    flex: 0 0 auto; /* Don't shrink */
    width: 120px; /* Each step fixed width for scrolling */
  }

  .step-title {
    font-size: 12px;
  }

  .step-circle {
    width: 35px;
    height: 35px;
  }
}

</style>
