<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <div class="form-wrapper">
            <!-- Heading -->
            <div class="mb-8">
                <h4 class="text-h2 font-weight-bold">Ticket Information</h4>
                <p class="mt-1" style="color: #525454">Please provide ticket details below.</p>
            </div>

            <v-form @submit.prevent="handleSubmit" class="ms-lg-3">
                <!-- Ticket Type Dropdown -->
                <v-label>Ticket Type</v-label>
                <v-select v-model="ticketType" :items="['Paid Ticket', 'Free Ticket']" variant="outlined"
                    placeholder="Select Ticket Type" />

                <!-- If Paid Ticket is selected show ticket fields -->
                <v-row v-for="(ticket, index) in tickets" :key="index" class="ps-5 mt-3 mb-4">
                    <v-col cols="12" class="pa-0 mb-2 d-flex justify-space-between align-center">
                        <h4 class="font-weight-bold text-h4">Ticket {{ index + 1 }}</h4>

                        <v-btn icon color="error" @click="removeTicket(index)" v-if="tickets.length > 1">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-col>

                    <v-col cols="12" md="6" class="pa-0 pe-lg-2">
                        <v-label>Ticket Name</v-label>
                        <v-text-field v-model="ticket.name" placeholder="Enter ticket name" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="6" class="pa-0 ps-lg-2">
                        <v-label>Description</v-label>
                        <v-text-field v-model="ticket.description" placeholder="Enter ticket description"
                            variant="outlined" />
                    </v-col>
                    <v-col cols="12" md="6" class="pa-0 pe-lg-2">
                        <v-label>Price ($)</v-label>
                        <v-text-field v-model="ticket.price" placeholder="Enter ticket price" variant="outlined"
                            @input="ticket.price = ticket.price.replace(/[^0-9.]/g, '')" :disabled="ticket.isFree" />
                    </v-col>


                    <v-col cols="12" md="6" class="pa-0 ps-lg-2">
                        <v-label>Capacity</v-label>
                        <v-text-field v-model="ticket.capacity" placeholder="Enter ticket type capacity"
                            variant="outlined" @input="ticket.capacity = ticket.capacity.replace(/[^0-9]/g, '')" />
                    </v-col>
                </v-row>

                <!-- Add more ticket button -->
                <div @click="addTicket" class="d-flex align-center mb-4" style="cursor: pointer">
                    <v-icon color="primary" class="mr-2">mdi-plus</v-icon>
                    <h4 class="text-primary mb-0">Add More</h4>
                </div>

                <!-- Convenience Fee Checkbox -->
                <v-checkbox v-model="convenienceFeeEnabled" label="Convenience Fee" />

                <!-- Convenience Fee Input -->
                <v-text-field v-if="convenienceFeeEnabled" v-model="convenienceFee" placeholder="Enter convenience fee"
                    variant="outlined" @input="convenienceFee = convenienceFee.replace(/[^0-9.]/g, '')" />

                <!-- Buttons -->
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
import { ref, watch } from 'vue';
import api from '@/plugins/axios';
import { useEventStore } from '@/store/eventStore';
import { useSnackbarStore } from '@/store/snackbar';

const store = useEventStore();
const snackbar = useSnackbarStore();

// Default ticket type
const ticketType = ref('Paid Ticket');

// Ticket array (user can add multiple tickets)
// Initialize tickets: use stored tickets if available, else default
const tickets = ref(
    store.formData.tickets?.length
        ? store.formData.tickets.map((t) => ({
            name: t.ticket_name || '',
            description: t.description || '',
            price: t.price != null ? t.price.toString() : '',
            capacity: t.capacity != null ? t.capacity.toString() : '',
            isFree: t.is_free || false,
        }))
        : [
            {
                name: '',
                description: '',
                price: '',
                capacity: '',
                isFree: false,
            },
        ]
);


const convenienceFeeEnabled = ref(false);
const convenienceFee = ref('');

// Add another ticket
const addTicket = () => {
    tickets.value.push({
        name: '',
        description: '',
        price: '',
        capacity: '',
        isFree: false
    });
};

// Remove a ticket by index
const removeTicket = (index) => {
    if (tickets.value.length > 1) {
        tickets.value.splice(index, 1);
    }
};

watch(ticketType, (newVal) => {
    tickets.value = tickets.value.map((t) => ({
        ...t,
        isFree: newVal === 'Free Ticket',
        price: newVal === 'Free Ticket' ? '0' : t.price // 👈 price = 0 if free ticket
    }));
});



// Submit tickets
const handleSubmit = async () => {
    try {
        // Build payload as requested
        const payload = {
            event_id: store.formData.basicInfo?.id,
            tickets: tickets.value.map((t) => ({
                is_free: t.isFree, // ✅ each ticket decides free/paid
                ticket_name: t.name,
                description: t.description,
                price: t.isFree ? null : Number(t.price || 0),
                capacity: Number(t.capacity || 0),
                convenience_fee: t.isFree || !convenienceFeeEnabled.value ? null : Number(convenienceFee.value || 0)
            }))
        };

        console.log('payload sending:', payload); // debug

        const res = await api.post('/events/tickets', payload);

        if (res.data.status) {
            store.formData.tickets = res.data.data;
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

// Go back / cancel
const handleCancel = () => {
    store.resetTickets?.();
    store.prevStep();
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
