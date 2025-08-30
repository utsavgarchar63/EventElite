<script setup lang="ts">
import api from "@/plugins/axios";
import { onMounted } from "vue";
import { useSnackbarStore } from "@/store/snackbar";
import { ref } from "vue";
import { router } from "@/router";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessLogo: File | null;
  legalBusinessName: string;
  ein: string;
  businessEmail: string;
  businessPhone: string;
  businessURL: string;
  businessAddress: string;
  nameOnCard: string;
  cardNumber: string;
  validThrough: string;
  cvv: string;
  saveCard: boolean;
}

type ErrorMessages = Partial<Record<keyof FormData, string>>;

const step = ref(1);
const dragActive = ref(false);
const previewUrl = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const snackbar = useSnackbarStore();

const formData = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  businessLogo: null as File | null,
  legalBusinessName: "",
  ein: "",
  businessEmail: "",
  businessPhone: "",
  businessURL: "",
  businessAddress: "",
  nameOnCard: "",
  cardNumber: "",
  validThrough: "",
  cvv: "",
  saveCard: false
});

const errors = ref<ErrorMessages>({}); // store validation errors

const validateStep = () => {
  errors.value = {};
  let valid = true;

  if (step.value === 1) {
    if (!formData.value.firstName.trim()) {
      errors.value.firstName = "First name is required";
      valid = false;
    }
    if (!formData.value.lastName.trim()) {
      errors.value.lastName = "Last name is required";
      valid = false;
    }
    if (!formData.value.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      errors.value.email = "Valid email is required";
      valid = false;
    }
    if (!formData.value.phone.trim() || !/^\d{10}$/.test(formData.value.phone)) {
      errors.value.phone = "Valid 10-digit phone number required";
      valid = false;
    }
    if (!formData.value.password.trim()) {
      errors.value.password = "Password is required";
      valid = false;
    }
    if (formData.value.password !== formData.value.confirmPassword) {
      errors.value.confirmPassword = "Passwords do not match";
      valid = false;
    }
  }

  if (step.value === 2) {
    if (!formData.value.legalBusinessName.trim()) {
      errors.value.legalBusinessName = "Business name is required";
      valid = false;
    }
    if (!formData.value.businessEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.businessEmail)) {
      errors.value.businessEmail = "Valid business email is required";
      valid = false;
    }
    if (!formData.value.businessPhone.trim() || !/^\d{10}$/.test(formData.value.businessPhone)) {
      errors.value.businessPhone = "Valid business phone number required";
      valid = false;
    }
    if (
      formData.value.businessURL.trim() &&
      !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/.test(formData.value.businessURL)
    ) {
      errors.value.businessURL = "Enter a valid URL (e.g., https://example.com)";
      valid = false;
    }
  }

  if (step.value === 3) {
    if (!formData.value.nameOnCard.trim()) {
      errors.value.nameOnCard = "Name on card is required";
      valid = false;
    }
    if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(formData.value.cardNumber)) {
      errors.value.cardNumber = "Enter a valid 16-digit card number";
      valid = false;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(formData.value.validThrough)) {
      errors.value.validThrough = "Enter a valid date (MM/YYYY)";
      valid = false;
    }
    if (!/^\d{3,4}$/.test(formData.value.cvv)) {
      errors.value.cvv = "Enter a valid CVV";
      valid = false;
    }
  }

  return valid;
};



const triggerFileBrowse = () => {
  fileInput.value?.click();
};


const handleFile = (file: File) => {
  formData.value.businessLogo = file;
  previewUrl.value = URL.createObjectURL(file);
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  if (e.dataTransfer?.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
};

const onBrowse = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.length) {
    handleFile(target.files[0]);
  }
};

const removeFile = () => {
  formData.value.businessLogo = null;
  previewUrl.value = null;
}


onMounted(() => {
  const savedStep = localStorage.getItem("currentStep");
  const savedData = localStorage.getItem("formData");
  const savedLegalName = localStorage.getItem("legal_name");

  if (savedStep) {
    step.value = parseInt(savedStep);
  }

  // if (savedData) {
  //   Object.assign(formData.value, JSON.parse(savedData));
  // }

  // ✅ Pre-fill legal business name if available
  if (savedLegalName) {
    formData.value.legalBusinessName = savedLegalName;
  }
});


