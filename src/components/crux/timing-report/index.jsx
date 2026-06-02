import { useEffect, useMemo, useState } from "react";
import {
  columns,
  formFactorOptions,
} from "@components/cwv-data-utils/constants";
import { getDateString } from "@components/cwv-data-utils/stats";

const metricOptions = columns.filter(({ threshold }) => threshold);
const statusRank = { na: 0, good: 1, needsImprovement: 2, poor: 3 };
const minRegressionDelta = {
  cumulative_layout_shift: 0.03,
  interaction_to_next_paint: 50,
  largest_contentful_paint: 500,
};
const minimumCollectionYear = 2025;
const sortableTableColumns = [
  { key: "startDate", label: "Start Period" },
  { key: "URL", label: "Origin" },
  { key: "startValue", label: "Start" },
  { key: "currentValue", label: "Current" },
  { key: "lastPeriodDelta", label: "Last Period" },
  { key: "delta", label: "Delta" },
  { key: "currentStatus", label: "Status" },
];

function getStatus(value, threshold) {
  const numericValue = Number(value);
  if (value == null || Number.isNaN(numericValue)) return "na";
  if (numericValue <= threshold.good) return "good";
  if (numericValue <= threshold.poor) return "needsImprovement";
  return "poor";
}

function formatStatus(status) {
  if (status === "needsImprovement") return "Needs Improvement";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getSortableDate(dateString) {
  const [month, day, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function getDateTimestamp(date) {
  if (!date) return 0;
  return new Date(
    Number(date.year),
    Number(date.month) - 1,
    Number(date.day)
  ).getTime();
}

function getCollectionPeriodLabels(data) {
  const periodsByTimestamp = new Map();
  (data ?? []).forEach((item) => {
    const periods = item.collectionPeriods?.length
      ? item.collectionPeriods
      : [item.lastCollectionPeriod];

    periods.forEach((period) => {
      if (period?.lastDate) {
        periodsByTimestamp.set(getDateTimestamp(period.lastDate), period);
      }
    });
  });

  const periods = [...periodsByTimestamp.entries()]
    .sort(
      ([firstTimestamp], [secondTimestamp]) =>
        firstTimestamp - secondTimestamp
    )
    .map(([, period]) => period);
  const currentPeriod = periods.at(-1);
  const previousPeriod = periods.at(-2);

  return {
    current: currentPeriod?.lastDate
      ? getDateString(currentPeriod.lastDate)
      : "Current",
    previous: previousPeriod?.lastDate
      ? getDateString(previousPeriod.lastDate)
      : "Previous",
  };
}

function getValueDelta(startValue, currentValue) {
  const start = getNumericValue(startValue);
  const current = getNumericValue(currentValue);
  if (start == null || current == null) return null;
  return Number((current - start).toFixed(3));
}

function getNumericValue(value) {
  if (value == null || value === "na") return null;
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function getLastPeriodChange(values) {
  const currentIndex = values.length - 1;
  const previousValue = getNumericValue(values[currentIndex - 1]);
  const currentValue = getNumericValue(values[currentIndex]);

  if (previousValue == null || currentValue == null) {
    return {
      lastPeriodDelta: null,
      lastPeriodDirection: "na",
    };
  }

  const lastPeriodDelta = getValueDelta(previousValue, currentValue);
  let lastPeriodDirection = "flat";
  if (lastPeriodDelta < 0) {
    lastPeriodDirection = "improved";
  } else if (lastPeriodDelta > 0) {
    lastPeriodDirection = "worse";
  }

  return {
    lastPeriodDelta,
    lastPeriodDirection,
  };
}

function formatSignedDelta(value) {
  if (value == null) return "n/a";
  if (value > 0) return `+${value}`;
  return String(value);
}

function formatLastPeriodChange(row) {
  if (row.lastPeriodDelta == null) return "n/a";
  const directionLabel = {
    improved: "Improved",
    worse: "Worse",
    flat: "Flat",
  }[row.lastPeriodDirection];

  return `${directionLabel} ${formatSignedDelta(row.lastPeriodDelta)}`;
}

function getLastPeriodChangeClass(direction) {
  if (direction === "improved") return "text-green-700";
  if (direction === "worse") return "text-red-700";
  return "text-gray-600";
}

function getTableCellClass(key, row) {
  const baseClass = "px-3 py-2 text-sm whitespace-nowrap";
  if (key === "URL") return `${baseClass} font-medium text-gray-900`;
  if (key === "lastPeriodDelta") {
    return `${baseClass} font-medium ${getLastPeriodChangeClass(
      row.lastPeriodDirection
    )}`;
  }
  return `${baseClass} text-gray-600`;
}

function getTableCellContent(row, key) {
  if (key === "startDate") return row.startDate;
  if (key === "URL") return row.URL;
  if (key === "startValue") {
    return (
      <>
        {row.startValue} ({formatStatus(row.startStatus)})
      </>
    );
  }
  if (key === "currentValue") return row.currentValue;
  if (key === "lastPeriodDelta") return formatLastPeriodChange(row);
  if (key === "delta") return formatSignedDelta(row.delta);
  if (key === "currentStatus") return formatStatus(row.currentStatus);
  return row[key];
}

function hasWorseStatus(startStatus, currentStatus) {
  return statusRank[currentStatus] > statusRank[startStatus];
}

function compareRows(a, b, sortKey) {
  if (sortKey === "startDate") {
    return getSortableDate(a.startDate) - getSortableDate(b.startDate);
  }
  if (sortKey === "URL") {
    return a.URL.localeCompare(b.URL);
  }
  if (sortKey === "currentStatus") {
    return statusRank[a.currentStatus] - statusRank[b.currentStatus];
  }

  const aValue = getNumericValue(a[sortKey]);
  const bValue = getNumericValue(b[sortKey]);
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return -1;
  if (bValue == null) return 1;
  return aValue - bValue;
}

function getFilteredCollectionData({ values, periods }) {
  return periods.reduce(
    (result, period, index) => {
      if (Number(period.lastDate?.year) >= minimumCollectionYear) {
        result.values.push(values[index]);
        result.periods.push(period);
      }
      return result;
    },
    { values: [], periods: [] }
  );
}

function getCurrentNonGoodRun({ item, values, periods, statuses }) {
  const currentIndex = statuses.length - 1;
  const currentStatus = statuses[currentIndex];
  if (!["needsImprovement", "poor"].includes(currentStatus)) return null;

  let startIndex = currentIndex;
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (["good", "na"].includes(statuses[i])) break;
    startIndex = i;
  }

  return {
    URL: item.URL,
    startDate: getDateString(periods[startIndex].lastDate),
    startValue: values[startIndex],
    startStatus: statuses[startIndex],
    currentValue: values[currentIndex],
    currentStatus,
    delta: getValueDelta(values[startIndex], values[currentIndex]),
    ...getLastPeriodChange(values),
    sparklineValues: values.slice(Math.max(0, startIndex - 1), currentIndex + 1),
  };
}

function getRecentWorseningRun({ item, values, periods, statuses, metricName }) {
  const currentIndex = values.length - 1;
  const currentValue = getNumericValue(values[currentIndex]);
  const currentStatus = statuses[currentIndex];
  if (currentValue == null) return null;

  let baselineIndex = -1;
  let baselineValue = Infinity;

  for (let i = 0; i < currentIndex; i++) {
    const value = getNumericValue(values[i]);
    if (value == null) continue;
    if (value <= baselineValue) {
      baselineValue = value;
      baselineIndex = i;
    }
  }

  if (baselineIndex < 0 || currentValue <= baselineValue) return null;

  const baselineStatus = statuses[baselineIndex];
  const delta = getValueDelta(baselineValue, currentValue);
  const minimumDelta = minRegressionDelta[metricName] ?? 0;
  if (delta < minimumDelta && !hasWorseStatus(baselineStatus, currentStatus)) {
    return null;
  }

  let startIndex = baselineIndex;
  for (let i = baselineIndex + 1; i <= currentIndex; i++) {
    const value = getNumericValue(values[i]);
    if (value == null || value <= baselineValue) continue;

    const periodDelta = getValueDelta(baselineValue, value);
    if (
      periodDelta >= minimumDelta ||
      hasWorseStatus(baselineStatus, statuses[i])
    ) {
      startIndex = i;
      break;
    }
  }

  return {
    URL: item.URL,
    startDate: getDateString(periods[startIndex].lastDate),
    startValue: baselineValue,
    startStatus: baselineStatus,
    currentValue,
    currentStatus,
    delta,
    ...getLastPeriodChange(values),
    sparklineValues: values.slice(
      Math.max(0, baselineIndex - 1),
      currentIndex + 1
    ),
  };
}

function getAllSiteRow({ item, values, periods, statuses }) {
  const currentIndex = values.length - 1;
  const previousIndex = currentIndex - 1;
  const previousValue = values[previousIndex];
  const currentValue = values[currentIndex];

  return {
    URL: item.URL,
    startDate: getDateString(periods[previousIndex].lastDate),
    startValue: previousValue,
    startStatus: statuses[previousIndex],
    currentValue,
    currentStatus: statuses[currentIndex],
    delta: getValueDelta(previousValue, currentValue),
    ...getLastPeriodChange(values),
    sparklineValues: values.slice(
      Math.max(0, currentIndex - 15),
      currentIndex + 1
    ),
  };
}

function getTimingReport(data, metricName, reportType) {
  const metric = metricOptions.find(({ key }) => key === metricName);
  if (!metric) return [];

  const rows = data
    .map((item) => {
      const values = item.metrics?.[metricName]?.percentilesTimeseries?.p75s;
      const periods = item.collectionPeriods;
      if (!Array.isArray(values) || !Array.isArray(periods)) return null;

      const { values: filteredValues, periods: filteredPeriods } =
        getFilteredCollectionData({ values, periods });
      if (filteredValues.length < 2) return null;

      const statuses = filteredValues.map((value) =>
        getStatus(value, metric.threshold)
      );
      if (reportType === "all") {
        return getAllSiteRow({
          item,
          values: filteredValues,
          periods: filteredPeriods,
          statuses,
        });
      }
      if (reportType === "nonGood") {
        return getCurrentNonGoodRun({
          item,
          values: filteredValues,
          periods: filteredPeriods,
          statuses,
        });
      }

      return getRecentWorseningRun({
        item,
        values: filteredValues,
        periods: filteredPeriods,
        statuses,
        metricName,
      });
    })
    .filter(Boolean);

  const byStartDate = rows.reduce((result, row) => {
    if (!result[row.startDate]) {
      result[row.startDate] = [];
    }
    result[row.startDate].push(row);
    return result;
  }, {});

  return Object.entries(byStartDate)
    .map(([startDate, groupedRows]) => ({
      startDate,
      rows: groupedRows.sort((a, b) => b.delta - a.delta),
    }))
    .sort((a, b) => getSortableDate(a.startDate) - getSortableDate(b.startDate));
}

function getTrendSummary(data, metricName) {
  const rows = getTimingReport(data, metricName, "all").flatMap(
    ({ rows: groupedRows }) => groupedRows
  );
  const summary = rows.reduce(
    (result, row) => {
      result.total += 1;
      result.directions[row.lastPeriodDirection] =
        (result.directions[row.lastPeriodDirection] ?? 0) + 1;
      result.statuses[row.currentStatus] =
        (result.statuses[row.currentStatus] ?? 0) + 1;
      if (row.lastPeriodDelta != null) {
        result.deltas.push(row.lastPeriodDelta);
      }
      return result;
    },
    {
      total: 0,
      directions: { improved: 0, worse: 0, flat: 0, na: 0 },
      statuses: { good: 0, needsImprovement: 0, poor: 0, na: 0 },
      deltas: [],
    }
  );

  const sortedDeltas = [...summary.deltas].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedDeltas.length / 2);
  const medianDelta =
    sortedDeltas.length === 0
      ? null
      : sortedDeltas.length % 2
        ? sortedDeltas[middleIndex]
        : Number(
            (
              (sortedDeltas[middleIndex - 1] + sortedDeltas[middleIndex]) /
              2
            ).toFixed(3)
          );

  return {
    ...summary,
    medianDelta,
    ...getCollectionPeriodLabels(data),
  };
}

function TrendSummary({ selectedMetric, summary }) {
  if (!summary?.total) return null;

  return (
    <section className="mt-4 border rounded p-3 bg-white">
      <h3 className="text-base font-semibold text-gray-900">
        {selectedMetric?.label ?? "Metric"} latest period trend
      </h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="border rounded p-3">
          <div className="text-xs uppercase text-gray-500">Period</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">
            {summary.previous} to {summary.current}
          </div>
          <div className="mt-1 text-sm text-gray-600">
            Median change {formatSignedDelta(summary.medianDelta)}
          </div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs uppercase text-gray-500">Direction</div>
          <div className="mt-1 text-sm text-green-700">
            {summary.directions.improved} improved
          </div>
          <div className="text-sm text-red-700">
            {summary.directions.worse} worse
          </div>
          <div className="text-sm text-gray-600">
            {summary.directions.flat} flat
          </div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs uppercase text-gray-500">Current Status</div>
          <div className="mt-1 text-sm text-gray-700">
            {summary.statuses.good} good
          </div>
          <div className="text-sm text-gray-700">
            {summary.statuses.needsImprovement} needs improvement
          </div>
          <div className="text-sm text-gray-700">
            {summary.statuses.poor} poor
          </div>
        </div>
      </div>
    </section>
  );
}

function Sparkline({ values }) {
  const cleanValues = values
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));

  if (cleanValues.length < 2) return null;

  const width = 140;
  const height = 34;
  const padding = 3;
  const min = Math.min(...cleanValues);
  const max = Math.max(...cleanValues);
  const range = max - min || 1;
  const pointList = cleanValues.map((value, index) => {
    const x =
      padding + (index / (cleanValues.length - 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });
  const points = pointList
    .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const lastPoint = pointList.at(-1);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="block">
      <polyline
        points={points}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="2.5"
        fill="#2563eb"
      />
    </svg>
  );
}

function TimingReportTable({ data, metricName, reportType }) {
  const [sortConfig, setSortConfig] = useState({
    key: "delta",
    direction: "desc",
  });
  useEffect(() => {
    setSortConfig(
      reportType === "all"
        ? { key: "lastPeriodDelta", direction: "asc" }
        : { key: "delta", direction: "desc" }
    );
  }, [reportType, metricName]);

  const timingReport = useMemo(
    () => getTimingReport(data, metricName, reportType),
    [data, metricName, reportType]
  );
  const trendSummary = useMemo(
    () => getTrendSummary(data, metricName),
    [data, metricName]
  );
  const tableColumns = useMemo(() => {
    const periodLabels = getCollectionPeriodLabels(data);
    if (reportType === "all") {
      return [
        { key: "URL", label: "Origin" },
        { key: "startValue", label: periodLabels.previous },
        { key: "currentValue", label: periodLabels.current },
        { key: "lastPeriodDelta", label: "Last Period" },
        { key: "currentStatus", label: "Status" },
      ];
    }

    return sortableTableColumns.map((column) =>
      column.key === "currentValue"
        ? { ...column, label: periodLabels.current }
        : column
    );
  }, [data, reportType]);
  const sortedRows = useMemo(() => {
    return timingReport
      .flatMap(({ startDate, rows }) =>
        rows.map((row) => ({
          ...row,
          startDate,
        }))
      )
      .sort((a, b) => {
        const result = compareRows(a, b, sortConfig.key);
        return sortConfig.direction === "asc" ? result : -result;
      });
  }, [sortConfig, timingReport]);
  const selectedMetric = metricOptions.find(({ key }) => key === metricName);
  const reportLabel = {
    all: "sites",
    nonGood: "current non-good runs",
    worsening: "recent worsening",
  }[reportType];
  const reportDescription = {
    all: "All origins with previous and current period values.",
    nonGood:
      "Current non-good runs grouped by the period where each run started.",
    worsening:
      "Worsening rows use the first period that moved materially above the prior low. Start is that prior low.",
  }[reportType];
  const tableTitle =
    reportType === "all"
      ? `${selectedMetric?.label ?? "Metric"} all sites`
      : `${selectedMetric?.label ?? "Metric"} issue start timing`;
  const toggleSort = (sortKey) => {
    setSortConfig((currentConfig) => ({
      key: sortKey,
      direction:
        currentConfig.key === sortKey && currentConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  if (!timingReport.length) {
    return (
      <>
        <TrendSummary selectedMetric={selectedMetric} summary={trendSummary} />
        <div className="mt-4 border rounded p-4 bg-gray-50 text-sm text-gray-600">
          No {reportLabel} found for {selectedMetric?.label ?? "metric"}.
        </div>
      </>
    );
  }

  return (
    <>
      <TrendSummary selectedMetric={selectedMetric} summary={trendSummary} />
      <section className="mt-4 border rounded p-3 bg-gray-50">
        <h3 className="text-base font-semibold text-gray-900">{tableTitle}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {reportDescription} 2024 collection periods are excluded.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {tableColumns.map(({ key, label }) => {
                  const isActiveSort = sortConfig.key === key;
                  return (
                    <th
                      key={key}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        aria-label={`Sort ${label} ${
                          isActiveSort && sortConfig.direction === "asc"
                            ? "descending"
                            : "ascending"
                        }`}
                        className="inline-flex items-center gap-1 uppercase">
                        {label}
                        {isActiveSort && (
                          <span aria-hidden="true">
                            {sortConfig.direction === "desc" ? "v" : "^"}
                          </span>
                        )}
                      </button>
                    </th>
                  );
                })}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedRows.map((row) => (
                <tr key={`${row.startDate}-${row.URL}`}>
                  {tableColumns.map(({ key }) => (
                    <td key={key} className={getTableCellClass(key, row)}>
                      {getTableCellContent(row, key)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-sm text-gray-600">
                    <Sparkline values={row.sparklineValues} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default function CruxIssueTiming({ siteData, dataByFormFactor }) {
  const [selectedMetric, setSelectedMetric] = useState(
    "cumulative_layout_shift"
  );
  const [reportType, setReportType] = useState("worsening");
  const [selectedFormFactor, setSelectedFormFactor] = useState("PHONE");
  const currentSiteData =
    dataByFormFactor?.[selectedFormFactor] ?? siteData ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="timing-form-factor" className="text-sm">
          Device
        </label>
        <select
          id="timing-form-factor"
          value={selectedFormFactor}
          onChange={(event) => setSelectedFormFactor(event.target.value)}
          className="border rounded p-1 text-sm">
          {formFactorOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label htmlFor="timing-metric" className="text-sm">
          Metric
        </label>
        <select
          id="timing-metric"
          value={selectedMetric}
          onChange={(event) => setSelectedMetric(event.target.value)}
          className="border rounded p-1 text-sm">
          {metricOptions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <label htmlFor="timing-report-type" className="text-sm">
          View
        </label>
        <select
          id="timing-report-type"
          value={reportType}
          onChange={(event) => setReportType(event.target.value)}
          className="border rounded p-1 text-sm">
          <option value="all">All sites</option>
          <option value="worsening">All worsening</option>
          <option value="nonGood">Current non-good only</option>
        </select>
      </div>
      <TimingReportTable
        data={currentSiteData}
        metricName={selectedMetric}
        reportType={reportType}
      />
    </div>
  );
}
