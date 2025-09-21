<template>
  <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
    <div class="form-wrapper">
      <div class="mb-8">
        <h4 class="text-h2 font-weight-bold">Vendors</h4>
        <p class="mt-1" style="color: #525454">Please provide the list of vendors of the event.</p>
      </div>

      <v-form @submit.prevent="handleSubmit" class="ms-lg-3">
        <!-- Multi-select of existing vendors -->
        <v-col cols="12" class="pa-2 mb-6">
          <v-select
            v-model="selectedVendors"
            :items="allVendors"
            item-title="business_name"
            item-value="id"
            multiple
            chips
            label="Select Existing Vendors"
            variant="outlined"
            @update:modelValue="handleSelectedVendors"
          />
        </v-col>

        <!-- Vendors Loop -->
        <v-row v-for="(vendor, index) in vendors" :key="index" class="mb-6">
          <v-col cols="12" class="pa-0 mb-3">
            <div class="d-flex justify-space-between align-center">
              <h4 class="font-weight-bold text-h4">Vendor {{ index + 1 }}</h4>
              <v-btn icon color="error" @click="removeVendor(index)" v-if="vendors.length > 1">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-col>

          <!-- Business Name -->
          <v-col cols="12" md="6" class="pe-lg-2 pa-0">
            <v-label>Business Name</v-label>
            <v-text-field
              v-model="vendor.businessName"
              variant="outlined"
              placeholder="Google"
              :disabled="vendor.isSelected"
            />
          </v-col>

          <!-- Contact Name -->
          <v-col cols="12" md="6" class="ps-lg-2 pa-0">
            <v-label>Contact Name</v-label>
            <v-text-field
              v-model="vendor.contactName"
              variant="outlined"
              placeholder="John Doe"
              :disabled="vendor.isSelected"
            />
          </v-col>

          <!-- Email -->
          <v-col cols="12" md="6" class="pe-lg-2 pa-0">
            <v-label>Email</v-label>
            <v-text-field
              v-model="vendor.email"
              variant="outlined"
              placeholder="john@gmail.com"
              :disabled="vendor.isSelected"
            />
          </v-col>

          <!-- Phone Number -->
          <v-col cols="12" md="6" class="ps-lg-2 pa-0">
            <v-label>Phone Number</v-label>
            <v-text-field
              v-model="vendor.phoneNumber"
              variant="outlined"
              placeholder="xxx-xxx-xxxx"
              :disabled="vendor.isSelected"
            />
          </v-col>

          <!-- Business Link -->
          <v-col cols="12" md="6" class="pe-lg-2 pa-0">
            <v-label>Business Link</v-label>
            <v-text-field
              v-model="vendor.businessLink"
              variant="outlined"
              placeholder="www.google.com"
              :disabled="vendor.isSelected"
            />
          </v-col>

          <!-- Location -->
          <v-col cols="12" md="6" class="ps-lg-2 pa-0">
            <v-label>Location</v-label>
            <v-text-field
              v-model="vendor.location"
              variant="outlined"
              placeholder="Booth 101"
            />
          </v-col>

          <!-- Business Logo -->
          <v-col cols="12" md="6" class="pa-0">
            <v-label>Business Logo</v-label>
            <CommonFileUpload
              v-model="vendor.businessLogo"
              label="Choose file"
              accept="image/*"
              :disabled="vendor.isSelected"
            />
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
            <v-btn color="primary" size="large" variant="outlined" class="mr-2" @click="handleCancel">
              Go Back
            </v-btn>
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
import api from '@/plugins/axios';
import CommonFileUpload from '@/components/ui-components/file-upload/CommonFileUpload.vue';
import { useSnackbarStore } from '@/store/snackbar';

const store = useEventStore();
const snackbar = useSnackbarStore();

const allVendors = ref([]);
const selectedVendors = ref([]);

const vendors = ref([]);

const initVendors = () => {
  if (store.formData.vendors.length) {
    vendors.value = store.formData.vendors.map(v => ({
      selectedId: v.id || null,
      businessName: v.business_name || v.businessName || '',
      contactName: v.contact_name || v.contactName || '',
      email: v.email || '',
      phoneNumber: v.phone || v.phoneNumber || '',
      businessLink: v.business_link || v.businessLink || '',
      location: v.location || '',
      businessLogo: v.logo || v.businessLogo || null,
      isSelected: !!v.id
    }));
    selectedVendors.value = vendors.value.filter(v => v.isSelected).map(v => v.selectedId);
  } else {
    vendors.value = [{
      businessName: '',
      contactName: '',
      email: '',
      phoneNumber: '',
      businessLink: '',
      location: '',
      businessLogo: null,
      selectedId: null,
      isSelected: false
    }];
  }
};

const fillVendorData = (id) => {
  const vendorData = allVendors.value.find(v => v.id === id);
  if (vendorData) {
    return {
      selectedId: vendorData.id,
      businessName: vendorData.business_name,
      contactName: vendorData.contact_name,
      email: vendorData.email,
      phoneNumber: vendorData.phone,
      businessLink: vendorData.business_link,
      businessLogo: vendorData.logo,
      location: '',
      isSelected: true
    };
  }
  return null;
};

const handleSelectedVendors = (newVal) => {
  // Add newly selected vendors
  newVal.forEach(id => {
    const already = vendors.value.find(v => v.selectedId === id && v.isSelected);
    if (!already) {
      const data = fillVendorData(id);
      if (data) vendors.value.push(data);
    }
  });
  // Remove vendors if deselected
  vendors.value = vendors.value.filter(v => v.isSelected ? newVal.includes(v.selectedId) : true);
};

const fetchVendors = async () => {
  try {
    const res = await api.get('/events/get-vendors');
    if (res.data.success) {
      allVendors.value = res.data.data;
      await nextTick();
      handleSelectedVendors(selectedVendors.value);
    }
  } catch (err) {
    snackbar.show('Failed to fetch vendors', 'error');
  }
};

const addVendor = () => {
  vendors.value.push({
    businessName: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    businessLink: '',
    location: '',
    businessLogo: null,
    selectedId: null,
    isSelected: false
  });
};

const removeVendor = (index) => vendors.value.splice(index, 1);

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append('event_id', store.formData.eventType.id);

    vendors.value.forEach((v, i) => {
      formData.append(`vendors[${i}][id]`, v.selectedId || '');
      formData.append(`vendors[${i}][business_name]`, v.businessName);
      formData.append(`vendors[${i}][contact_name]`, v.contactName);
      formData.append(`vendors[${i}][email]`, v.email);
      formData.append(`vendors[${i}][phone]`, v.phoneNumber);
      formData.append(`vendors[${i}][business_link]`, v.businessLink);
      formData.append(`vendors[${i}][location]`, v.location);
      if (v.businessLogo) {
        formData.append(`vendors[${i}][logo]`, v.businessLogo);
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
      const messages = Object.values(err.response.data.errors).flat().join('\n');
      snackbar.show(messages, 'error');
    } else {
      snackbar.show('Something went wrong', 'error');
    }
  }
};

const handleCancel = () => {
  initVendors();
  store.prevStep();
};

onMounted(() => {
  initVendors();
  fetchVendors();
});

// Keep store synced
watch(vendors, (newVal) => {
  store.formData.vendors = newVal;
}, { deep: true });
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
