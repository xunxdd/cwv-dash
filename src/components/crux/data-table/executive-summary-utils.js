import { metrics } from "@components/cwv-data-utils/constants";

const CLS_METRIC = metrics.CLS.cruxKey;
const CLS_THRESHOLDS = { good: 0.1, poor: 0.25 };
const TOP_IMPROVED_LIMIT = 4;
const MINIMUM_COLLECTION_YEAR = 2025;

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getCLSStatus(value) {
  if (value === null) return "na";
  if (value <= CLS_THRESHOLDS.good) return "good";
  if (value <= CLS_THRESHOLDS.poor) return "needsImprovement";
  return "poor";
}

function getSiteName(origin) {
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

function getPeriod(data) {
  const itemWithPeriods = data.find((item) => item.collectionPeriods?.length);
  const periods = itemWithPeriods?.collectionPeriods ?? [];

  return periods[periods.length - 1] ?? data[0]?.lastCollectionPeriod ?? null;
}

function getCounts(items, statusKey) {
  return items.reduce(
    (counts, item) => {
      counts[item[statusKey]] += 1;
      return counts;
    },
    { good: 0, needsImprovement: 0, poor: 0, na: 0 }
  );
}

function getValueDelta(startValue, currentValue) {
  const start = toNumber(startValue);
  const current = toNumber(currentValue);
  if (start === null || current === null) return null;
  return Number((current - start).toFixed(3));
}

function getFilteredCLSValues(item) {
  const values = item.metrics?.[CLS_METRIC]?.percentilesTimeseries?.p75s ?? [];
  const periods = item.collectionPeriods ?? [];

  return periods.reduce((result, period, index) => {
    if (Number(period.lastDate?.year) >= MINIMUM_COLLECTION_YEAR) {
      result.push(values[index]);
    }
    return result;
  }, []);
}

function getDirection(delta) {
  if (delta === null) return "na";
  if (delta < 0) return "improved";
  if (delta > 0) return "worse";
  return "flat";
}

function getDeviceSummary(data) {
  const items = data.map((item) => {
    const p75s = getFilteredCLSValues(item);
    const latestIndex = p75s.length - 1;
    const current = toNumber(p75s[latestIndex] ?? item[CLS_METRIC]);
    const previous = toNumber(p75s[latestIndex - 1]);
    const delta = getValueDelta(previous, current);

    return {
      origin: item.URL,
      siteName: getSiteName(item.URL),
      current,
      previous,
      delta,
      direction: getDirection(delta),
      currentStatus: getCLSStatus(current),
      previousStatus: getCLSStatus(previous),
    };
  });

  const improvedSites = items
    .filter((item) => item.direction === "improved")
    .sort((a, b) => a.delta - b.delta || a.siteName.localeCompare(b.siteName));
  const worseSites = items.filter((item) => item.direction === "worse");
  const flatSites = items.filter((item) => item.direction === "flat");
  const unavailableSites = items.filter((item) => item.direction === "na");

  return {
    totalSites: items.length,
    improvedCount: improvedSites.length,
    worseCount: worseSites.length,
    flatCount: flatSites.length,
    unavailableCount: unavailableSites.length,
    currentCounts: getCounts(items, "currentStatus"),
    previousCounts: getCounts(items, "previousStatus"),
    poorSites: items
      .filter((item) => item.currentStatus === "poor")
      .map((item) => item.siteName)
      .sort((a, b) => a.localeCompare(b)),
    topImprovedSites: improvedSites
      .slice(0, TOP_IMPROVED_LIMIT)
      .map((item) => ({
        siteName: item.siteName,
        improvement: Number(Math.abs(item.delta).toFixed(2)),
      })),
  };
}

export function getExecutiveSummary(dataByFormFactor) {
  const mobileData = dataByFormFactor?.PHONE?.siteData ?? [];
  const desktopData = dataByFormFactor?.DESKTOP?.siteData ?? [];
  const trackedOrigins = new Set(
    [...mobileData, ...desktopData].map((item) => item.URL).filter(Boolean)
  );

  return {
    totalSites: trackedOrigins.size,
    latestPeriod: getPeriod(mobileData) ?? getPeriod(desktopData),
    devices: {
      mobile: getDeviceSummary(mobileData),
      desktop: getDeviceSummary(desktopData),
    },
  };
}
