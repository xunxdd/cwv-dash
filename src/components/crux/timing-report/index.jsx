import { useMemo, useState } from "react";
import { columns } from "@components/cwv-data-utils/constants";
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

function getValueDelta(startValue, currentValue) {
  return Number((currentValue - startValue).toFixed(3));
}

function getNumericValue(value) {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
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
  return Number(a[sortKey]) - Number(b[sortKey]);
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
    sparklineValues: values.slice(
      Math.max(0, baselineIndex - 1),
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
  const timingReport = useMemo(
    () => getTimingReport(data, metricName, reportType),
    [data, metricName, reportType]
  );
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
  const reportLabel =
    reportType === "nonGood" ? "current non-good runs" : "recent worsening";
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
      <div className="mt-4 border rounded p-4 bg-gray-50 text-sm text-gray-600">
        No {reportLabel} found for {selectedMetric?.label ?? "metric"}.
      </div>
    );
  }

  return (
    <section className="mt-4 border rounded p-3 bg-gray-50">
      <h3 className="text-base font-semibold text-gray-900">
        {selectedMetric?.label ?? "Metric"} issue start timing
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        {reportType === "nonGood"
          ? "Current non-good runs grouped by the period where each run started."
          : "Worsening rows use the first period that moved materially above the prior low. Start is that prior low."}{" "}
        2024 collection periods are excluded.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {sortableTableColumns.map(({ key, label }) => {
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
                <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                  {row.startDate}
                </td>
                <td className="px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {row.URL}
                </td>
                <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                  {row.startValue} ({formatStatus(row.startStatus)})
                </td>
                <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                  {row.currentValue}
                </td>
                <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                  +{row.delta}
                </td>
                <td className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                  {formatStatus(row.currentStatus)}
                </td>
                <td className="px-3 py-2 text-sm text-gray-600">
                  <Sparkline values={row.sparklineValues} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function CruxIssueTiming({ siteData, otherSiteData }) {
  const [selectedDataSet, setSelectedDataSet] = useState("origin");
  const [selectedMetric, setSelectedMetric] = useState(
    "cumulative_layout_shift"
  );
  const [reportType, setReportType] = useState("worsening");
  const data = selectedDataSet === "origin" ? siteData : otherSiteData;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <button
            className={
              selectedDataSet === "origin"
                ? "px-4 py-2 bg-blue-500 text-white"
                : "px-4 py-2 bg-gray-100 text-black"
            }
            onClick={() => setSelectedDataSet("origin")}>
            Origin Data
          </button>
          <button
            className={
              selectedDataSet === "sample-origins"
                ? "px-4 py-2 bg-blue-500 text-white"
                : "px-4 py-2 bg-gray-100 text-black"
            }
            onClick={() => setSelectedDataSet("sample-origins")}>
            Sample Site Data
          </button>
        </div>
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
          <option value="worsening">All worsening</option>
          <option value="nonGood">Current non-good only</option>
        </select>
      </div>
      <TimingReportTable
        data={data}
        metricName={selectedMetric}
        reportType={reportType}
      />
    </div>
  );
}
