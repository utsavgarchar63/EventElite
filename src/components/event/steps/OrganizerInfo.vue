<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <div class="form-wrapper">
            <div class="mb-8">
                <h4 class="text-h4 font-weight-bold">Organizer Information</h4>
                <p class="mt-1" style="color: #525454">Please enter organizer details below</p>
            </div>

            <v-form @submit.prevent="handleSubmit">
                <v-row>
                    <!-- Organizer Name -->
                    <v-col cols="12" class="pa-0 pl-2 pl-lg-3 mb-3">
                        <v-label>Organizer Name</v-label>
                        <v-text-field
                            v-model="organizerName"
                            variant="outlined"
                            placeholder="Enter organizer name"
                            hide-details="auto"
                            color="primary"
                            :error="!!errors.organizerName"
                            :error-messages="errors.organizerName"
                        />
                    </v-col>

                    <!-- Phone (Country Code + Number) -->
                    <v-col cols="12" class="pa-0 pl-2 pl-lg-3 mb-3 d-flex">
                        <div style="width: 100px; margin-right: 8px">
                            <v-label>Code</v-label>
                            <v-select
                                v-model="countryCode"
                                :items="countryCodes"
                                variant="outlined"
                                hide-details="auto"
                                color="primary"
                                placeholder="+91"
                            />
                        </div>
                        <div style="flex: 1">
                            <v-label>Phone Number</v-label>
                            <v-text-field
                                v-model="phoneNumber"
                                variant="outlined"
                                placeholder="Enter phone number"
                                hide-details="auto"
                                color="primary"
                                :error="!!errors.phoneNumber"
                                :error-messages="errors.phoneNumber"
                            />
                        </div>
                    </v-col>

                    <!-- Email -->
                    <v-col cols="12" class="pa-0 pl-2 pl-lg-3 mb-3">
                        <v-label>Email</v-label>
                        <v-text-field
                            v-model="email"
                            variant="outlined"
                            placeholder="Enter email"
                            hide-details="auto"
                            color="primary"
                            :error="!!errors.email"
                            :error-messages="errors.email"
                        />
                    </v-col>

                    <!-- Description -->
                    <v-col cols="12" class="pa-0 pl-2 pl-lg-3 mb-3">
                        <v-label>Description</v-label>
                        <v-textarea
                            v-model="description"
                            variant="outlined"
                            placeholder="Enter description"
                            hide-details="auto"
                            color="primary"
                        />
                    </v-col>

                    <!-- Buttons -->
                    <v-col cols="12" class="pa-0 mt-4 pl-2 pl-lg-3 mb-3 d-flex justify-end">
                        <v-btn color="primary" size="large" variant="outlined" class="mr-2" @click="handleGoBack"> Go Back </v-btn>
                        <v-btn type="submit" color="primary" size="large"> Save & Next </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </div>
    </v-container>
</template>

<style scoped>
.form-wrapper {
    width: 100%;
    max-width: 500px;
    /* On laptop+ screens */
}

/* On small screens, take full width */
@media (max-width: 600px) {
    .form-wrapper {
        max-width: 100% !important;
    }
}
</style>
<script setup>
import { ref, onMounted } from 'vue';
import { useEventStore } from '@/store/eventStore';
import { useSnackbarStore } from '@/store/snackbar';
import api from '@/plugins/axios';

const store = useEventStore();
const snackbar = useSnackbarStore();

// fields
const organizerName = ref('');
const countryCode = ref('+91');
const phoneNumber = ref('');
const email = ref('');
const description = ref('');

const countryCodes = ['+91', '+1', '+44', '+61', '+81'];

const errors = ref({
    name: '',
    phone: '',
    email: '',
    description: ''
});

// Prefill if data already exists
onMounted(() => {
    if (store.formData.organizerInfo) {
        const org = store.formData.organizerInfo;

        organizerName.value = org.name || '';
        email.value = org.email || '';
        description.value = org.description || '';

        if (org.phone && org.phone.includes('-')) {
            const [code, num] = org.phone.split('-');
            countryCode.value = code;
            phoneNumber.value = num; // updated
        } else {
            phoneNumber.value = org.phone || '';
        }
    }
});

// validation
const validateForm = () => {
    let valid = true;
    errors.value = { name: '', phone: '', email: '', description: '' };

    if (!organizerName.value) {
        errors.value.name = 'Organizer name is required';
        valid = false;
    }
    if (!phoneNumber.value) {
        errors.value.phone = 'Phone is required';
        valid = false;
    }

    if (!email.value) {
        errors.value.email = 'Email is required';
        valid = false;
    }
    if (!description.value) {
        errors.value.description = 'Description is required';
        valid = false;
    }

    return valid;
};

// submit
const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
        const response = await api.post('/events/organisation', {
            event_id: store.formData.basicInfo?.id || 1,
            name: organizerName.value,
            phone: `${countryCode.value}-${phoneNumber.value}`,
            description: description.value,
            email: email.value
        });

        if (response.data.status) {
            store.formData.organizerInfo = response.data.data;
            snackbar.show('Organizer info saved successfully', 'success');
            store.nextStep();
        } else {
            snackbar.show(response.data.message || 'Something went wrong', 'error');
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

// cancel
const handleGoBack = () => {
    organizerName.value = '';
    phone.value = '';
    email.value = '';
    description.value = '';
    countryCode.value = '+91';
    store.prevStep();
};
</script>
