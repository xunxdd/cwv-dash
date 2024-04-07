export function sortCWVData(data, metricName = "INP") {
  // Get the last day's data
  const lastDay = data[data.length - 1].analysisUTCTimestamp;

  // Filter the data for the last day
  const lastDayData = data.filter(
    (item) => item.analysisUTCTimestamp === lastDay
  );
  // Sort the data by the INP value
  lastDayData.sort((a, b) => {
    const aINP = Number(a[metricName].replace(" ms", "").replace(" s", ""));
    const bINP = Number(b[metricName].replace(" ms", "").replace(" s", ""));
    return aINP - bINP;
  });

  return lastDayData;
}
