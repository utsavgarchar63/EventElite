<template>
     <v-container>
          <v-row>
               <!-- Cards for Super Admin -->
               <template v-if="role === 'super_admin'">
                    <v-col v-for="card in superAdminCards" :key="card.title" cols="12" sm="6" md="3"
                         style="padding: 0 7px;">
                         <div>
                              <MetricCard :title="card.title" :avatarColor="card.avatarColor" :value="card.value"
                                   :growth="card.growth" :icon="card.icon" />
                         </div>
                    </v-col>
                    <v-col cols="12" class="d-flex justify-end" style="margin-top: 20px;">
                         <v-btn color="primary" @click="openDialog" prepend-icon="mdi-plus">
                              Add New Admin
                         </v-btn>
                    </v-col>
                    <v-dialog v-model="dialog" max-width="600px" persistent>
                         <v-card class="pa-4">
                              <v-card-title class="d-flex justify-space-between ">
                                   <div>
                                        <h2 class="mb-2">Invite Organization Admin</h2>
                                        <div class="text-body-1 text-muted mb-3">
                                             <p>Please enter the admin details below.</p>
                                        </div>
                                   </div>
                                   <!-- Close button -->
                                   <v-btn icon @click="dialog = false">
                                        <v-icon>mdi-close</v-icon>
                                   </v-btn>
                              </v-card-title>
                              <v-card-text>
                                   <v-form ref="formRef" @submit.prevent="handleSubmit">
                                        <v-row>
                                             <!-- Name -->
                                             <!-- First Name -->
                                             <v-col cols="12">
                                                  <v-label>First Name</v-label>
                                                  <v-text-field v-model="firstName" variant="outlined"
                                                       hide-details="auto" color="primary"
                                                       placeholder="Enter first name" :error="!!errors.firstName"
                                                       :error-messages="errors.firstName" />
                                             </v-col>

                                             <!-- Last Name -->
                                             <v-col cols="12">
                                                  <v-label>Last Name</v-label>
                                                  <v-text-field v-model="lastName" variant="outlined"
                                                       hide-details="auto" color="primary" placeholder="Enter last name"
                                                       :error="!!errors.lastName" :error-messages="errors.lastName" />
                                             </v-col>


                                             <!-- Email -->
                                             <v-col cols="12">
                                                  <v-label>Email</v-label>
                                                  <v-text-field v-model="email" variant="outlined" hide-details="auto"
                                                       color="primary" placeholder="Enter email" :error="!!errors.email"
                                                       :error-messages="errors.email" />
                                             </v-col>

                                             <!-- Phone -->
                                             <v-col cols="12">
                                                  <v-label>Phone</v-label>
                                                  <v-text-field v-model="phone" variant="outlined" hide-details="auto"
                                                       color="primary" placeholder="Enter phone number"
                                                       :error="!!errors.phone" :error-messages="errors.phone" />
                                             </v-col>


                                             <!-- Checkbox for creating new org -->

                                             <!-- Legal name input when checkbox checked -->
                                             <v-col cols="12">
                                                  <v-select v-model="organizationId" :items="organizationList"
                                                       item-title="legal_name" item-value="id"
                                                       label="Select Organization" variant="outlined"
                                                       placeholder="Select an existing organization" />
                                             </v-col>
                                             <v-checkbox v-model="createNewOrg" label="Create a new organization" />


                                             <v-col cols="12 " class="mb-5">
                                                  <v-text-field v-model="legalName" variant="outlined"
                                                       hide-details="auto" color="primary"
                                                       placeholder="Enter organization legal business name" />
                                             </v-col>
                                        </v-row>
                                        <v-btn :loading="loading" type="submit" color="primary" size="large" block flat>
                                             Invite Org Admin
                                        </v-btn>
                                   </v-form>
                              </v-card-text>
                         </v-card>
                    </v-dialog>

                    <Organizations />
               </template>
          </v-row>
          <v-snackbar v-model="useSnackbarStore().snackbar" :color="useSnackbarStore().color" timeout="4000"
               location="top right" transition="slide-x-reverse-transition" class="custom-snackbar">
               <div class="snackbar-content">
                    <v-icon v-if="useSnackbarStore().color === 'success'" size="22" class="me-1" color="white">
                         mdi-check-circle
                    </v-icon>
                    <v-icon v-else-if="useSnackbarStore().color === 'error'" size="22" class="me-1" color="white">
                         mdi-alert-circle
                    </v-icon>
                    <v-icon v-else size="22" color="white" class="me-1">
                         mdi-information
                    </v-icon>
                    <span class="snackbar-text">{{ useSnackbarStore().message }}</span>
               </div>
          </v-snackbar>
     </v-container>
</template>



<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/plugins/axios";
import MetricCard from "@/components/dashboard/MetricCard.vue";
import dollarIcon from "@/assets/images/icons/dollar.svg";
import calanderIcon from "@/assets/images/icons/calander.svg";
import ticketIcon from "@/assets/images/icons/ticket.svg";
import Organizations from "../components/Organizations.vue";
import { useSnackbarStore } from "@/store/snackbar";

const snackbar = useSnackbarStore();
const onGoingEvents = ref<any[]>([]);
const role = localStorage.getItem("role") || "admin";

// Dialog state
const dialog = ref(false);
const loading = ref(false);
const formRef = ref(null);

