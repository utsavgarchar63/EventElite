<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue';
import { useDisplay } from "vuetify";
import { useSidebarMenu } from './vertical-sidebar/sidebarItem';
import NavGroup from './vertical-sidebar/NavGroup/index.vue';
import NavItem from './vertical-sidebar/NavItem/index.vue';
import Logo from './logo/Logo.vue';
// Icon Imports
import { Menu2Icon } from 'vue-tabler-icons';
// dropdown imports
import NotificationDD from './vertical-header/NotificationDD.vue';
import ProfileDD from './vertical-header/ProfileDD.vue';
import NavCollapse from './vertical-sidebar/NavCollapse/NavCollapse.vue';
const sidebarMenu = useSidebarMenu();
const { mdAndDown } = useDisplay();
const sDrawer = ref(true);
onMounted(() => {
    sDrawer.value = !mdAndDown.value; // hide on mobile, show on desktop
});
watch(mdAndDown, (val) => {
    sDrawer.value = !val;
});
</script>

<template>
    <!------Sidebar-------->
    <v-navigation-drawer left elevation="0" app :width="270" v-model="sDrawer">
        <!---Logo part -->
        <div class="pa-5">
            <Logo />
        </div>
        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <div>
            <perfect-scrollbar class="scrollnavbar">
                <v-list class="px-6 py-0">
                    <!---Menu Loop -->
                    <template v-for="(item, i) in sidebarMenu">
                        <!---Item Sub Header -->
                        <NavGroup :item="item" v-if="item.header" :key="item.title" />

                        <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
                        <!---Single Item-->
                        <NavItem :item="item" v-else class="leftPadding" />
                        <!---End Single Item-->
                    </template>
                </v-list>
            </perfect-scrollbar>
        </div>

    </v-navigation-drawer>
    <!------Header-------->
    <v-app-bar elevation="0" height="70" class="top-header">
        <div class="d-flex align-center justify-space-between w-100">
            <!-- Left side: Menu Button -->
            <div class="d-flex align-center">
                <v-btn class="hidden-lg-and-up ms-md-3 ms-sm-5 ms-3 text-muted" @click="sDrawer = !sDrawer" icon
                    variant="flat" size="small">
                    <Menu2Icon size="20" stroke-width="1.5" />
                </v-btn>

                <!-- ✅ Search Bar -->
                <v-text-field placeholder="Search here..." variant="outlined" hide-details density="compact"
                    class="search-input ms-4" append-inner-icon="mdi-magnify" />
            </div>

            <!-- Right side: Notifications & Profile -->
            <div>
                <NotificationDD />
                <ProfileDD />
            </div>
        </div>
    </v-app-bar>

</template>

<style>
.search-input {
    background-color: #F4F4F4;
    border-radius: 8px;
    min-width: 350px;
}
</style>