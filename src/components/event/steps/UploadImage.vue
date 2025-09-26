<template>
    <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <div class="form-wrapper">
            <!-- Heading -->
            <div class="mb-8">
                <h4 class="text-h2 font-weight-bold">Media & Marketing</h4>
                <p class="mt-1" style="color: #525454">Please upload an image, video, or provide links for the event.
                </p>
            </div>

            <v-form @submit.prevent="handleSubmit">
                <!-- Event Logo -->
                <div class="upload-box" :class="{ active: dragActiveLogo }" @dragover.prevent="dragActiveLogo = true"
                    @dragleave.prevent="dragActiveLogo = false" @drop="onDropLogo" @click="triggerLogoBrowse">
                    <input type="file" accept="image/*" ref="logoInput" class="hidden-input" @change="onLogoBrowse" />
                    <div v-if="!previewLogo" class="upload-content">
                        <v-icon size="36" color="primary">mdi-image</v-icon>
                        <p>Drag & Drop your event logo or <span class="browse-text">browse</span></p>
                    </div>
                    <div v-else class="preview">
                        <img :src="previewLogo" alt="Event Logo Preview" />
                        <v-btn size="small" variant="outlined" color="error" @click.stop="removeLogo">Remove</v-btn>
                    </div>
                </div>
                <div v-if="logoError" class="error-text">{{ logoError }}</div>

                <!-- Event Image -->
                <div class="upload-box mt-4" :class="{ active: dragActiveImage }"
                    @dragover.prevent="dragActiveImage = true" @dragleave.prevent="dragActiveImage = false"
                    @drop="onDropImage" @click="triggerImageBrowse">
                    <input type="file" accept="image/*" ref="imageInput" class="hidden-input" @change="onImageBrowse" />
                    <div v-if="!previewImage" class="upload-content">
                        <v-icon size="36" color="primary">mdi-image</v-icon>
                        <p>Drag & Drop event image/poster or <span class="browse-text">browse</span></p>
                    </div>
                    <div v-else class="preview">
                        <img :src="previewImage" alt="Event Image Preview" />
                        <v-btn size="small" variant="outlined" color="error" @click.stop="removeImage">Remove</v-btn>
                    </div>
                </div>
                <div v-if="imageError" class="error-text">{{ imageError }}</div>

                <!-- Event Video -->
                <div class="upload-box mt-4" :class="{ active: dragActiveVideo }"
                    @dragover.prevent="dragActiveVideo = true" @dragleave.prevent="dragActiveVideo = false"
                    @drop="onDropVideo" @click="triggerVideoBrowse">
                    <input type="file" accept="video/*" ref="videoInput" class="hidden-input" @change="onVideoBrowse" />
                    <div v-if="!previewVideo" class="upload-content">
                        <v-icon size="36" color="primary">mdi-video</v-icon>
                        <p>Drag & Drop event video or <span class="browse-text">browse</span></p>
                    </div>
                    <div v-else class="preview">
                        <video :src="previewVideo" controls style="max-width: 200px; border-radius: 8px"></video>
                        <v-btn size="small" variant="outlined" color="error" @click.stop="removeVideo">Remove</v-btn>
                    </div>
                </div>
                <div v-if="videoError" class="error-text">{{ videoError }}</div>

                <!-- Social Media Links -->
                <v-text-field v-model="facebookLink" variant="outlined" placeholder="Facebook link"
                    class="mt-4"></v-text-field>
                <v-text-field v-model="instagramLink" variant="outlined" placeholder="Instagram link"
                    class="mt-2"></v-text-field>
                <v-text-field v-model="twitterLink" variant="outlined" placeholder="Twitter link"
                    class="mt-2"></v-text-field>
                <v-text-field v-model="linkedinLink" variant="outlined" placeholder="LinkedIn link"
                    class="mt-2"></v-text-field>

                <!-- Buttons -->
                <v-row class="mt-4">
                    <v-col cols="12" class="d-flex justify-end">
                        <v-btn color="primary" size="large" variant="outlined" class="mr-2" @click="handleCancel"> Go
                            Back </v-btn>
                        <v-btn type="submit" color="primary" size="large">Save and Exit</v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </div>
    </v-container>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/plugins/axios';
import { useEventStore } from '@/store/eventStore';
import { useSnackbarStore } from '@/store/snackbar';

const store = useEventStore();
const snackbar = useSnackbarStore();

