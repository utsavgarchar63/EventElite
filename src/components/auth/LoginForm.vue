<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import api from '@/plugins/axios';
import { useSnackbarStore } from '@/store/snackbar';
const snackbar = useSnackbarStore();
const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);
const showPassword = ref(false);

const errors = ref({
    email: '',
    password: ''
});

const validateForm = () => {
    let isValid = true;
    errors.value.email = '';
    errors.value.password = '';

    if (!email.value) {
        errors.value.email = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        errors.value.email = 'Invalid email format';
        isValid = false;
    }

    if (!password.value) {
        errors.value.password = 'Password is required';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    loading.value = true;
    try {
        const response = await api.post("/admin/login", {
            email: email.value,
            password: password.value,
            fcm_token: "4gD7Y8oW3l-T9pU5rC2eN6xS1mJ0fG3vQ7zK1bR4aD6"
        });

        const responseData = response.data;

        if (responseData.status) {
            // Save token and user data in store/localStorage


            // Optional: Store additional flags if present
            if (responseData.registration_complete !== undefined) {
                localStorage.setItem("registration_complete", responseData.registration_complete.toString());
            }
            if (responseData.payment_complete !== undefined) {
                localStorage.setItem("payment_complete", responseData.payment_complete.toString());
            }
            if (responseData.registration_complete === false && responseData.payment_complete === false && responseData.role == "admin") {
                localStorage.setItem("currentStep", "2");
                localStorage.setItem("legal_name", responseData.data.legal_name);
                localStorage.setItem("admin_id", responseData.data.id.toString());
                await router.push("/auth/register");
                return;
            } else {
                authStore.setUser(responseData.data);
                authStore.setToken(responseData.token);
                authStore.setRole(responseData.role);

                localStorage.setItem("token", responseData.token);
                localStorage.setItem("admin_id", responseData.data.id.toString());
                localStorage.setItem("role", responseData.role);
            }

            if (responseData.role == "super_admin") {
                router.push("/super-admin/dashboard");
            } else if (responseData.role == "admin") {
                router.push("/admin/dashboard");
            } else if (responseData.role == "user") {
                router.push("/user/dashboard");
            }

        } else {
            snackbar.show(responseData.message || "Login failed", "error");

        }
    } catch (error: any) {
        console.error("Login failed:", error);
        snackbar.show(error.response?.data?.message || "Login failed", "error");

    } finally {
        loading.value = false;
    }
};




</script>

<template>
    <v-form @submit.prevent="handleSubmit">
        <v-row>
            <v-col cols="12">
                <v-label>Email</v-label>
                <v-text-field v-model="email" variant="outlined" hide-details="auto" color="primary"
                    placeholder="Enter your email" :error="!!errors.email" :error-messages="errors.email" />
            </v-col>

            <v-col cols="12">
                <v-label>Password</v-label>
                <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'" variant="outlined"
                    hide-details="auto" color="primary" placeholder="Enter your password" :error="!!errors.password"
                    :error-messages="errors.password"
                    :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    @click:append-inner="showPassword = !showPassword" />
            </v-col>

            <v-col cols="12" class="pt-0">
                <div class="d-flex align-center">
                    <v-checkbox v-model="rememberMe" color="primary" hide-details label="Remember me" />
                    <div class="ml-auto">
                        <RouterLink to="/forget-password" class="text-primary text-decoration-none">
                            Forget Password?
                        </RouterLink>
                    </div>
                </div>
            </v-col>

            <v-col cols="12" class="pt-0">
                <v-btn type="submit" :loading="loading" color="primary" size="large" block flat>
                    Log in
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
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

</template>
