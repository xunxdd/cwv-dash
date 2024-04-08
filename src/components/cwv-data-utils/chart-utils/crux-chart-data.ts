import colorLib from "@kurkle/color";
import { colors } from "./colors.js";
import { getDateString } from "../stats.js";

function getOptions(title: string): any {
  return {
    responsive: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        align: "start" as const,
        padding: 2,
        labels: {
          textAlign: "left" as const,
          font: {
            size: 10,
            lineHeight: 1,
          },
        },
      },

      title: {
        display: true,
        text: title,
        font: { weight: "bolder", size: 14 },
      },
    },
  };
}

function getChartDataSet({ metricName, cwvData }) {
  const datasets: any = [];
  const dates = cwvData[0].collectionPeriods.map(({ lastDate }) =>
    getDateString(lastDate)
  );
  for (let i = 0; i < cwvData.length; i++) {
    const dataPoints = cwvData[i][metricName];

    const color = colors[i];

    datasets.push({
      label: cwvData[i].URL,
      data: dataPoints,
      lineTension: 0,
      fill: false,
      backgroundColor: colorLib(color).alpha(0.5).rgbString(),
      borderColor: color,
    });
  }

  return {
    labels: dates,
    datasets,
  };
}

export { getChartDataSet, getOptions };