// Form fields
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const phone = ref("");
const organizationId = ref<number | null>(null);
const createNewOrg = ref(false);
const legalName = ref("");
const adminRevenueGraph = ref<{ month: string; total: number }[]>([
     { month: 'Jan', total: 31000 },
     { month: 'Feb', total: 20000 },
     { month: 'Mar', total: 30000 },
     { month: 'Apr', total: 25000 },
     { month: 'May', total: 12000 },
     { month: 'Jun', total: 25000 },
     { month: 'Jul', total: 35000 },
     { month: 'Aug', total: 41500 },
     { month: 'Sep', total: 28000 },
     { month: 'Oct', total: 31000 },
     { month: 'Nov', total: 17000 },
     { month: 'Dec', total: 40000 }
]);
const adminSalesData = ref({ sold: 0, left: 0, total: 0 });

// Error state
const errors = ref({
     firstName: "",
     lastName: "",
     email: "",
     phone: "",
     legalName: ""
});


// Organization list
const organizationList = ref<any[]>([]);

// Fetch organizations
const fetchOrganizations = async () => {
     try {
          const response = await api.get("/organisation-list");
          if (response.data.status) {
               organizationList.value = response.data.data.map((org: any) => ({
                    id: org.id,
                    legal_name: org.legal_name
               }));
          }
     } catch (error) {
          console.error("Failed to fetch organizations:", error);
     }
};

const openDialog = () => {
     fetchOrganizations();
     dialog.value = true;
};
// Validate form
const validateForm = () => {
     let isValid = true;
     errors.value = { firstName: "", lastName: "", email: "", phone: "", legalName: "" };

     if (!firstName.value) {
          errors.value.firstName = "First name is required";
          isValid = false;
     }
     if (!lastName.value) {
          errors.value.lastName = "Last name is required";
          isValid = false;
     }
     if (!email.value) {
          errors.value.email = "Email is required";
          isValid = false;
     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
          errors.value.email = "Invalid email format";
          isValid = false;
     }
     if (!phone.value) {
          errors.value.phone = "Phone is required";
          isValid = false;
     }
     if (createNewOrg.value && !legalName.value) {
          errors.value.legalName = "Legal name is required";
          isValid = false;
     }


     return isValid;
};

// Submit form
const handleSubmit = async () => {
     if (!validateForm()) return; // Only submit if valid

     loading.value = true;

     try {
          let payload: any = {
               first_name: firstName.value,
               last_name: lastName.value,
               email: email.value,
               phone: phone.value
          };

          // Logic for legal_name and organization_id
          if (legalName.value) {
               payload.legal_name = legalName.value;
               payload.organization_id = ""; // Empty if legal_name exists
          } else if (organizationId.value) {
               payload.organization_id = organizationId.value;
               payload.legal_name = ""; // Empty if organization_id exists
          } else {
               payload.legal_name = "";
               payload.organization_id = "";
          }
          console.log("Submitting payload:", payload);

          const response = await api.post("/super-admin/add-admin", payload);
          if (response.data.status) {
               snackbar.show("Admin added successfully!", "success");
               dialog.value = false;
               resetForm();
          } else {
               snackbar.show(response.data.message || "Failed to add admin", "error");
          }
     } catch (error: any) {
          console.error("Failed to add admin:", error);
          snackbar.show(error.response?.data?.message || "Error adding admin", "error");
     } finally {
          loading.value = false;
     }
};



// Reset form
const resetForm = () => {
     firstName.value = "";
     lastName.value = "";
     email.value = "";
     phone.value = "";
     organizationId.value = null;
     createNewOrg.value = false;
     legalName.value = "";
     errors.value = { firstName: "", lastName: "", email: "", phone: "", legalName: "" };
};



// Cards data
const superAdminCards = ref([
     {
          title: "Total Organization",
          value: 0,
          growth: 0,
          icon: calanderIcon,
          avatarColor: "primary"
     },
     {
          title: "Total Events",
          value: 0,
          growth: 0,
          icon: calanderIcon,
          avatarColor: "primary"
     },
     {
          title: "Membership Revenue",
          value: "$0",
          growth: 0,
          icon: dollarIcon,
          avatarColor: "#33B875"
     },
     {
          title: "Total Revenue",
          value: "$0",
          growth: 0,
          icon: dollarIcon,
          avatarColor: "#33B875"
     }
]);

const fetchSuperAdminStats = async () => {
     try {
          const response = await api.get("/dashboard/stats");
          if (response.data.success) {
               const stats = response.data.data;
               superAdminCards.value = [
                    {
                         title: "Total Organization",
                         value: stats.total_organizations.total,
                         growth: stats.total_organizations.change_percent,
                         icon: calanderIcon,
                         avatarColor: "primary"
                    },
                    {
                         title: "Total Events",
                         value: stats.total_events.total,
                         growth: stats.total_events.change_percent,
                         icon: calanderIcon,
                         avatarColor: "primary"
                    },
                    {
                         title: "Membership Revenue",
                         value: `$${stats.admin_revenue.total}`,
                         growth: stats.admin_revenue.change_percent,
                         icon: dollarIcon,
                         avatarColor: "#33B875"
                    },
                    {
                         title: "Total Revenue",
                         value: `$${stats.total_revenue.total}`,
                         growth: stats.total_revenue.change_percent,
                         icon: dollarIcon,
                         avatarColor: "#33B875"
                    }
               ];
          }
     } catch (error) {
          console.error("Failed to fetch super admin stats:", error);
     }
};

onMounted(() => {
     if (role === "super_admin") {
          fetchSuperAdminStats();
     }
});
</script>