<template>
     <v-card class="pa-4">
          <div class="d-flex justify-space-between align-center mb-4">
               <h3 class="text-h3 font-weight-bold">Sales Statistics</h3>
          </div>
          <div class="d-flex align-center justify-center position-relative" style="height: 300px;">
               <Doughnut :data="chartData" :options="chartOptions" />
               <div class="position-absolute d-flex flex-column align-center justify-center"
                    style="top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;">
                    <div class="text-caption text-muted mb-1">Total Tickets</div>
                    <div class="text-h6 font-weight-bold">{{ (salesData.total / 100).toLocaleString() }}k</div>
                    <div class="text-caption text-muted">(100%)</div>
               </div>
          </div>
     </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, type ChartOptions } from "chart.js";
import { Doughnut } from "vue-chartjs";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps<{
     salesData?: {
          sold: number;
          left: number;
          total: number;
     };
}>();



const salesData = computed(() => props.salesData ?? { sold: 0, left: 0, total: 1 });

const chartData = computed(() => ({
     labels: ['Sold Tickets', 'Left Tickets'],
     datasets: [
          {
               data: [salesData.value?.sold ?? 0, salesData.value?.left ?? 0],
               backgroundColor: ['#B5E5CA', '#FFBC9A'],
               borderWidth: 0,
               cutout: '65%'
          }
     ]
}));


const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
     responsive: true,
     maintainAspectRatio: false,
     plugins: {
          legend: {
               position: 'bottom',
               labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                         size: 14
                    }
               }
          },
          title: {
               display: true,
               text: 'Sales Statistics'
          },
          tooltip: {
               callbacks: {
                    label: function (context: { label: string; parsed: any; }) {
                         const label = context.label || '';
                         const value = context.parsed;
                         const total = salesData.value?.total ?? 1;
                         const percentage = ((value / total) * 100).toFixed(0);
                         return `${label}: ${(value / 100).toLocaleString()}k (${percentage}%)`;
                    }
               }
          }
     }
}));
</script>
