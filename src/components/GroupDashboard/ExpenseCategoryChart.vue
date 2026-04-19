<script setup>
import { computed } from "vue";
import Chart from "primevue/chart";

const props = defineProps({
  categoriesData: {
    type: Array,
    default: () => [],
  },
})


const chartData = computed(() => {
  return {
    labels: props.categoriesData.map(data => data.category?.name || 'Unknown'),
    datasets: [
      {
        label: 'Expenses by Category',
        data: props.categoriesData.map(item =>  Number(item.total))

      },
    ]
  }});



  const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');

    return {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: textColorSecondary
          },
          pointLabels: {
            color: textColor
          },
          angleLines:{
            color: textColorSecondary
          }
        }
      }
    };
  }
const chartOptions = setChartOptions();

</script>
  <template>
    <div class="card flex bg-white rounded-2xl shadow-lg justify-center">
      <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full md:w-120" />
    </div>
  </template>

<style scoped>

</style>