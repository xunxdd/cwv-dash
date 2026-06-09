const MINIMUM_COLLECTION_YEAR = 2025;

export function getSiteName(origin) {
  try {
    const host = new URL(origin).hostname.replace(/^www\./, "");
    const labels = host.split(".");
    const suffix = labels.slice(1).join(".");

    if (suffix === "com" || suffix === "co.uk") {
      return labels[0];
    }

    return host;
  } catch {
    return origin;
  }
}

export function formatList(items) {
  if (!items.length) return "none";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function getNumericValue(value) {
  if (value == null || value === "na") return null;
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function getValueDelta(startValue, currentValue) {
  const start = getNumericValue(startValue);
  const current = getNumericValue(currentValue);
  if (start == null || current == null) return null;
  return Number((current - start).toFixed(3));
}

function getStatus(value, threshold) {
  const numericValue = Number(value);
  if (value == null || Number.isNaN(numericValue)) return "na";
  if (numericValue <= threshold.good) return "good";
  if (numericValue <= threshold.poor) return "needsImprovement";
  return "poor";
}

export function getStatusColorClass(status) {
  if (status === "good") return "text-green-700";
  if (status === "needsImprovement") return "text-orange-700";
  if (status === "poor") return "text-red-700";
  return "text-gray-500";
}

export function getValueStatus(value, threshold) {
  return getStatus(value, threshold);
}

function getDirection(delta) {
  if (delta == null) return "na";
  if (delta < 0) return "improved";
  if (delta > 0) return "worse";
  return "flat";
}

function getFilteredValues({ values, periods }) {
  return periods.reduce((result, period, index) => {
    if (Number(period.lastDate?.year) >= MINIMUM_COLLECTION_YEAR) {
      result.push(values[index]);
    }
    return result;
  }, []);
}

function getCounts(rows, key) {
  return rows.reduce(
    (counts, row) => {
      counts[row[key]] += 1;
      return counts;
    },
    { good: 0, needsImprovement: 0, poor: 0, na: 0 }
  );
}

function getDirectionCounts(rows) {
  return rows.reduce(
    (counts, row) => {
      counts[row.direction] += 1;
      return counts;
    },
    { improved: 0, worse: 0, flat: 0, na: 0 }
  );
}

function getDirectionSites(rows) {
  return rows.reduce(
    (sites, row) => {
      sites[row.direction].push(row.siteName);
      return sites;
    },
    { improved: [], worse: [], flat: [], na: [] }
  );
}

function getMedianDelta(rows) {
  const sortedDeltas = rows
    .map((row) => row.delta)
    .filter((delta) => delta != null)
    .sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedDeltas.length / 2);

  if (!sortedDeltas.length) return null;
  if (sortedDeltas.length % 2) return sortedDeltas[middleIndex];
  return Number(
    ((sortedDeltas[middleIndex - 1] + sortedDeltas[middleIndex]) / 2).toFixed(3)
  );
}

export function getLatestPeriodRows({ data, metricName, threshold }) {
  return (data ?? [])
    .map((item) => {
      const values = item.metrics?.[metricName]?.percentilesTimeseries?.p75s;
      const periods = item.collectionPeriods;
      if (!Array.isArray(values) || !Array.isArray(periods)) return null;

      const filteredValues = getFilteredValues({ values, periods });
      if (filteredValues.length < 2) return null;

      const currentValue = filteredValues.at(-1);
      const previousValue = filteredValues.at(-2);
      const delta = getValueDelta(previousValue, currentValue);

      return {
        URL: item.URL,
        siteName: getSiteName(item.URL),
        currentValue,
        previousValue,
        delta,
        direction: getDirection(delta),
        currentStatus: getStatus(currentValue, threshold),
        previousStatus: getStatus(previousValue, threshold),
      };
    })
    .filter(Boolean);
}

export function getLatestPeriodSummary({
  data,
  metricName,
  threshold,
  topImprovedLimit = 4,
}) {
  const rows = getLatestPeriodRows({ data, metricName, threshold });
  const directionSites = getDirectionSites(rows);

  Object.values(directionSites).forEach((sites) => {
    sites.sort((a, b) => a.localeCompare(b));
  });

  const topImprovedSites = rows
    .filter((row) => row.direction === "improved")
    .sort((a, b) => a.delta - b.delta || a.siteName.localeCompare(b.siteName))
    .slice(0, topImprovedLimit)
    .map((row) => ({
      siteName: row.siteName,
      improvement: Number(Math.abs(row.delta).toFixed(2)),
    }));

  return {
    total: rows.length,
    directions: getDirectionCounts(rows),
    directionSites,
    statuses: getCounts(rows, "currentStatus"),
    previousStatuses: getCounts(rows, "previousStatus"),
    medianDelta: getMedianDelta(rows),
    poorSites: rows
      .filter((row) => row.currentStatus === "poor")
      .map((row) => row.siteName)
      .sort((a, b) => a.localeCompare(b)),
    topImprovedSites,
  };
}
