<template>
    <div class="file-upload" @click="triggerFileInput">
        <!-- Show placeholder if no file -->
        <div v-if="!preview" class="upload-placeholder">
            <v-icon color="primary" size="28">mdi-image</v-icon>
            <span class="upload-text">{{ label }}</span>
        </div>

        <!-- Show preview if image file -->
        <div v-else class="preview-wrapper">
            <img :src="preview" alt="Preview" class="preview-img" />
        </div>

        <!-- Hidden file input -->
        <input ref="fileInput" type="file" :accept="accept" style="display: none" @change="onFileChange" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: [File, String], // file or base64 string
    accept: { type: String, default: 'image/*' }, // allowed types
    label: { type: String, default: 'Choose file' } // placeholder text
});
const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const preview = ref(null);

// open file input
const triggerFileInput = () => {
    fileInput.value.click();
};

// handle file change
const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        emit('update:modelValue', file);
        // create preview if image
        if (file.type.startsWith('image/')) {
            preview.value = URL.createObjectURL(file);
        } else {
            preview.value = null;
        }
    }
};

// watch external modelValue changes
watch(
    () => props.modelValue,
    (newVal) => {
        if (!newVal) {
            preview.value = null;
        } else if (typeof newVal === 'string') {
            // handle existing URL case
            preview.value = newVal;
        }
    },
    { immediate: true }
);
</script>

<style scoped>
.file-upload {
    border: 2px dashed #3b82f6; /* blue-500 */
    background-color: #f9fbff;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
}
.file-upload:hover {
    background-color: #f0f6ff;
}
.upload-placeholder {
    display: flex;
    align-items: center;
    gap: 8px;
}
.upload-text {
    color: #3b82f6;
    font-weight: 500;
    font-size: 16px;
}
.preview-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}
.preview-img {
    max-width: 100%;
    max-height: 80px;
    object-fit: contain;
}
</style>
