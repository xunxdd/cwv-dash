import colorLib from "@kurkle/color";
import { colors } from "./colors.js";

export function getDataCollectionByUrls({ dates, pageUrls, allData }) {
  const jsonData = allData;

  const dataCollection = {};
  pageUrls.forEach((url) => {
    const cvwData = jsonData.filter((cvwData) => {
      return cvwData.URL === url;
    });
    dataCollection[url] = cvwData;
  });
  const cwvDataByUrl = {};
  console.log({ dates });
  Object.keys(dataCollection).forEach((url) => {
    const rows = dataCollection[url];
    const data = {};
    rows.forEach((row) => {
      let dateString = row.analysisUTCTimestamp;
      console.log({ dateString });
      if (dateString) {
        if (dates.includes(dateString)) {
          data[dateString] = row;
        }
      }
    });
    cwvDataByUrl[url] = data;
  });

  return cwvDataByUrl;
}

/**
 *
 * @param {*} metricName
 * @param {*} allData
 * @returns chart of a specific metric by name given by the data for specific urls
 */
export function chartData({ dates, metricName, cwvData = {} }) {
  const datasets = [];
  console.log({ dates });
  Object.keys(cwvData).forEach((url, index) => {
    const data = cwvData[url];
    const dataPoints = [];
    const color = colors[index];
    dates.forEach((date) => {
      const row = data[date];
      if (row) {
        const metric = row[metricName];
        if (typeof metric === "number") {
          dataPoints.push(metric);
        } else if (typeof metric === "string") {
          dataPoints.push(parseFloat(metric));
        }
      } else {
        dataPoints.push(undefined);
      }
    });

    datasets.push({
      label: `${url}`,
      data: dataPoints,
      lineTension: 0,
      fill: false,
      backgroundColor: colorLib(color).alpha(0.5).rgbString(),
      borderColor: color,
    });
  });

  return {
    labels: dates,
    datasets,
  };
}
