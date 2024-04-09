const metricNames = [
  "cumulative_layout_shift",
  "interaction_to_next_paint",
  "largest_contentful_paint",
];

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

export function sortCWVHistoryData({
  data,
  metricName = "interaction_to_next_paint",
  sortDirection = "asc",
  cruxType = "origin",
  excludeNA = false,
}) {
  if (!data) return [];
  const lastCollectionPeriodData = data.map((item) => {
    const { metrics, collectionPeriods, key } = item.record;
    const totalCollectionPeriods = collectionPeriods.length - 1;

    const result = {};

    for (const name of metricNames) {
      const value =
        metrics[name].percentilesTimeseries.p75s[totalCollectionPeriods];
      result[name] = value == null ? "na" : Number(value);
    }

    return {
      URL: key[cruxType],
      lastCollectionPeriod: collectionPeriods[totalCollectionPeriods],
      ...result,
    };
  });

  if (metricName === "URL") {
    return lastCollectionPeriodData.sort((a, b) =>
      sortDirection === "asc"
        ? a[metricName].localeCompare(b[metricName])
        : b[metricName].localeCompare(a[metricName])
    );
  }

  const sortedData = lastCollectionPeriodData
    .filter((item) => item[metricName] !== "na") // Exclude items where the metric is 'na'
    .sort((a, b) => {
      return sortDirection === "asc"
        ? a[metricName] - b[metricName]
        : b[metricName] - a[metricName];
    });

  if (!excludeNA) {
    return sortedData.concat(
      lastCollectionPeriodData.filter((item) => item[metricName] === "na")
    );
  }
  return sortedData;
}

export function getAvailableUrls({ data, cruxType }) {
  return data.map((item) => {
    const { key } = item.record;

    return key[cruxType];
  });
}

export function getDateString(date) {
  const { year, month, day } = date;
  return `${month}/${day}/${year}`;
}
