<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/plugins/axios';
import { useSnackbarStore } from '@/store/snackbar';
import { UserIcon, MailIcon, PhoneIcon } from 'vue-tabler-icons';

const router = useRouter();
const snackbar = useSnackbarStore();

const user = ref<{ id: number; name: string; email: string; phone_no: string } | null>(null);
const editedUser = ref<{ name: string; email: string; phone_no: string }>({
    name: '',
    email: '',
    phone_no: ''
});

const isEditing = ref(false);
const loading = ref(false);

onMounted(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
        user.value = JSON.parse(userData);
        if (user.value) {
            editedUser.value = {
                name: user.value.name,
                email: user.value.email,
                phone_no: user.value.phone_no
            };
        }
    } else {
        router.push('/auth/login');
    }
});

const handleEdit = () => {
    if (user.value) {
        editedUser.value = {
            name: user.value.name,
            email: user.value.email,
            phone_no: user.value.phone_no
        };
        isEditing.value = true;
    }
};

const handleCancel = () => {
    if (user.value) {
        editedUser.value = {
            name: user.value.name,
            email: user.value.email,
            phone_no: user.value.phone_no
        };
        isEditing.value = false;
    }
};

const handleSave = async () => {
    if (!user.value) return;
    loading.value = true;
    try {
        const response = await api.put(`/users/${user.value.id}`, {
            name: editedUser.value.name
        });
        const updatedUser = response.data.data;
        user.value = { ...updatedUser };
        editedUser.value = { ...updatedUser };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        snackbar.show('Profile updated successfully!', 'success');
        isEditing.value = false;
    } catch (err: any) {
        snackbar.show(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
        loading.value = false;
    }
};

const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    snackbar.show('Logged out successfully.', 'info');
    router.push('/auth/login');
};
</script>

<template>
<v-container class="py-10" fluid>
    <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="5" lg="4">
            <v-card class="profile-card pa-6 text-center" elevation="8">
                
                <!-- Avatar -->
                <v-avatar size="120" class="mx-auto mb-4 hover-avatar">
                    <img src="@/assets/images/users/avatar-1.png" alt="Profile" />
                </v-avatar>

                <!-- Name -->
                <h2 class="text-h5 font-weight-bold mb-1">{{ isEditing ? editedUser.name : user?.name }}</h2>

                <v-divider class="my-4"></v-divider>

                <!-- Profile Form -->
                <v-form @submit.prevent="handleSave">
                    <v-list dense class="text-left">
                        <!-- Name -->
                        <v-list-item>
                            <template #prepend>
                                <UserIcon size="20" stroke-width="1.5" />
                            </template>
                            <v-list-item-title>
                                <v-text-field
                                    v-if="isEditing"
                                    v-model="editedUser.name"
                                    label="Full Name"
                                    placeholder="Enter your name"
                                    variant="outlined"
                                    dense
                                    clearable
                                />
                                <span v-else>{{ user?.name }}</span>
                            </v-list-item-title>
                        </v-list-item>

                        <!-- Email -->
                        <v-list-item>
                            <template #prepend>
                                <MailIcon size="20" stroke-width="1.5" />
                            </template>
                            <v-list-item-title>
                                <v-text-field
                                    v-if="isEditing"
                                    v-model="editedUser.email"
                                    label="Email"
                                    dense
                                    disabled
                                    variant="outlined"
                                />
                                <span v-else>{{ user?.email }}</span>
                            </v-list-item-title>
                        </v-list-item>

                        <!-- Phone -->
                        <v-list-item>
                            <template #prepend>
                                <PhoneIcon size="20" stroke-width="1.5" />
                            </template>
                            <v-list-item-title>
                                <v-text-field
                                    v-if="isEditing"
                                    v-model="editedUser.phone_no"
                                    label="Phone Number"
                                    dense
                                    disabled
                                    variant="outlined"
                                />
                                <span v-else>{{ user?.phone_no }}</span>
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>

                    <v-divider class="my-4"></v-divider>

                    <!-- Action Buttons -->
                    <div class="d-flex justify-space-between">
                        <v-btn
                            v-if="!isEditing"
                            color="primary"
                            class="w-100"
                            prepend-icon="mdi-pencil"
                            @click="handleEdit"
                        >
                            Edit Profile
                        </v-btn>

                        <div v-else class="d-flex justify-space-between w-100">
                            <v-btn
                                color="success"
                                variant="flat"
                                prepend-icon="mdi-check"
                                :loading="loading"
                                @click="handleSave"
                                class="me-2"
                            >
                                Save
                            </v-btn>
                            <v-btn
                                color="error"
                                variant="outlined"
                                prepend-icon="mdi-close"
                                @click="handleCancel"
                            >
                                Cancel
                            </v-btn>
                        </div>
                    </div>
                </v-form>

                <v-divider class="my-4"></v-divider>

                <!-- Logout Button -->
                <v-btn color="error" variant="outlined" block @click="handleLogout">
                    Logout
                </v-btn>
            </v-card>
        </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.snackbar" :color="snackbar.color" timeout="4000" location="top right" transition="slide-x-reverse-transition">
        <v-icon v-if="snackbar.color === 'success'" size="22" class="me-1">mdi-check-circle</v-icon>
        <v-icon v-else-if="snackbar.color === 'error'" size="22" class="me-1">mdi-alert-circle</v-icon>
        <v-icon v-else size="22" class="me-1">mdi-information</v-icon>
        {{ snackbar.message }}
    </v-snackbar>
</v-container>
</template>

<style scoped>
.profile-card {
    border-radius: 16px;
    backdrop-filter: blur(16px);
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
}
.profile-card:hover {
    transform: translateY(-5px);
}

.hover-avatar {
    transition: transform 0.3s ease;
}
.hover-avatar:hover {
    transform: scale(1.05);
}
</style>