// File refs
const eventLogo = ref(null);
const eventImage = ref(null);
const eventVideo = ref(null);
const previewLogo = ref(null);
const previewImage = ref(null);
const previewVideo = ref(null);

// Drag state
const dragActiveLogo = ref(false);
const dragActiveImage = ref(false);
const dragActiveVideo = ref(false);

// Inputs
const logoInput = ref(null);
const imageInput = ref(null);
const videoInput = ref(null);

// Errors
const logoError = ref('');
const imageError = ref('');
const videoError = ref('');

// Social links
const facebookLink = ref('');
const instagramLink = ref('');
const twitterLink = ref('');
const linkedinLink = ref('');

// Helper functions
const handleFile = (file, targetRef, previewRef, maxMB, errorRef) => {
    if (!file) return;
    if (file.size / 1024 / 1024 > maxMB) {
        errorRef.value = `Max file size: ${maxMB}MB`;
        return;
    }
    errorRef.value = '';
    targetRef.value = file;
    previewRef.value = URL.createObjectURL(file);
};

const removeFile = (targetRef, previewRef, errorRef) => {
    if (previewRef.value) URL.revokeObjectURL(previewRef.value);
    targetRef.value = null;
    previewRef.value = null;
    errorRef.value = '';
};

// Logo handlers
const onLogoBrowse = (e) => handleFile(e.target.files[0], eventLogo, previewLogo, 10, logoError);
const onDropLogo = (e) => {
    e.preventDefault();
    dragActiveLogo.value = false;
    handleFile(e.dataTransfer.files[0], eventLogo, previewLogo, 10, logoError);
};
const removeLogo = () => removeFile(eventLogo, previewLogo, logoError);
const triggerLogoBrowse = () => logoInput.value?.click();

// Image handlers
const onImageBrowse = (e) => handleFile(e.target.files[0], eventImage, previewImage, 10, imageError);
const onDropImage = (e) => {
    e.preventDefault();
    dragActiveImage.value = false;
    handleFile(e.dataTransfer.files[0], eventImage, previewImage, 10, imageError);
};
const removeImage = () => removeFile(eventImage, previewImage, imageError);
const triggerImageBrowse = () => imageInput.value?.click();

// Video handlers
const onVideoBrowse = (e) => handleFile(e.target.files[0], eventVideo, previewVideo, 500, videoError);
const onDropVideo = (e) => {
    e.preventDefault();
    dragActiveVideo.value = false;
    handleFile(e.dataTransfer.files[0], eventVideo, previewVideo, 500, videoError);
};
const removeVideo = () => removeFile(eventVideo, previewVideo, videoError);
const triggerVideoBrowse = () => videoInput.value?.click();

// Submit
const handleSubmit = async () => {
    if (logoError.value || imageError.value || videoError.value) return;

    try {
        const formData = new FormData();
        // formData.append('event_id', store.formData.eventType.id);
        formData.append('event_id', store.formData.basicInfo?.id);
        formData.append('facebook_link', facebookLink.value);
        formData.append('instagram_link', instagramLink.value);
        formData.append('twitter_link', twitterLink.value);
        formData.append('linkedin_link', linkedinLink.value);
        if (eventLogo.value) formData.append('event_logo', eventLogo.value);
        if (eventImage.value) formData.append('event_image', eventImage.value);
        if (eventVideo.value) formData.append('event_video', eventVideo.value);

        const res = await api.post('/events/media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res.data.status) {
            console.log('Media saved', res.data.data);
            store.formData.mediaMarketing = res.data.data;
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
    store.prevStep();
}
</script>

<style scoped>
.form-wrapper {
    width: 100%;
    max-width: 700px;
}

.upload-box {
    border: 2px dashed #cfd8dc;
    border-radius: 8px;
    padding: 25px;
    margin: 20px 0;
    text-align: center;
    cursor: pointer;
    background: #fafafa;
    transition: all 0.2s ease;
}

.upload-box.active {
    border-color: #2a85ff;
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
    color: #2a85ff;
    font-weight: 500;
}

.preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.preview img,
.preview video {
    max-width: 120px;
    border-radius: 8px;
}

.error-text {
    color: red;
    font-size: 13px;
    text-align: center;
    margin-top: 4px;
}

@media (max-width: 600px) {
    .form-wrapper {
        max-width: 100% !important;
    }
}
</style>
