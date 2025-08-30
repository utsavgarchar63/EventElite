<script setup lang="ts">
import overview from '@/assets/images/common/Overview.webp';
</script>

<template>
    <v-sheet color="#F3F4F6" width="100%" class="rounded-tl-20 rounded-bl-20 my-10 sheet-padding">
        <h1 class="poppins-text">
            Simplify Event <br />
            Management & Sales <br />
            Tracking
        </h1>
        <div class="image-wrapper">
            <v-img :src="overview" alt="Overview" contain />
        </div>
    </v-sheet>
</template>

<style scoped>
/* Rounded corners */
.rounded-tl-20 {
    border-top-left-radius: 20px;
}

.rounded-bl-20 {
    border-bottom-left-radius: 20px;
}

/* Responsive padding for the sheet */
.sheet-padding {
    padding: 100px 0 0 100px;
}

/* Responsive font styles */
.poppins-text {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 35px;
    padding-left: 100px;
    line-height: 1.4;
    z-index: 9999;
}

/* 📱 Small devices */
@media (max-width: 600px) {
    .sheet-padding {
        padding: 40px 20px;
    }

    .poppins-text {
        font-size: 22px;
        line-height: 1.3;
    }
}

.image-wrapper {
    display: flex;
    justify-content: flex-end;
}

/* 📏 Medium devices (tablets) */
@media (min-width: 601px) and (max-width: 1024px) {
    .sheet-padding {
        padding: 60px 40px;
    }

    .poppins-text {
        font-size: 28px;
    }
}

/* 🖥 Large devices */
@media (min-width: 1025px) {
    .sheet-padding {
        padding: 100px 0 0 0;
    }

    .poppins-text {
        font-size: 35px;
    }
}
</style>
