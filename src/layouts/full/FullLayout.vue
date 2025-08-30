<script setup lang="ts">
import { RouterView } from 'vue-router';
import MainView from './Main.vue';

</script>

<template>

    <v-locale-provider>
        <v-app>
            <MainView />
            <v-main style="background-color: #F4F4F4;">
                <v-container fluid class="page-wrapper" >
                    <div class="maxWidth">
                        <RouterView />
                    </div>
                </v-container>
            </v-main>
        </v-app>
    </v-locale-provider>
</template>
