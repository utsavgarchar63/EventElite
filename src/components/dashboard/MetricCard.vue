<template>
  <v-card class="metric-card" elevation="0" rounded="lg">
    <div class="d-flex align-center mb-4">
      <!-- Icon inside circle with custom SVG -->
      <v-avatar :size="40" :color="avatarColor" class="mr-3">
        <img :src="icon" alt="icon" width="22" height="22" />
      </v-avatar>

      <!-- Title -->
      <span class="text-subtitle-1 font-weight-medium">{{ title }}</span>
    </div>

    <!-- Value -->
    <div class="text-h4 extra-bold">{{ formatValue(value) }}</div>

    <!-- Growth Section (conditionally rendered) -->
    <div v-if="growth !== undefined && growth !== null" class="d-flex align-center mt-4">
      <v-chip :color="growth >= 0 ? '#ECF9F1' : '#FDECEC'" size="small" class="px-2 py-1" variant="flat">
        <v-icon size="14" :style="{ color: growth >= 0 ? '#009A3C' : '#D32F2F' }" class="mr-1">
          {{ growth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
        </v-icon>
        <span class="text-caption font-weight-medium" :style="{ color: growth >= 0 ? '#009A3C' : '#D32F2F' }">
          {{ Math.abs(growth) }}%
        </span>
      </v-chip>
      <span class="ml-2 text-caption text-medium-emphasis">
        Than last month
      </span>
    </div>
  </v-card>
</template>

<script setup lang="ts">

interface Props {
  title: string;
  value: string | number;
  growth?: number; // ✅ Make it optional
  icon: string; // SVG file path
  avatarColor?: string; // Avatar background color
  redirect?: string;
}

const props = defineProps<Props>();

function formatValue(val: string | number) {
  const isCurrency = typeof val === 'string' && val.includes('$');
  const num = Number(val.toString().replace(/[^0-9.-]+/g, ""));
  if (isNaN(num)) return val;
  const formatted = num.toFixed(2);
  return isCurrency ? `$${formatted}` : formatted;
}
</script>

<style scoped>
.metric-card {
  background-color: #fff;
  padding: 25px;
  border: 1px solid #eaeaea;
  transition: box-shadow 0.3s ease;
}


.metric-card img {
  display: block;
  margin: auto;
}

.extra-bold {
  font-weight: 900;
  /* Extra bold */
}
</style>