// const handleFileUpload = (e: Event) => {
//   const target = e.target as HTMLInputElement;
//   formData.value.businessLogo = target.files?.[0] || null;
// };


// format card number with spaces every 4 digits
const formatCardNumber = () => {
  formData.value.cardNumber = formData.value.cardNumber
    .replace(/\D/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
};

// format valid through as MM/YYYY
const formatValidThrough = () => {
  let v = formData.value.validThrough.replace(/\D/g, "");
  if (v.length >= 2) {
    v = v.substring(0, 2) + "/" + v.substring(2, 6);
  }
  formData.value.validThrough = v;
};

const submitForm = () => {
  if (validateStep()) {
    console.log("Form Data:", formData.value);
    alert("Form submitted!");
  }
};

const handleBackendErrors = (error: any) => {
  if (error.response?.data?.errors) {
    const backendErrors = error.response.data.errors;

    // ✅ Map backend errors to local `errors` object for form validation UI
    for (const key in backendErrors) {
      errors.value[key as keyof FormData] = backendErrors[key][0];
    }

    // ✅ Combine all error messages into one string for Snackbar
    const errorMessages = ([] as string[]).concat(...Object.keys(backendErrors).map(key => backendErrors[key]));
    snackbar.show(errorMessages.join(", "), "error"); // ✅ FIXED
  } else {
    snackbar.show("Something went wrong. Please try again.", "error");
  }
};

// Personal Info onSubmit
const submitPersonalInfo = async () => {
  if (!validateStep()) return;

  try {
    const response = await api.post("/admin/register/personal", {
      first_name: formData.value.firstName,
      last_name: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone,
      password: formData.value.password,
    });

    const responseData = response.data.data;
    localStorage.setItem("token", responseData.token);
    localStorage.setItem("admin_id", responseData.admin_id);

    // ✅ Save step and form data in localStorage
    step.value = 2;
    localStorage.setItem("currentStep", step.value.toString());
    localStorage.setItem("formData", JSON.stringify(formData.value));

    snackbar.show("Personal info saved!", "success");
  } catch (error: any) {
    handleBackendErrors(error);
  }
};



// Business Info onSubmit
const submitBusinessInfo = async () => {
  if (!validateStep()) return;

  try {
    const fd = new FormData();
    fd.append("admin_id", localStorage.getItem("admin_id") || "");
    fd.append("legal_name", formData.value.legalBusinessName);
    fd.append("ein", formData.value.ein);
    fd.append("email", formData.value.businessEmail);
    fd.append("phone", formData.value.businessPhone);
    fd.append("url", formData.value.businessURL);
    fd.append("type", "Indian IT Services");
    fd.append("address", formData.value.businessAddress);
    if (formData.value.businessLogo) {
      fd.append("logo", formData.value.businessLogo);
    }

    const response = await api.post("/admin/register/business", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    const responseData = response.data.data;
    localStorage.setItem("organization_id", responseData.organization_id.toString());

    // ✅ Save step and form data
    step.value = 3;
    localStorage.setItem("currentStep", step.value.toString());
    localStorage.setItem("formData", JSON.stringify(formData.value));

    snackbar.show("Business info saved!", "success");
  } catch (error: any) {
    handleBackendErrors(error);
  }
};


// Utility to generate random transaction ID
const generateTransactionId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Payment Info Submit

const submitPaymentInfo = async () => {
  if (!validateStep()) return;

  const admin_id = localStorage.getItem("admin_id");
  const organization_id = localStorage.getItem("organization_id");

  if (!admin_id || !organization_id) {
    snackbar.show("Admin ID or Organization ID is missing. Please complete previous steps.", "error");
    return;
  }

  try {
    const transactionId = generateTransactionId(10);

    await api.post("/admin/register/payment", {
      admin_id,
      organization_id,
      transaction_id: transactionId,
      amount: 499.99,
      status: "paid",
      payment_method: "credit_card",
      paid_at: new Date().toISOString().slice(0, 19).replace("T", " ")
    });

    snackbar.show("Account created & payment successful!", "success");

    localStorage.removeItem("currentStep");
    localStorage.removeItem("formData");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("organization_id");
    localStorage.removeItem("token");

    // ✅ Redirect to login page
    router.push("/auth/login");

  } catch (error: any) {
    handleBackendErrors(error);
  }
};

</script>

<template>
  <v-container class="pa-0">
    <!-- Step Header -->
    <div class="stepper">
      <div v-for="n in 3" :key="n" class="step">
        <div class="step-circle" :class="{
          active: step === n,
          completed: step > n
        }">
          <v-icon v-if="step > n" size="18">mdi-check</v-icon>
          <span v-else>{{ n }}</span>
        </div>
        <span class="step-label" :class="{ activeLabel: step === n }">
          {{ n === 1 ? 'Personal Info' : n === 2 ? 'Business Info' : 'Payment' }}
        </span>
      </div>
    </div>

    <!-- Step 1 -->
    <v-card flat v-if="step === 1">
      <v-row>
        <v-col cols="12" md="6">
          <v-label>First Name</v-label>
          <v-text-field v-model="formData.firstName" :error-messages="errors.firstName" variant="outlined"
            hide-details="auto" color="primary" placeholder="Enter your first name" />
        </v-col>
        <v-col cols="12" md="6">
          <v-label>Last Name</v-label>
          <v-text-field v-model="formData.lastName" :error-messages="errors.lastName" variant="outlined"
            hide-details="auto" color="primary" placeholder="Enter your last name" />
        </v-col>
      </v-row>

      <v-label>Email</v-label>
      <v-text-field type="email" v-model="formData.email" :error-messages="errors.email" variant="outlined"
        hide-details="auto" color="primary" placeholder="Enter your email" />

      <v-label>Phone Number</v-label>
      <v-text-field v-model="formData.phone" :error-messages="errors.phone" variant="outlined" hide-details="auto"
        color="primary" placeholder="Enter your phone number" />

      <v-label>Password</v-label>
      <v-text-field type="password" v-model="formData.password" :error-messages="errors.password" variant="outlined"
        hide-details="auto" color="primary" placeholder="Enter your password" />

      <v-label>Confirm Password</v-label>
      <v-text-field type="password" v-model="formData.confirmPassword" :error-messages="errors.confirmPassword"
        variant="outlined" hide-details="auto" color="primary" placeholder="Re-enter your password" />

      <v-btn block color="primary" class="mt-4" @click="submitPersonalInfo">Create Account</v-btn>
    </v-card>

    <!-- Step 2 -->
    <v-card flat v-if="step === 2">
      <v-label>Upload Business Logo</v-label>
      <!-- <v-file-input accept="image/*" @change="handleFileUpload" variant="outlined" hide-details="auto"
        color="primary" /> -->
      <div class="upload-box" :class="{ active: dragActive }" @dragover.prevent="dragActive = true"
        @dragleave.prevent="dragActive = false" @drop="onDrop" @click="triggerFileBrowse">
        <input type="file" accept="image/*" ref="fileInput" class="hidden-input" @change="onBrowse" />

        <div v-if="!previewUrl" class="upload-content">
          <v-icon size="36" color="primary">mdi-cloud-upload</v-icon>
          <p>Drag & Drop your logo here or <span class="browse-text">browse</span></p>
        </div>

        <div v-else class="preview">
          <img :src="previewUrl" alt="Business Logo Preview" />
          <v-btn size="small" variant="outlined" color="error" @click.stop="removeFile">
            Remove
          </v-btn>
        </div>
      </div>

      <v-label>Legal Business Name</v-label>
      <v-text-field v-model="formData.legalBusinessName" :error-messages="errors.legalBusinessName"
        placeholder="Enter legal business name" variant="outlined" hide-details="auto" color="primary" />

      <v-label>EIN</v-label>
      <v-text-field placeholder="Enter EIN" v-model="formData.ein" variant="outlined" hide-details="auto"
        color="primary" />

      <v-label>Business Email</v-label>
      <v-text-field placeholder="Enter business email" v-model="formData.businessEmail"
        :error-messages="errors.businessEmail" variant="outlined" hide-details="auto" color="primary" />

      <v-label>Business Phone Number</v-label>
      <v-text-field placeholder="Enter business phone number" v-model="formData.businessPhone"
        :error-messages="errors.businessPhone" variant="outlined" hide-details="auto" color="primary" />

      <v-label>Business URL</v-label>
      <v-text-field placeholder="Enter business url" v-model="formData.businessURL" :error-messages="errors.businessURL"
        variant="outlined" hide-details="auto" color="primary" />

      <v-label>Business Address</v-label>
      <v-textarea placeholder="Enter business address here" v-model="formData.businessAddress" variant="outlined"
        hide-details="auto" color="primary" />

      <!-- <div class="d-flex justify-space-between mt-4">
        <v-btn variant="outlined" @click="prevStep">Back</v-btn>
        <v-btn color="primary" @click="nextStep">Next</v-btn>
      </div> -->
      <v-btn block color="primary" @click="submitBusinessInfo">Create Account</v-btn>

    </v-card>

    <!-- Step 3 -->
    <v-card flat v-if="step === 3">
      <v-label>Name on Card</v-label>
      <v-text-field v-model="formData.nameOnCard" :error-messages="errors.nameOnCard" variant="outlined"
        placeholder="Enter card holder name" hide-details="auto" color="primary" />

      <v-label>Card Number</v-label>
      <v-text-field v-model="formData.cardNumber" @input="formatCardNumber" :error-messages="errors.cardNumber"
        variant="outlined" hide-details="auto" color="primary" placeholder="0000 0000 0000 0000" />

      <v-row>
        <v-col cols="6">
          <v-label>Valid Through</v-label>
          <v-text-field placeholder="MM/YYYY" v-model="formData.validThrough" @input="formatValidThrough"
            :error-messages="errors.validThrough" variant="outlined" hide-details="auto" color="primary" />
        </v-col>
        <v-col cols="6">
          <v-label>CVV</v-label>
          <v-text-field placeholder="Enter CVV" v-model="formData.cvv" maxlength="4" :error-messages="errors.cvv"
            variant="outlined" hide-details="auto" color="primary" />
        </v-col>
      </v-row>
      <v-checkbox label="Save this card" v-model="formData.saveCard" />

      <!-- <div class="d-flex justify-space-between mt-4">
        <v-btn variant="outlined" @click="prevStep">Back</v-btn>
        <v-btn color="primary" @click="submitForm">Submit</v-btn>
      </div> -->
      <v-btn block color="primary" @click="submitPaymentInfo">Pay and Create Account</v-btn>

    </v-card>
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

<style scoped>
.upload-box {
  border: 2px dashed #cfd8dc;
  border-radius: 8px;
  padding: 25px;
  margin: 20px 0;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.upload-box.active {
  border-color: #2A85FF;
  background: #e3f2fd;
}

.hidden-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #555;
}

.browse-text {
  color: #2A85FF;
  font-weight: 500;
}

.preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview img {
  max-width: 120px;
  border-radius: 8px;
}

.stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 30px 0;
  /* Allow wrapping on small screens */
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  /* Flexible step sizing */
  min-width: 100px;
}

.step-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #cfd8dc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #cfd8dc;
  flex-shrink: 0;
}

.step-circle.active {
  border-color: #2A85FF;
  color: #2A85FF;
}

.step-circle.completed {
  background-color: #70CF97;
  border-color: #70CF97;
  color: white;
}

.step-label {
  font-weight: 500;
  color: #757575;
}

.step-label.activeLabel {
  color: #000;
}

.v-label {
  font-weight: 500;
}

.v-text-field,
.v-textarea,
.v-file-input {
  margin-bottom: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  
  .step {
    width: 100%;
    justify-content: flex-start;
  }

  .step-circle {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }

  .step-label {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .step-circle {
    width: 22px;
    height: 22px;
    font-size: 11px;
  }

  .step-label {
    font-size: 12px;
  }
}
</style>
