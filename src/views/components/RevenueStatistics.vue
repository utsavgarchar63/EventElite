<template>
     <v-card class="pa-4">
          <div class="d-flex justify-space-between align-center mb-4">
               <h3 class="text-h3 font-weight-bold">Revenue Statistics</h3>
          </div>
          <div style="height: 300px;">
               <Line :data="chartData" :options="chartOptions" />
          </div>
     </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const props = defineProps<{
     revenueData: { month: string; total: number }[];
}>();



// Sample data for demonstration - replace with actual data from API
const monthlyData = [
     { month: 'Jan', revenue: 31000 },
     { month: 'Feb', revenue: 20000 },
     { month: 'Mar', revenue: 30000 },
     { month: 'Apr', revenue: 25000 },
     { month: 'May', revenue: 12000 },
     { month: 'Jun', revenue: 25000 },
     { month: 'Jul', revenue: 35000 },
     { month: 'Aug', revenue: 41500 },
     { month: 'Sep', revenue: 28000 },
     { month: 'Oct', revenue: 31000 },
     { month: 'Nov', revenue: 17000 },
     { month: 'Dec', revenue: 40000 }
];

const chartData = computed(() => ({
     labels: props.revenueData.length > 0 ? props.revenueData.map(item => item.month) : monthlyData.map(item => item.month),
     datasets: [
          {
               label: 'Revenue',
               data: props.revenueData.length > 0 ? props.revenueData.map(item => item.total) : monthlyData.map(item => item.revenue),
               borderColor: '#2A85FF',
               backgroundColor: '#2A85FF00',
               fill: true,
               tension: 0.4
          }
     ]
}));
const chartOptions = computed(() => ({
     responsive: true,
     maintainAspectRatio: false,
     plugins: {
          legend: {
               display: true,
               position: 'top'
          },
          title: {
               display: true,
               text: 'Revenue Statistics'
          }
     },
     scales: {
          y: {
               beginAtZero: true,
               ticks: {
                    callback: (value: any) => `${value.toLocaleString()}k`
               }
          }
     }
})) as any;

// Watch for changes in revenueData prop and update chart
watch(
     () => props.revenueData,
     (newData) => {
          if (newData && newData.length > 0) {
               // Update chart data when prop changes
               // The chartData computed property will automatically update
          }
     },
     { immediate: true }
);
</script>
