<template>
  <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
    <div class="form-wrapper">
      <div class="mb-8">
        <h4 class="text-h2 font-weight-bold">Speakers</h4>
        <p class="mt-1" style="color: #525454">Please provide the list of speakers of the event.</p>
      </div>

      <v-form @submit.prevent="handleSubmit" class="ms-lg-3">

        <!-- Multi-select to add existing speakers -->
        <v-col cols="12" class="pa-2">
          <v-select
            v-model="selectedSpeakers"
            :items="allSpeakers"
            item-title="name"
            item-value="id"
            label="Select Speakers"
            dense
            multiple
            chips
            variant="outlined"
            @update:modelValue="handleSelectedSpeakers"
          />
        </v-col>

        <!-- Speaker rows -->
        <v-row v-for="(speaker, index) in speakers" :key="index" class="mb-4">
          <!-- Header with Delete -->
          <v-col cols="12" class="pa-0 mb-3">
            <div class="d-flex justify-space-between align-center">
              <h4 class="font-weight-bold text-h4">Speaker {{ index + 1 }}</h4>
              <v-btn icon color="error" @click="removeSpeaker(index)" v-if="speakers.length > 1">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-col>

          <!-- Name -->
          <v-col cols="12" md="6" class="pa-2">
            <v-text-field
              label="Name"
              placeholder="John Doe"
              v-model="speaker.name"
              :readonly="speaker.isSelected"
              :disabled="speaker.isSelected"
              variant="outlined"
            />
          </v-col>

          <!-- Email -->
          <v-col cols="12" md="6" class="pa-2">
            <v-text-field
              label="Email"
              placeholder="john@gmail.com"
              v-model="speaker.email"
              :readonly="speaker.isSelected"
              :disabled="speaker.isSelected"
              variant="outlined"
            />
          </v-col>

          <!-- Phone -->
          <v-col cols="12" md="6" class="pa-2">
            <v-text-field
              label="Phone Number"
              placeholder="xxx-xxx-xxxx"
              v-model="speaker.phone"
              :readonly="speaker.isSelected"
              :disabled="speaker.isSelected"
              variant="outlined"
            />
          </v-col>

          <!-- Location -->
          <v-col cols="12" md="6" class="pa-2">
            <v-text-field
              label="Location"
              placeholder="Room 101"
              v-model="speaker.location"
              variant="outlined"
            />
          </v-col>

          <!-- Start datetime -->
          <v-col cols="12" md="6" class="pa-2">
            <div class="vuetify-flatpickr">
              <FlatPickr
                v-model="speaker.startFormatted"
                class="vuetify-flatpickr"
                :config="{ enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true }"
                placeholder="Select Start Date & Time"
              />
            </div>
          </v-col>

          <!-- End datetime -->
          <v-col cols="12" md="6" class="pa-2">
            <div class="vuetify-flatpickr">
              <FlatPickr
                v-model="speaker.endFormatted"
                class="vuetify-flatpickr"
                :config="{ enableTime: true, dateFormat: 'Y-m-d H:i', time_24hr: true }"
                placeholder="Select End Date & Time"
              />
            </div>
          </v-col>
        </v-row>

        <!-- Add custom speaker manually -->
        <div @click="addSpeaker" class="d-flex align-center mb-4" style="cursor: pointer">
          <v-btn icon color="primary" class="mr-2">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <h4 class="text-primary mb-0">Add More Speakers</h4>
        </div>

        <v-row class="mt-4">
          <v-col cols="12" class="d-flex justify-end">
            <v-btn color="primary" size="large" variant="outlined" class="mr-2" @click="handleCancel">Go Back</v-btn>
            <v-btn type="submit" color="primary" size="large">Save & Next</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
  </v-container>
</template>

<script setup>
import FlatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { ref, onMounted } from 'vue'
import { useEventStore } from '@/store/eventStore'
import { useSnackbarStore } from '@/store/snackbar'
import api from '@/plugins/axios'

