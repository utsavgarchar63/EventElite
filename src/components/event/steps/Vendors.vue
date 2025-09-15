<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <div class="form-wrapper">
            <div class="mb-8">
                <h4 class="text-h2 font-weight-bold">Vendors</h4>
                <p class="mt-1" style="color: #525454">Please provide the list of vendors of the event.</p>
            </div>

            <v-form @submit.prevent="handleSubmit" class="ms-lg-3">
                <!-- Vendors Loop -->
                <v-row v-for="(vendor, index) in vendors" :key="index" class="mb-6">
                    <v-col cols="12" class="pa-0 mb-3">
                        <h4 class="font-weight-bold text-h4">Vendor {{ index + 1 }}</h4>
                    </v-col>

                    <!-- Business Name -->
                    <v-col cols="12" md="6" class="pe-lg-2 pa-0">
                        <v-label>Business Name</v-label>
                        <v-text-field v-model="vendor.businessName" variant="outlined" placeholder="Google" />
                    </v-col>

                    <!-- Contact Name -->
                    <v-col cols="12" md="6" class="ps-lg-2 pa-0">
                        <v-label>Contact Name</v-label>
                        <v-text-field v-model="vendor.contactName" variant="outlined" placeholder="John Doe" />
                    </v-col>

                    <!-- Email -->
                    <v-col cols="12" md="6" class="pe-lg-2 pa-0">
                        <v-label>Email</v-label>
                        <v-text-field v-model="vendor.email" variant="outlined" placeholder="john@gmail.com" />
                    </v-col>

                    <!-- Phone Number -->
                    <v-col cols="12" md="6" class="ps-lg-2 pa-0">
                        <v-label>Phone Number</v-label>
                        <v-text-field v-model="vendor.phoneNumber" variant="outlined" placeholder="xxx-xxx-xxxx" />
                    </v-col>

                    <!-- Business Link -->
                    <v-col cols="12" md="6" class="pe-lg-2 pa-0">
                        <v-label>Business Link</v-label>
                        <v-text-field v-model="vendor.businessLink" variant="outlined" placeholder="www.google.com" />
                    </v-col>

                    <!-- Location -->
                    <v-col cols="12" md="6" class="ps-lg-2 pa-0">
                        <v-label>Location</v-label>
                        <v-text-field v-model="vendor.location" variant="outlined" placeholder="Booth 101" />
                    </v-col>

                    <!-- Business Logo -->
                    <v-col cols="12" md="6" class="pa-0">
                        <v-label>Business Logo</v-label>
                        <CommonFileUpload v-model="vendor.businessLogo" label="Choose file" accept="image/*" />
                    </v-col>
                </v-row>

                <!-- Add more vendors -->
                <div @click="addVendor" class="d-flex align-center my-3" style="cursor: pointer">
                    <v-btn icon color="primary" class="mr-2">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <h4 class="text-primary mb-0">Add More Vendors</h4>
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

// Vendors reactive state
const vendors = ref(
    store.formData.vendors?.length
        ? store.formData.vendors
        : [
              {
                  businessName: '',
                  contactName: '',
                  email: '',
                  phoneNumber: '',
                  businessLink: '',
                  location: '',
                  businessLogo: null
              }
          ]
);

store.formData.vendors = vendors.value;

// Add new vendor row
const addVendor = () => {
    vendors.value.push({
        businessName: '',
        contactName: '',
        email: '',
        phoneNumber: '',
        businessLink: '',
        location: '',
        businessLogo: null
    });
    store.formData.vendors = vendors.value;
};

// Handle Save & Next
const handleSubmit = async () => {
    try {
        const formData = new FormData();
        formData.append('event_id', store.formData.eventType.id);

        vendors.value.forEach((v, i) => {
            if (v.id) {
                // existing vendor
                formData.append(`vendors[${i}][id]`, v.id);
                formData.append(`vendors[${i}][location]`, v.location || '');
            } else {
                formData.append(`vendors[${i}][business_name]`, v.businessName);
                formData.append(`vendors[${i}][contact_name]`, v.contactName);
                formData.append(`vendors[${i}][email]`, v.email);
                formData.append(`vendors[${i}][phone]`, v.phone); // note phone
                formData.append(`vendors[${i}][business_link]`, v.businessLink);
                formData.append(`vendors[${i}][location]`, v.location);
                if (v.businessLogo) {
                    formData.append(`vendors[${i}][logo]`, v.businessLogo);
                }
            }
        });

        const res = await api.post('/events/vendors', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.status) {
            store.formData.vendors = res.data.data;
            snackbar.show('Vendors saved successfully', 'success');
            store.nextStep();
        }
    } catch (err) {
        if (err.response?.data?.errors) {
            const errors = err.response.data.errors;
            const messages = Object.values(errors).flat().join('\n');
            snackbar.show(messages, 'error');
        } else {
            snackbar.show('Something went wrong', 'error');
        }
    }
};

const handleCancel = () => {
    vendors.value = [
        {
            businessName: '',
            contactName: '',
            email: '',
            phoneNumber: '',
            businessLink: '',
            location: '',
            businessLogo: null
        }
    ];
    store.formData.vendors = vendors.value;
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
