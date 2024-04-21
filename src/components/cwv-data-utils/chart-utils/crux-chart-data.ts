import colorLib from "@kurkle/color";
import { colors } from "./colors.js";
import { getDateString } from "../stats.js";
import { cruxMetricNames } from "@components/cwv-data-utils/constants.js";

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

export function getMetricDistriutionData({ metricName, cwvData }) {
  const data = cwvData.record.metrics[metricName].histogramTimeseries;
  const labels = ["Good", "Needs Improvement", "Poor"];
  const colors = ["#28a745", "#ffc107", "#e60049"];
  const dates = cwvData.record.collectionPeriods.map(({ lastDate }) =>
    getDateString(lastDate)
  );

  if (!dates || !data) return null;
  const datasets = data.map(({ densities }, i) => {
    const color = colors[i];

    return {
      label: labels[i],
      data: densities.map((x) => x * 100),
      backgroundColor: colorLib(color).rgbString(),
      borderColor: "black",
      borderWidth: 2,
    };
  });

  return {
    labels: dates,
    datasets,
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

function compareUrls(url1: string, url2: string): boolean {
  const processedUrl1 = url1
    .replace(/https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
  const processedUrl2 = url2
    .replace(/https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
  return processedUrl1 === processedUrl2;
}

export function getCruxTrendData({
  pageUrls,
  data,
  dateType,
  cruxType = "url",
}) {
  const cruxData: any = [];

  for (let i = 0; i < data.length; i++) {
    const { key, collectionPeriods, metrics } = data[i];

    const url = key[cruxType].replace(/https?:\/\//, "");

    if (pageUrls.some((pageUrl) => compareUrls(pageUrl, url))) {
      const result = {};
      for (const name of cruxMetricNames) {
        const values = metrics[name].percentilesTimeseries.p75s;
        result[name] = dateType ? values.slice(-dateType) : values;
      }
      cruxData.push({
        URL: url,
        collectionPeriods: dateType
          ? collectionPeriods.slice(-dateType)
          : collectionPeriods,
        ...result,
      });
    }
  }
  return cruxData;
}

export { getChartDataSet, getOptions };
