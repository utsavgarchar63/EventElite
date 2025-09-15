<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <div class="form-wrapper">
            <div class="mb-8">
                <h4 class="text-h2 font-weight-bold">Speakers</h4>
                <p class="mt-1" style="color: #525454">Please provide the list of speakers of the event.</p>
            </div>

            <v-form @submit.prevent="handleSubmit" class="ms-lg-3">
                <v-row v-for="(speaker, index) in store.formData.speakers" :key="index" class="mb-1">
                    <v-col cols="12 pa-0 mb-3">
                        <h4 class="font-weight-bold text-h4">Speaker {{ index + 1 }}</h4>
                    </v-col>

                    <v-col cols="12" md="6" class="pa-0 ma-0 pe-lg-2">
                        <v-label>Name</v-label>
                        <v-text-field placeholder="John Doe" v-model="speaker.name" variant="outlined" />
                    </v-col>
                    <v-col cols="12" md="6" class="pa-0 ma-0 ps-lg-2">
                        <v-label>Email</v-label>
                        <v-text-field v-model="speaker.email" placeholder="john@gmail.com" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="6" class="pa-0 ma-0 pe-lg-2">
                        <v-label>Phone Number</v-label>
                        <v-text-field v-model="speaker.phone" placeholder="xxx-xxx-xxxx" variant="outlined" />
                    </v-col>
                    <v-col cols="12" md="6" class="pa-0 ma-0 ps-lg-2">
                        <v-label>Location</v-label>
                        <v-text-field v-model="speaker.location" placeholder="Room 101" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="6" class="pa-0 ma-0 pe-lg-2">
                        <v-menu
                            v-model="speaker.startMenu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            max-width="290"
                        >
                            <template #activator="{ props }">
                                <v-label for="">Start Date Time</v-label>
                                <v-text-field
                                    v-bind="props"
                                    v-model="speaker.startFormatted"
                                    placeholder="Select Start Date Time"
                                    readonly
                                    append-inner-icon="mdi-calendar"
                                    variant="outlined"
                                />
                            </template>
                            <v-date-picker v-model="speaker.startDate" @update:model-value="(val) => formatDate(val, speaker, 'start')" />
                        </v-menu>
                    </v-col>

                    <v-col cols="12" md="6" class="pa-0 ma-0 ps-lg-2">
                        <v-menu
                            v-model="speaker.endMenu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            offset-y
                            max-width="290"
                        >
                            <template #activator="{ props }">
                                <v-label for="">End Date Time</v-label>
                                <v-text-field
                                    v-bind="props"
                                    v-model="speaker.endFormatted"
                                    placeholder="Select End Date Time"
                                    readonly
                                    append-inner-icon="mdi-calendar"
                                    variant="outlined"
                                />
                            </template>
                            <v-date-picker v-model="speaker.endDate" @update:model-value="(val) => formatDate(val, speaker, 'end')" />
                        </v-menu>
                    </v-col>
                </v-row>

                <div @click="store.addSpeaker" class="d-flex align-center mb-4" style="cursor: pointer">
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
import { useEventStore } from '@/store/eventStore';
import { ref } from 'vue';
import axios from 'axios';
import api from '@/plugins/axios';

const store = useEventStore();

// Reference speakers from store
const speakers = ref(
    store.formData.speakers.length
        ? store.formData.speakers
        : [
              {
                  id: null,
                  name: '',
                  email: '',
                  phone: '',
                  location: '',
                  startDate: null,
                  endDate: null,
                  startFormatted: '',
                  endFormatted: '',
                  startMenu: false,
                  endMenu: false
              }
          ]
);

store.formData.speakers = speakers.value;

// Add new speaker row
const addSpeaker = () => {
    speakers.value.push({
        id: null,
        name: '',
        email: '',
        phone: '',
        location: '',
        startDate: null,
        endDate: null,
        startFormatted: '',
        endFormatted: '',
        startMenu: false,
        endMenu: false
    });
    store.formData.speakers = speakers.value;
};

// Format date for display
const formatDate = (val, speaker, type) => {
    const formatted = new Date(val).toLocaleString();
    if (type === 'start') speaker.startFormatted = formatted;
    else speaker.endFormatted = formatted;
};

// Convert JS date → API format (YYYY-MM-DD HH:mm:ss)
const formatForApi = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Submit speakers to API
const handleSubmit = async () => {
    try {
        const payload = {
            event_id: store.formData.eventType.id,
            speakers: speakers.value.map((s) => ({
                id: s.id || null,
                name: s.name,
                email: s.email,
                phone: s.phone,
                location: s.location,
                start_datetime: formatForApi(s.startDate),
                end_datetime: formatForApi(s.endDate)
            }))
        };

        const res = await api.post('/events/speakers', payload);

        if (res.data.status) {
            store.formData.speakers = res.data.data;
            store.nextStep();
        }
    } catch (error) {
        console.error('Error saving speakers:', error.response?.data || error);
    }
};

const handleCancel = () => {
    store.resetSpeakers();
};
</script>

<style scoped>
.form-wrapper {
    width: 100%;
    max-width: 700px;
}

@media (max-width: 600px) {
    .form-wrapper {
        max-width: 100% !important;
    }
}
</style>
