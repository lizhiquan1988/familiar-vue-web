<template>
  <div class="container">
    <!-- 粒子背景 -->
    <Particles
      id="tsparticles"
      :options="particlesOptions"
      class="particles-background"
    />

    <h2>温度湿度計</h2>

    <div class="realtime">
      <div class="data-card">
        <p class="label">温度</p>
        <p class="value" :class="{ blink: blink }">{{ current.temperature }} ℃</p>
      </div>
      <div class="data-card">
        <p class="label">湿度</p>
        <p class="value" :class="{ blink: blink }">{{ current.humidity }} %</p>
      </div>
      <div class="data-card">
        <p class="label">体感温度</p>
        <p class="value" :class="{ blink: blink }">{{ current.feelsLike }} ℃</p>
      </div>
    </div>
    <p class="timestamp">※更新時間: {{ current.timestamp }}</p>
    <div class="chart">
      <canvas id="tempHumidityChart"></canvas>
    </div>
  </div>
</template>

<script>
import FamiliarService from "../services/FamiliarService";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  data() {
    return {
      current: { temperature: null, humidity: null, feelsLike: null, timestamp: null },
      chart: null,
      blink: false,
      // 粒子配置
      particlesOptions: {
        background: { color: { value: "#f0f4f8" } }, // 背景浅色
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
          },
          modes: { repulse: { distance: 100 }, push: { quantity: 4 } },
        },
        particles: {
          color: { value: "#00aaff" }, // 粒子蓝色
          links: { enable: true, color: "#00aaff", distance: 150, opacity: 0.2, width: 1 },
          collisions: { enable: false },
          move: { enable: true, speed: 1, direction: "none", outModes: "bounce" },
          number: { value: 50 },
          opacity: { value: 0.4 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      },
    };
  },
  methods: {
     async fetchCurrentData() {
      try {
        const res = await FamiliarService.getLatestTemp();
        const data = res.data;
        if (!data || data.length === 0) return;

        this.current.temperature = data.temperature;
        this.current.humidity = data.humidity;
        this.current.timestamp = this.formattedTime(data.timestamp);
        this.current.feelsLike = this.calcHeatIndex(data.temperature, data.humidity);

        this.blink = true;
        setTimeout(() => (this.blink = false), 300);
      } catch (e) {
        console.error("获取数据失败", e);
      }
    },
    async fetchData() {
      try {
        const today = this.getLocalDate();
        console.log("today is :"+today);
        const res = await FamiliarService.getDayTemp(today);
        const data = res.data;
        if (!data || data.length === 0) return;

        const labels = data.map(d => {
          const date = new Date(d.timestamp);
          const h = String(date.getHours()).padStart(2, '0');
          const m = String(date.getMinutes()).padStart(2, '0');
          return `${h}:${m}`;
        });
        console.log(labels[0]);
        const tempValues = data.map(d => d.temperature);
        const humValues = data.map(d => d.humidity);
        this.updateChart(labels, tempValues, humValues);
      } catch (e) {
        console.error("获取数据失败", e);
      }
    },
    formattedTime(rawTime) {
      // ミリ秒以下の精度だけを使う（Date はナノ秒まで対応してない）
      const trimmed = rawTime.split('.')[0]; // "2025-10-03T11:38:59"
      const date = new Date(trimmed);
      // YYYY/MM/DD HH:mm:ss
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${y}/${m}/${d} ${h}:${min}:${s}`;
    },
    getLocalDate() {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    calcHeatIndex(t, h) {
      return (
        -8.784695 + 1.61139411*t + 2.338549*h - 0.14611605*t*h -
        0.012308094*t*t - 0.016424828*h*h + 0.002211732*t*t*h +
        0.00072546*t*h*h - 0.000003582*t*t*h*h
      ).toFixed(1);
    },
    updateChart(labels, tempValues, humValues) {
      if (!this.chart) {
        const ctx = document.getElementById("tempHumidityChart").getContext("2d");
        const gradientTemp = ctx.createLinearGradient(0, 0, 0, 400);
        gradientTemp.addColorStop(0, "rgba(255,0,0,0.6)");
        gradientTemp.addColorStop(1, "rgba(255,0,0,0.1)");

        const gradientHum = ctx.createLinearGradient(0, 0, 0, 400);
        gradientHum.addColorStop(0, "rgba(0,200,255,0.6)");
        gradientHum.addColorStop(1, "rgba(0,200,255,0.1)");

        this.chart = new Chart(ctx, {
          type: "line",
          data: { labels, datasets: [
            { label: "温度 (℃)", data: tempValues, borderColor: "#FF4C4C", backgroundColor: gradientTemp, yAxisID: "y1", fill:true, tension:0.4, pointRadius:2, pointHoverRadius:6 },
            { label: "湿度 (%)", data: humValues, borderColor: "#00C8FF", backgroundColor: gradientHum, yAxisID: "y2", fill:true, tension:0.4, pointRadius:2, pointHoverRadius:6 },
          ]},
          options: { animation:{ duration:1000, easing:'easeOutQuart' }, responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{ labels:{ color:'#333', font:{ size:14, weight:'bold' } } }, tooltip:{ mode:'index', intersect:false }},
            scales:{ x:{ ticks:{ color:'#333' }, grid:{ color:'rgba(255,255,255,0.1)'} },
              y1:{ type:'linear', position:'left', title:{ display:true,text:'温度 (℃)', color:'#FF4C4C' }, ticks:{ color:'#FF4C4C' }, grid:{ color:'rgba(255,255,255,0.1)'} },
              y2:{ type:'linear', position:'right', title:{ display:true,text:'湿度 (%)', color:'#00C8FF' }, ticks:{ color:'#00C8FF' }, grid:{ drawOnChartArea:false } } } }
        });
      } else {
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = tempValues;
        this.chart.data.datasets[1].data = humValues;
        this.chart.update();
      }
    },
  },
  mounted() {
    this.fetchData();
    // setInterval(this.fetchData, 60*1000);
    this.fetchCurrentData();
    setInterval(this.fetchCurrentData, 10*1000);
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: "Orbitron", sans-serif;
  background-color: rgba(240, 244, 248, 0.8);
  color: #333;
  font-size: 1rem;
}

.container {
  position: relative;
  max-width: 90vw;
  margin: auto;
  text-align: center;
  padding: 2vw;
}

.particles-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

h2 {
  position: relative;
  z-index: 1;
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 0.15rem;
  color: #00aaff;
  margin-bottom: 1.5rem;
}

.realtime {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 2vw; /* 卡片間距用 vw */
  flex-wrap: wrap; /* 適應螢幕換行 */
  margin: 2rem 0;
}

.data-card {
  background: rgba(255, 255, 255, 0.8);
  border: 0.1rem solid rgba(0, 170, 255, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  width: calc((100vw - 4vw) / 3); /* 3 張卡片平均分寬度，gap 用 2vw */
  max-width: 250px; /* 桌面限制最大寬度 */
  box-shadow: 0 0 1rem rgba(0, 170, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
}

.data-card:hover {
  transform: translateY(-0.3rem);
  box-shadow: 0 0 1.5rem rgba(0, 170, 255, 0.3);
}

.label {
  font-size: 1.2rem;
  color: #00aaff;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-top: 0.3rem;
}

.timestamp {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #FF6B6B;
  position: relative;
  z-index: 1;
}

.chart {
  position: relative;
  z-index: 1;
  margin: 3rem 0;
  height: 40vh;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.2rem;
  padding: 1.2rem;
  box-shadow: 0 0 1.5rem rgba(0, 170, 255, 0.2);
}

.blink {
  animation: blink 0.8s ease-in-out;
}

@keyframes blink {
  0%,100%{opacity:1;}
  50%{opacity:0.3;}
}

/* ======== 響應式調整 ======== */
@media (max-width: 1024px) {
  .data-card {
    width: calc((100vw - 4vw) / 2); /* 平板兩欄 */
  }
}

@media (max-width: 600px) {
  .data-card {
    width: calc(100vw / 1.5 - 2vw); /* 手機保持多欄，自動縮小 */
  }
}

@media (max-width: 400px) {
  .data-card {
    width: calc(100vw - 2vw); /* 超小螢幕單欄 */
  }
}

</style>
