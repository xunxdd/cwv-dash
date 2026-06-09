import { metrics } from "@components/cwv-data-utils/constants";
import { getLatestPeriodSummary } from "../latest-period-summary";

const CLS_METRIC = metrics.CLS.cruxKey;
const CLS_THRESHOLDS = { good: 0.1, poor: 0.25 };
const TOP_IMPROVED_LIMIT = 4;

function getPeriod(data) {
  const itemWithPeriods = data.find((item) => item.collectionPeriods?.length);
  const periods = itemWithPeriods?.collectionPeriods ?? [];

  return periods[periods.length - 1] ?? data[0]?.lastCollectionPeriod ?? null;
}

function getDeviceSummary(data) {
  const summary = getLatestPeriodSummary({
    data,
    metricName: CLS_METRIC,
    threshold: CLS_THRESHOLDS,
    topImprovedLimit: TOP_IMPROVED_LIMIT,
  });

  return {
    totalSites: summary.total,
    improvedCount: summary.directions.improved,
    worseCount: summary.directions.worse,
    flatCount: summary.directions.flat,
    unavailableCount: summary.directions.na,
    unavailableSites: summary.directionSites.na,
    currentCounts: summary.statuses,
    previousCounts: summary.previousStatuses,
    poorSites: summary.poorSites,
    topImprovedSites: summary.topImprovedSites,
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
