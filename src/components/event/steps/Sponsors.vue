
<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <div class="form-wrapper">
            <div class="mb-8">
                <h4 class="text-h2 font-weight-bold">Sponsors</h4>
                <p class="mt-1" style="color: #525454">Please provide the list of sponsors of the event.</p>
            </div>

            <v-form @submit.prevent="handleSubmit" class="ms-lg-3">
                <!-- Sponsors loop -->
                <v-row v-for="(sponsor, index) in sponsors" :key="index" class="mb-1">
                    <v-col cols="12" class="pa-0 mb-3">
                        <h4 class="font-weight-bold text-h4">Sponsor {{ index + 1 }}</h4>
                    </v-col>

                    <!-- Tier -->
                    <v-col cols="12" md="6" class="pe-lg-2 pa-0">
                        <v-label>Tier</v-label>
                        <v-select :items="tiers" v-model="sponsor.tier" variant="outlined" placeholder="Select Tier" />
                    </v-col>

                    <!-- Business Name -->
                    <v-col cols="12" md="6" class="ps-lg-2 pa-0">
                        <v-label>Business Name</v-label>
                        <v-text-field v-model="sponsor.businessName" variant="outlined" placeholder="Google" />
                    </v-col>

                    <!-- Business Link -->
                    <v-col cols="12" md="6" class="pe-lg-2 pa-0">
                        <v-label>Business Link</v-label>
                        <v-text-field v-model="sponsor.businessLink" variant="outlined" placeholder="www.google.com" />
                    </v-col>

                    <!-- Business Logo -->
                    <v-col cols="12" md="6" class="ps-lg-2 pa-0">
                        <v-label>Business Logo</v-label>
                        <CommonFileUpload v-model="sponsor.businessLogo" label="Choose file" accept="image/*" />
                    </v-col>
                </v-row>

                <!-- Add more sponsors -->
                <div @click="addSponsor" class="d-flex align-center my-3" style="cursor: pointer">
                    <v-btn icon color="primary" class="mr-2">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <h4 class="text-primary mb-0">Add More Sponsors</h4>
                </div>

                <!-- Actions -->
                <v-row class="mt-4">
                    <v-col cols="12" class="d-flex justify-end">
                        <v-btn color="primary" size="large" variant="outlined" class="mr-2" @click="handleCancel"> Go Back </v-btn>
                        <v-btn type="submit" color="primary" size="large">Save & Next</v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </div>
    </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useEventStore } from '@/store/eventStore';
import api from '@/plugins/axios';
import CommonFileUpload from '@/components/ui-components/file-upload/CommonFileUpload.vue';
import { useSnackbarStore } from '@/store/snackbar';

const store = useEventStore();
const snackbar = useSnackbarStore();
// Sponsor tiers
const tiers = ['Main/Co Sponsor', 'Gold', 'Platinum'];

// Sponsors reactive state
const sponsors = ref(
    store.formData.sponsors.length
        ? store.formData.sponsors
        : [
              {
                  tier: '',
                  businessName: '',
                  businessLink: '',
                  businessLogo: null
              }
          ]
);

store.formData.sponsors = sponsors.value;

// Add new sponsor row
const addSponsor = () => {
    sponsors.value.push({
        tier: '',
        businessName: '',
        businessLink: '',
        businessLogo: null
    });
    store.formData.sponsors = sponsors.value;
};

// Handle Save & Next
const handleSubmit = async () => {
    try {
        const formData = new FormData();
        formData.append('event_id', store.formData.eventType.id);

        sponsors.value.forEach((s, i) => {
            // match your backend’s expected keys
            if (s.id) {
                formData.append(`sponsors[${i}][id]`, s.id);
            } else {
                formData.append(`sponsors[${i}][tier]`, s.tier);
                formData.append(`sponsors[${i}][business_name]`, s.businessName);
                formData.append(`sponsors[${i}][link]`, s.businessLink);
                if (s.businessLogo) {
                    formData.append(`sponsors[${i}][logo]`, s.businessLogo);
                }
            }
        });

        const res = await api.post('/events/sponsors', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.status) {
            store.formData.sponsors = res.data.data;
            snackbar.show('Sponsors saved successfully', 'success');
            store.nextStep();
        }
    } catch (err) {
        if (err.response?.data?.errors) {
            // Laravel style validation errors
            const errors = err.response.data.errors;
            // Join all messages into one string
            const messages = Object.values(errors).flat().join('\n');
            snackbar.show(messages, 'error');
        } else {
            snackbar.show('Something went wrong', 'error');
        }
    }
};

const handleCancel = () => {
    // reset sponsors if needed
    sponsors.value = [
        {
            tier: '',
            businessName: '',
            businessLink: '',
            businessLogo: null
        }
    ];
    store.formData.sponsors = sponsors.value;
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
