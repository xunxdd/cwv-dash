import { columns } from "./constants";

export function sortCWVData(data, metricName = "INP", sortDirection = "asc") {
  // Get the last day's data
  const lastDay = data[data.length - 1].analysisUTCTimestamp;

  // Filter the data for the last day
  const lastDayData = data.filter(
    (item) => item.analysisUTCTimestamp === lastDay
  );
  // Sort the data by the INP value
  lastDayData.sort((a, b) => {
    if (metricName === "URL")
      return sortDirection === "asc"
        ? a[metricName].localeCompare(b[metricName])
        : b[metricName].localeCompare(a[metricName]);
    const aINP = Number(a[metricName].replace(" ms", "").replace(" s", ""));
    const bINP = Number(b[metricName].replace(" ms", "").replace(" s", ""));
    return sortDirection === "asc" ? aINP - bINP : bINP - aINP;
  });

  return lastDayData;
}

export function filterCWVHistoryData({
  data,
  metricName = "interaction_to_next_paint",
  filter = "all",
}) {
  if (!data || !Array.isArray(data)) return [];
  const cwvData = [];
  const threshold = columns.find(
    (column) => column.key === metricName
  ).threshold;

  data.forEach((itmData) => {
    const value = itmData[metricName];
    if (filter === "good" && value <= threshold.good) {
      cwvData.push(itmData);
    } else if (filter === "poor" && value > threshold.poor) {
      cwvData.push(itmData);
    } else if (
      filter === "needsImprovement" &&
      value > threshold.good &&
      value <= threshold.poor
    ) {
      cwvData.push(itmData);
    } else if (filter === "all") {
      cwvData.push(itmData);
    }
  });

  return cwvData;
}

export function sortCWVHistoryData({
  data,
  metricName = "interaction_to_next_paint",
  sortDirection = "asc",
  excludeNA = false,
}) {
  if (!data) return [];

  if (metricName === "URL") {
    return data.sort((a, b) =>
      sortDirection === "asc"
        ? a[metricName].localeCompare(b[metricName])
        : b[metricName].localeCompare(a[metricName])
    );
  }

  const sortedData = data
    .filter((item) => item[metricName] !== "na") // Exclude items where the metric is 'na'
    .sort((a, b) => {
      return sortDirection === "asc"
        ? a[metricName] - b[metricName]
        : b[metricName] - a[metricName];
    });

  if (!excludeNA) {
    return sortedData.concat(data.filter((item) => item[metricName] === "na"));
  }
  return sortedData;
}

export function getAvailableUrls({ data, cruxType }) {
  return data.map((item) => {
    return item.URL;
  });
}

export function getDateString(date) {
  const { year, month, day } = date;
  return `${month}/${day}/${year}`;
}
