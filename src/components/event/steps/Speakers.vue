<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <div class="form-wrapper">
            <div class="mb-8">
                <h4 class="text-h2 font-weight-bold">Speakers</h4>
                <p class="mt-1" style="color: #525454">Please provide the list of speakers of the event.</p>
            </div>

            <v-form @submit.prevent="handleSubmit" class="ms-lg-3">
                <v-row v-for="(speaker, index) in store.formData.speakers" :key="index" class="mb-4">
                    <!-- Header with Delete -->
                    <v-col cols="12" class="pa-0 mb-3">
                        <div class="d-flex justify-space-between align-center">
                            <h4 class="font-weight-bold text-h4">Speaker {{ index + 1 }}</h4>
                            <v-btn icon color="error" @click="removeSpeaker(index)" v-if="speakers.length > 1">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </div>
                    </v-col>

                    <!-- Select existing speaker -->
                    <v-col cols="12" md="12" class="pa-2">
                        <v-select :items="allSpeakers" item-title="name" item-value="id" v-model="speaker.selectedId"
                            label="Select a speaker" dense variant="outlined" />
                    </v-col>

                    <!-- Name -->
                    <v-col cols="12" md="6" class="pa-2">
                        <v-text-field label="Name" placeholder="John Doe" v-model="speaker.name"
                            :readonly="speaker.isSelected" :disabled="speaker.isSelected" variant="outlined" />
                    </v-col>

                    <!-- Email -->
                    <v-col cols="12" md="6" class="pa-2">
                        <v-text-field label="Email" placeholder="john@gmail.com" v-model="speaker.email"
                            :readonly="speaker.isSelected" :disabled="speaker.isSelected" variant="outlined" />
                    </v-col>

                    <!-- Phone -->
                    <v-col cols="12" md="6" class="pa-2">
                        <v-text-field label="Phone Number" placeholder="xxx-xxx-xxxx" v-model="speaker.phone"
                            :readonly="speaker.isSelected" :disabled="speaker.isSelected" variant="outlined" />
                    </v-col>

                    <!-- Location -->
                    <v-col cols="12" md="6" class="pa-2">
                        <v-text-field label="Location" placeholder="Room 101" v-model="speaker.location"
                            :readonly="speaker.isSelected" :disabled="speaker.isSelected" variant="outlined" />
                    </v-col>

                    <!-- Start Date -->
                    <v-col cols="12" md="6" class="pa-2">
                        <v-menu v-model="speaker.startMenu" :close-on-content-click="false"
                            transition="scale-transition" offset-y max-width="290">
                            <template #activator="{ props }">
                                <v-text-field v-bind="props" v-model="speaker.startFormatted" label="Start Date Time"
                                    placeholder="Select Start Date Time" readonly append-inner-icon="mdi-calendar"
                                    variant="outlined" />
                            </template>
                            <v-date-picker v-model="speaker.startDate"
                                @update:model-value="val => formatDate(val, speaker, 'start')" />
                        </v-menu>
                    </v-col>

                    <!-- End Date -->
                    <v-col cols="12" md="6" class="pa-2">
                        <v-menu v-model="speaker.endMenu" :close-on-content-click="false" transition="scale-transition"
                            offset-y max-width="290">
                            <template #activator="{ props }">
                                <v-text-field v-bind="props" v-model="speaker.endFormatted" label="End Date Time"
                                    placeholder="Select End Date Time" readonly append-inner-icon="mdi-calendar"
                                    variant="outlined" />
                            </template>
                            <v-date-picker v-model="speaker.endDate"
                                @update:model-value="val => formatDate(val, speaker, 'end')" />
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
                        <v-btn color="primary" size="large" variant="outlined" class="mr-2" @click="handleCancel">Go
                            Back</v-btn>
                        <v-btn type="submit" color="primary" size="large">Save & Next</v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </div>
    </v-container>
</template>
<script setup>import { ref, onMounted } from 'vue';
import { useEventStore } from '@/store/eventStore';
import api from '@/plugins/axios';
import { useSnackbarStore } from '@/store/snackbar';
import { watch } from 'vue';

const store = useEventStore();
const snackbar = useSnackbarStore();

// Form speakers
const speakers = ref(
    store.formData.speakers?.length
        ? store.formData.speakers.map(s => ({
            ...s,
            selectedId: s.id || s.selectedId || null,
            startMenu: false,
            endMenu: false,
            startFormatted: s.startDate ? new Date(s.startDate).toLocaleString() : '',
            endFormatted: s.endDate ? new Date(s.endDate).toLocaleString() : '',
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

// API fetched speakers
const allSpeakers = ref([]);

// Fetch speakers from API
const fetchSpeakers = async () => {
    try {
        const res = await api.get('/events/get-speakers');
        if (res.data.success) {
            allSpeakers.value = res.data.data;
        }
    } catch (err) {
        snackbar.show('Failed to fetch speakers', 'error');
    }
};

// Fill speaker form when selected from dropdown
const fillSpeakerData = (id, index) => {
    const speakerData = allSpeakers.value.find(s => s.id === id);
    console.log(id)
    if (speakerData) {
        speakers.value[index] = {
            ...speakers.value[index],
            id: speakerData.id,
            name: speakerData.name,
            email: speakerData.email,
            phone: speakerData.phone,
            location: speakerData.location || '',
            isSelected: true // prevents editing
        };
    }
};

watch(
    () => speakers.value.map(s => s.selectedId),
    (newValues, oldValues) => {
        newValues.forEach((id, index) => {
            if (id && id !== oldValues[index]) {
                fillSpeakerData(id, index);
            }
        });
    }
);

// Add new speaker
const addSpeaker = () => {
    speakers.value.push({
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
        endMenu: false
    });
};

// Remove speaker
const removeSpeaker = (index) => {
    speakers.value.splice(index, 1);
};

// Date formatting
const formatDate = (val, speaker, type) => {
    const formatted = new Date(val).toLocaleString();
    if (type === 'start') speaker.startFormatted = formatted;
    else speaker.endFormatted = formatted;
};

// Format date for API
const formatForApi = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Submit speakers
const handleSubmit = async () => {
    try {
        const payload = {
            event_id: store.formData.eventType.id,
            speakers: speakers.value.map(s => ({
                id: s.selectedId || s.id || null,
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
    } catch (err) {
        if (err.response?.data?.errors) {
            const apiErrors = err.response.data.errors;
            const messages = Object.values(apiErrors).flat().join('\n');
            snackbar.show(messages, 'error');
        } else {
            snackbar.show('Something went wrong', 'error');
        }
    }
};

onMounted(() => {
    fetchSpeakers();
});

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
