<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <v-row class="w-100" align="start">
            <!-- FORM SECTION -->
            <v-col cols="12" md="6">
                <div class="form-wrapper">
                    <div class="mb-8">
                        <h4 class="text-h4 font-weight-bold">Publish Live Paid</h4>
                        <p class="mt-1" style="color: #525454">Please complete your payment to create the event.</p>
                    </div>

                    <v-form @submit.prevent="handleSubmit" class="ms-lg-3">
                        <!-- Saved Cards -->
                        <div class="mb-4">
                            <h4 class="font-weight-bold text-h" style="color: #7588a1">Saved Cards</h4>
                            <v-radio-group v-model="selectedCard" class="mt-0">
                                <v-radio
                                    v-for="card in savedCards"
                                    :key="card.id"
                                    :label="`${card.brand} ****${card.last4} - Expires: ${card.expiry}`"
                                    :value="card"
                                />
                            </v-radio-group>
                        </div>

                        <!-- Add new card -->
                        <div @click="showNewCard = true" class="d-flex align-center mb-4" style="cursor: pointer">
                            <v-icon color="#7588A1">mdi-plus</v-icon>
                            <h4 class="mb-0" style="color: #7588a1">Add New Card</h4>
                        </div>

                        <!-- New Card Section -->
                        <v-expand-transition style="margin-top: 40px;">
                            <div v-if="showNewCard">
                                <v-row>
                                    <v-col cols="12" class="pa-0 mb-3">
                                        <h4 class="font-weight-bold text-h4">New Card</h4>
                                    </v-col>
                                    <v-col cols="12" class="pa-0 ma-0">
                                        <v-label>Name on Card</v-label>
                                        <v-text-field v-model="newCard.name" placeholder="Enter card holder name" variant="outlined" />
                                    </v-col>
                                    <v-col cols="12" class="pa-0 ma-0">
                                        <v-label>Card Number</v-label>
                                        <v-text-field v-model="newCard.number" placeholder="0000 0000 0000 0000" variant="outlined" />
                                    </v-col>
                                    <v-col cols="12" md="6" class="pa-0 ma-0 pe-lg-2">
                                        <v-label>Valid Through</v-label>
                                        <v-text-field v-model="newCard.expiry" placeholder="MM/YYYY" variant="outlined" />
                                    </v-col>
                                    <v-col cols="12" md="6" class="pa-0 ma-0 ps-lg-2">
                                        <v-label>CVV</v-label>
                                        <v-text-field v-model="newCard.cvv" placeholder="Enter CVV" variant="outlined" />
                                    </v-col>
                                    <v-col cols="12" class="pa-0 ma-0">
                                        <v-checkbox v-model="newCard.save" label="Save this card" />
                                    </v-col>
                                </v-row>
                            </div>
                        </v-expand-transition>

                        <!-- Buttons -->
                        <v-row class="mt-4">
                            <v-col cols="12" class="d-flex justify-end">
                                <v-btn color="primary" size="large" variant="outlined" class="mr-2" @click="handleCancel">Cancel</v-btn>
                                <v-btn type="submit" color="primary" size="large">Save & Next</v-btn>
                            </v-col>
                        </v-row>
                    </v-form>
                </div>
            </v-col>

            <!-- PAYMENT SUMMARY SECTION -->
            <v-col cols="12" md="6">
                <div class="payment-summary mt-md-0 mt-6">
                    <h4 class="font-weight-bold text-h4">Payment Summary</h4>
                    <v-list>
                        <v-list-item v-for="(item, index) in paymentSummary" :key="index">
                            <v-list-item-title>{{ item.label }}</v-list-item-title>
                            <v-list-item-subtitle>{{ item.amount }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-title><strong>Total</strong></v-list-item-title>
                            <v-list-item-subtitle
                                ><strong>${{ totalAmount }}</strong></v-list-item-subtitle
                            >
                        </v-list-item>
                    </v-list>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { router } from '@/router';
import { ref } from 'vue';

const showNewCard = ref(false);
const selectedCard = ref(null);
const newCard = ref({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
    save: false
});

const savedCards = ref([
    {
        id: 1,
        brand: 'Mastercard',
        last4: '4520',
        expiry: '08/2024',
        holder: 'Charlotte'
    }
]);

const paymentSummary = ref([
    { label: 'Enterprise event', amount: '$499.00' },
    { label: 'Addon Speaker', amount: '$29.99' },
    { label: 'Addon Sponsor', amount: '$29.99' },
    { label: 'Addon Vendor', amount: '$29.99' },
    { label: 'Taxes', amount: '$100.00' }
]);

const totalAmount = ref('$688.97');

const handleSubmit = async () => {
    // Handle payment submission logic here
    router.push('/admin/event/success'); 
    console.log('Payment submitted:', selectedCard.value || newCard.value);
};

const handleCancel = () => {
    showNewCard.value = false;
    newCard.value = { name: '', number: '', expiry: '', cvv: '', save: false };
};
</script>

<style scoped>
.form-wrapper {
    width: 100%;
}

.payment-summary {
    width: 100%;
    /* background: #f5f5f5; */
    padding: 16px;
    border: 1px solid #949BBC;
    border-radius: 8px;
}

@media (max-width: 960px) {
    .payment-summary {
        margin-top: 24px;
    }
}
</style>
