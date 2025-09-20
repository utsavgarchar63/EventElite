<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <div class="form-wrapper">
            <div class="mb-8">
                <h4 class="text-h2 font-weight-bold">Sponsors</h4>
                <p class="mt-1" style="color: #525454">Please provide the list of sponsors of the event.</p>
            </div>

            <v-form @submit.prevent="handleSubmit">
                <v-row v-for="(sponsor, index) in sponsors" :key="index" class="mb-4">
                    <v-col cols="12" class="pa-0 mb-3 d-flex justify-space-between align-center">
                        <h4 class="font-weight-bold text-h4">Sponsor {{ index + 1 }}</h4>
                        <v-btn icon color="error" @click="removeSponsor(index)" v-if="sponsors.length > 1">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-col>

                    <!-- Select Sponsor -->
                    <v-col cols="12" class="pa-2">
                        <v-select :items="sponsorsList" item-title="business_name" item-value="id"
                            v-model="sponsor.selectedId" label="Select Sponsor" dense variant="outlined" />
                    </v-col>

                    <!-- Tier -->
                    <v-col cols="12" md="6" class="pa-2">
                        <v-select :items="tiers" v-model="sponsor.tier" variant="outlined" placeholder="Select Tier" />
                    </v-col>

                    <!-- Business Name -->
                    <v-col cols="12" md="6" class="pa-2">
                        <v-text-field label="Business Name" v-model="sponsor.businessName"
                            :readonly="sponsor.isSelected" :disabled="sponsor.isSelected" variant="outlined" />
                    </v-col>

                    <!-- Business Link -->
                    <v-col cols="12" md="6" class="pa-2">
                        <v-text-field label="Business Link" v-model="sponsor.businessLink"
                            :readonly="sponsor.isSelected" :disabled="sponsor.isSelected" variant="outlined" />
                    </v-col>

                    <!-- Business Logo -->
                    <v-col cols="12" md="6" class="pa-2">
                        <CommonFileUpload v-model="sponsor.businessLogo" label="Choose file" accept="image/*"
                            :disabled="sponsor.isSelected" />
                    </v-col>
                </v-row>

                <!-- Add Sponsor -->
                <div @click="addSponsor" class="d-flex align-center my-3" style="cursor: pointer">
                    <v-btn icon color="primary" class="mr-2"><v-icon>mdi-plus</v-icon></v-btn>
                    <h4 class="text-primary mb-0">Add More Sponsors</h4>
                </div>

                <!-- Actions -->
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

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useEventStore } from '@/store/eventStore';
import { useSnackbarStore } from '@/store/snackbar';
import api from '@/plugins/axios';
import CommonFileUpload from '@/components/ui-components/file-upload/CommonFileUpload.vue';

const store = useEventStore();
const snackbar = useSnackbarStore();

const sponsorsList = ref([]);
const tiers = ['Main/Co Sponsor', 'Gold', 'Platinum'];

// Sponsors reactive array
const sponsors = ref([]);

// Initialize sponsors from store
const initSponsors = () => {
    if (store.formData.sponsors.length) {
        sponsors.value = store.formData.sponsors.map(s => ({
            ...s,
            selectedId: s.id || s.selectedId || null,
            isSelected: !!s.id
        }));
    } else {
        sponsors.value = [{
            selectedId: null,
            tier: '',
            businessName: '',
            businessLink: '',
            businessLogo: null,
            isSelected: false
        }];
    }
};

// Keep store in sync
watch(sponsors, (newVal) => {
    store.formData.sponsors = newVal;
}, { deep: true });

// Auto-fill sponsor data when selected
const fillSponsorData = (id, index) => {
    const sponsorData = sponsorsList.value.find(s => s.id === id);
    if (sponsorData) {
        sponsors.value[index] = {
            ...sponsors.value[index],
            selectedId: sponsorData.id,
            tier: sponsorData.tier || '',
            businessName: sponsorData.business_name,
            businessLink: sponsorData.link || '',
            businessLogo: sponsorData.logo || null,
            isSelected: true
        };
    }
};

// Fetch sponsors for select dropdown
const fetchSponsors = async () => {
    try {
        const res = await api.get('/events/get-sponsors');
        if (res.data.success) {
            sponsorsList.value = res.data.data;

            // After fetching, auto-fill any pre-selected sponsors
            await nextTick();
            sponsors.value.forEach((s, i) => {
                if (s.selectedId) fillSponsorData(s.selectedId, i);
            });
        }
    } catch (err) {
        snackbar.show('Failed to fetch sponsors', 'error');
    }
};

// Watch for manual selection changes
watch(
    () => sponsors.value.map(s => s.selectedId),
    (newVals, oldVals) => {
        newVals.forEach((id, index) => {
            if (id && id !== oldVals[index]) fillSponsorData(id, index);
        });
    }
);

// Add / remove sponsors
const addSponsor = () => {
    sponsors.value.push({ selectedId: null, tier: '', businessName: '', businessLink: '', businessLogo: null, isSelected: false });
};
const removeSponsor = (index) => sponsors.value.splice(index, 1);

// Handle form submission
const handleSubmit = async () => {
    try {
        const formData = new FormData();
        formData.append('event_id', store.formData.eventType.id);
        sponsors.value.forEach((s, i) => {
            formData.append(`sponsors[${i}][id]`, s.selectedId || s.id || '');
            formData.append(`sponsors[${i}][tier]`, s.tier || '');
            formData.append(`sponsors[${i}][business_name]`, s.businessName || '');
            formData.append(`sponsors[${i}][link]`, s.businessLink || '');
            if (s.businessLogo) formData.append(`sponsors[${i}][logo]`, s.businessLogo);
        });

        const res = await api.post('/events/sponsors', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.data.status) {
            store.formData.sponsors = res.data.data;
            snackbar.show('Sponsors saved successfully', 'success');
            store.nextStep();
        }
    } catch (err) {
        const messages = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join('\n') : 'Something went wrong';
        snackbar.show(messages, 'error');
    }
};

// Reset form
const handleCancel = () => {
    initSponsors();
    store.prevStep();
};

onMounted(() => {
    initSponsors(); // initialize sponsors from store
    fetchSponsors(); // fetch sponsor list and auto-fill any pre-selected
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