const store = useEventStore()
const snackbar = useSnackbarStore()

// Main speakers array for form
const speakers = ref(
  store.formData.speakers?.length
    ? store.formData.speakers.map(s => ({
        ...s,
        selectedId: s.id || s.selectedId || null,
        startFormatted: s.startDate ? new Date(s.startDate) : null,
        endFormatted: s.endDate ? new Date(s.endDate) : null,
        isSelected: !!s.id
      }))
    : [
        {
          id: null,
          selectedId: null,
          name: '',
          email: '',
          phone: '',
          location: '',
          startFormatted: null,
          endFormatted: null,
          isSelected: false
        }
      ]
)
store.formData.speakers = speakers.value

const allSpeakers = ref([])
const selectedSpeakers = ref([])

// fetch existing speakers
const fetchSpeakers = async () => {
  try {
    const res = await api.get('/events/get-speakers')
    if (res.data.success) allSpeakers.value = res.data.data
  } catch (err) {
    snackbar.show('Failed to fetch speakers', 'error')
  }
}

// handle add/remove via multi-select
const handleSelectedSpeakers = newVal => {
  // add newly selected speakers to the speakers list
  newVal.forEach(id => {
    const already = speakers.value.find(s => s.id === id || s.selectedId === id)
    if (!already) {
      const sp = allSpeakers.value.find(s => s.id === id)
      if (sp) {
        speakers.value.push({
          id: sp.id,
          selectedId: sp.id,
          name: sp.name,
          email: sp.email,
          phone: sp.phone,
          location: sp.location || '',
          startFormatted: null,
          endFormatted: null,
          isSelected: true
        })
      }
    }
  })

  // remove speakers from list if unselected
  speakers.value = speakers.value.filter(s => (s.id ? newVal.includes(s.id) : true))
}

const addSpeaker = () => {
  speakers.value.push({
    id: null,
    selectedId: null,
    name: '',
    email: '',
    phone: '',
    location: '',
    startFormatted: null,
    endFormatted: null,
    isSelected: false
  })
}

const removeSpeaker = index => speakers.value.splice(index, 1)

const handleCancel = () => {
  store.prevStep()
}

const handleSubmit = async () => {
  try {
    const payload = {
      event_id: store.formData.basicInfo.id,
      speakers: speakers.value.map(s => ({
        id: s.selectedId || s.id || null,
        name: s.name,
        email: s.email,
        phone: s.phone,
        location: s.location,
        start_datetime: s.startFormatted
          ? new Date(s.startFormatted).toISOString().slice(0, 19).replace('T', ' ')
          : null,
        end_datetime: s.endFormatted
          ? new Date(s.endFormatted).toISOString().slice(0, 19).replace('T', ' ')
          : null
      }))
    }

    const res = await api.post('/events/speakers', payload)
    if (res.data.status) {
      store.formData.speakers = res.data.data
      store.nextStep()
    }
  } catch (err) {
    if (err.response?.data?.errors) {
      const apiErrors = err.response.data.errors
      const messages = Object.values(apiErrors).flat().join('\n')
      snackbar.show(messages, 'error')
    } else {
      snackbar.show('Something went wrong', 'error')
    }
  }
}

onMounted(() => fetchSpeakers())
</script>

<style scoped>
.vuetify-flatpickr input {
  width: 100%;
  height: 56px;
  padding: 0 16px;
  border: 1px solid #c7c7c7;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background: #fff;
  transition: border-color 0.2s ease;
}

.vuetify-flatpickr input:focus {
  border-color: #1976d2;
  outline: none;
  box-shadow: 0 0 0 1px #1976d2;
}

.vuetify-flatpickr input::placeholder {
  color: #9e9e9e;
}

.form-wrapper {
  width: 100%;
  max-width: 750px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  /* box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05); */
}

.v-label {
  font-weight: 600;
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
  display: block;
}

@media (max-width: 768px) {
  .form-wrapper {
    padding: 16px;
    margin: 0 12px;
  }
}
</style>
