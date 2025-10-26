<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useDisplay } from "vuetify";
import { useRoute } from 'vue-router'; // ✅ import route
import { useSidebarMenu } from './vertical-sidebar/sidebarItem';
import NavGroup from './vertical-sidebar/NavGroup/index.vue';
import NavItem from './vertical-sidebar/NavItem/index.vue';
import Logo from './logo/Logo.vue';
import NavCollapse from './vertical-sidebar/NavCollapse/NavCollapse.vue';
import NotificationDD from './vertical-header/NotificationDD.vue';
import ProfileDD from './vertical-header/ProfileDD.vue';
import SettingDD from './vertical-header/SettingDD.vue';
import { Menu2Icon } from 'vue-tabler-icons';
import { useSidebarVisibility } from '@/composables/useSidebarVisibility';

const { menus } = useSidebarMenu();
const { mdAndDown } = useDisplay();
const route = useRoute(); // get current route
const sDrawer = ref(true);

const { showSidebar } = useSidebarVisibility();
const userRole = ref(localStorage.getItem('role'));


console.log('showSidebar', showSidebar)
onMounted(() => {
    sDrawer.value = !mdAndDown.value;
});

watch(mdAndDown, (val) => {
    sDrawer.value = !val;
});

</script>


<template>
    <!------Sidebar-------->
    <v-navigation-drawer :key="route.path" v-if="showSidebar" left elevation="0" app :width="270" v-model="sDrawer">
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
                    <template v-for="(item, i) in menus">
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
    <v-app-bar elevation="0" height="70" class="top-header px-4">
        <div class="d-flex align-center justify-space-between w-100 flex-wrap">

            <!-- Left side: Menu Button & Logo (Small screens) -->
            <div class="d-flex align-center">
                <!-- Menu Button (only on small screens) -->
                <v-btn class="hidden-lg-and-up me-2 text-muted" @click="sDrawer = !sDrawer" icon variant="flat"
                    size="small">
                    <Menu2Icon size="20" stroke-width="1.5" />
                </v-btn>

                <!-- ✅ Logo (optional for small screens) -->
                <div class="hidden-md-and-up me-2">
                    <Logo />
                </div>

                <!-- ✅ Search Bar (hidden on xs, smaller version on md) -->
                <v-text-field placeholder="Search..." variant="outlined" hide-details density="compact"
                    class="search-input hidden-sm-and-down ms-4" append-inner-icon="mdi-magnify" />
            </div>

            <!-- Right side: Settings, Notifications & Profile -->
            <!-- Only show Profile dropdown if role is 'user' -->
            <div class="d-flex align-center" v-if="!!userRole">
                <SettingDD class="hidden-sm-and-down" />
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
    min-width: 300px;
}

@media (max-width: 960px) {
    .search-input {
        min-width: 180px;
        /* Smaller search bar for tablets */
    }
}

@media (max-width: 600px) {
    .search-input {
        display: none;
        /* Hide search bar on mobile */
    }
}
</style>