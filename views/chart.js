// chart.js
import Chart from 'chart.js';

let chartData = {}; // Define a global variable to hold chart data

function generateBarChart() {
  const ctx = document.getElementById('myChart').getContext('2d');

  // Chart generation code here...
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: options
  });
  console.log("called me");
}

export function setChartData(data) {
  chartData = {
    labels: data.labels,
    datasets: [{
      label: data.label,
      data: data.values,
      backgroundColor: data.backgroundColor || 'rgba(75, 192, 192, 0.6)',
      borderColor: data.borderColor || 'rgba(75, 192, 192, 1)',
      borderWidth: data.borderWidth || 1
    }]
  };
}
