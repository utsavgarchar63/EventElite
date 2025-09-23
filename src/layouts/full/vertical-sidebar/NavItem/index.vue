<script setup>
import Icon from '../Icon.vue';
import { useRoute } from 'vue-router';

const props = defineProps({ item: Object, level: Number });
const route = useRoute();

function isActive(to) {
    if (!to) return false;
    const paths = Array.isArray(to) ? to : [to];
    return paths.some((p) => route.path.startsWith(p));
}


function getDynamicPath(to) {
    if (!to) return;
    const path = Array.isArray(to) ? to[0] : to;

    if (path === '/admin/dashboard' && route.path.startsWith('/admin/dashboard')) {
        return route.path; // Keep current dynamic route
    }
    if (path === '/super-admin/dashboard' && route.path.startsWith('/super-admin/dashboard')) {
        return route.path;
    }
    return path;
}

</script>


<template>
    <!---Single Item-->
    <v-list-item :href="item.external ? (Array.isArray(item.to) ? item.to[0] : item.to) : undefined"
        :to="!item.external ? getDynamicPath(item.to) : undefined" rounded class="mb-1" color="primary"
        :disabled="item.disabled" :target="item.external ? '_blank' : undefined"
        :class="{ 'v-list-item--active': isActive(item.to) }">
        <!-- Icon -->
        <template v-slot:prepend>
            <Icon :item="item.icon" :level="level" />
        </template>

        <!-- Title -->
        <v-list-item-title>
            {{ item.title }}
            <span v-if="item.children">
                <span v-if="item.chip" class="ps-3">
                    <v-chip :color="item.chipColor" :class="'sidebarchip hide-menu bg-' + item.chipBgColor"
                        :size="item.chipIcon ? 'x-small' : 'x-small'" :variant="item.chipVariant"
                        :prepend-icon="item.chipIcon">
                        {{ item.chip }}
                    </v-chip>
                </span>
            </span>
        </v-list-item-title>

        <!-- Subtitle -->
        <v-list-item-subtitle v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
            {{ item.subCaption }}
        </v-list-item-subtitle>

        <!-- Right chip -->
        <template v-slot:append v-if="item.chip">
            <v-chip :color="item.chipColor" :class="'sidebarchip hide-menu bg-' + item.chipBgColor"
                :size="item.chipIcon ? 'x-small' : 'x-small'" :variant="item.chipVariant" :prepend-icon="item.chipIcon">
                {{ item.chip }}
            </v-chip>
        </template>
    </v-list-item>

</template>
    