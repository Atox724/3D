<template>
  <section class="chart-wrapper">
    <div class="chart-title">
      <span>渲染</span>
      <span>{{ fpsNumber }}fps</span>
    </div>
    <div ref="chart" class="chart-content"></div>
  </section>
</template>
<script lang="ts" setup>
import { type EChartsType, init } from "echarts";
const fpsNumber = ref(0);
const chart = ref<HTMLDivElement>();

const myChart = shallowRef<EChartsType>();

const chartData: number[] = [];

setInterval(() => {
  if (chartData.length >= 10) chartData.shift();
  chartData.push(Math.floor(Math.random() * 60) + 1);

  myChart.value?.setOption({
    series: [
      {
        data: chartData
      }
    ]
  });
}, 1000);

onMounted(() => {
  myChart.value = init(chart.value);
  myChart.value.setOption({
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    },
    xAxis: {
      show: false,
      type: "category",
      boundaryGap: false
    },
    yAxis: {
      show: false,
      type: "value",
      splitLine: {
        show: false
      },
      boundaryGap: false
    },
    series: [
      {
        data: chartData,
        type: "line",
        silent: true,
        showSymbol: false,
        animation: false,
        areaStyle: {}
      }
    ]
  });
});
</script>
<style lang="less" scoped>
.chart-wrapper {
  width: 90px;
  height: 70px;

  display: flex;
  flex-direction: column;

  .chart-title {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }

  .chart-content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
