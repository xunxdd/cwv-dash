import { metrics, columns } from "@components/cwv-data-utils/constants";
import {
  sortCWVHistoryData,
  filterCWVHistoryData,
  getDateString,
} from "@components/cwv-data-utils/stats";
import { useState, useMemo } from "react";
import Papa from "papaparse";

let saveAs;

import("file-saver")
  .then((module) => {
    saveAs = module.saveAs;
  })
  .catch((err) => {
    console.error("Failed to load file-saver", err);
  });

const metricOptions = columns.filter(({ threshold }) => threshold);

function formatCollectionPeriodForFilename(date) {
  if (!date) return "unknown-period";

  const { year, month, day } = date;
  return [month, day, year]
    .map((value) => String(value).padStart(2, "0"))
    .join("-");
}

function getFormFactorForFilename(formFactor) {
  return formFactor === "DESKTOP" ? "desktop" : "mobile";
}

function getCSVFilename({ collectionPeriod, formFactor }) {
  const period = formatCollectionPeriodForFilename(collectionPeriod?.lastDate);
  const device = getFormFactorForFilename(formFactor);

  return `cwv-${period}-${device}.csv`;
}

function downloadCSV(data, filename) {
  try {
    const csvData = data.map((item) => {
      const row = {};
      columns.forEach(({ key, label }) => {
        row[label] = item[key];
      });
      return row;
    });
    const csv = Papa.unparse(csvData);

    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, filename);
  } catch (e) {
    console.error(e, "downloadCSV error");
  }
}

function Header({ onSort, currentSortColumn, currentSortDirection }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium
          text-gray-500 uppercase tracking-wider cursor-pointer">
          {" "}
        </th>
        {columns.map(({ key, label }) => (
          <th
            key={key}
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => onSort(key)}>
            {label}
            {currentSortColumn === key && (
              <span>{currentSortDirection === "asc" ? "▲" : "▼"}</span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}
function getVisualizerHref({ url, cruxType, formFactor }) {
  const params = new URLSearchParams({
    url,
    cruxType,
    formFactor,
  });
  return `/crux-visualizer?${params.toString()}`;
}

function Body({ dataSorted, cruxType, formFactor }) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {dataSorted.map((item, index) => {
        return (
          <tr key={item.URL} className={index % 2 === 0 ? "bg-gray-100" : ""}>
            <td
              className="px-2 py-2 whitespace-nowrap text-sm text-gray-500"
              style={{ width: "8px" }}>
              {index + 1}
            </td>
            {columns.map(({ key }) => {
              return (
                <td
                  className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 max-w-lg truncate"
                  key={`${item.URL}-${key}`}>
                  {key === "URL" ? (
                    <a
                      href={getVisualizerHref({
                        url: item[key],
                        cruxType,
                        formFactor,
                      })}
                      className="relative flex flex-wrap font-medium hover:text-gray-900 text-gray-500 dark:text-gray-400 dark:hover:text-white">
                      {item[key]} <span className="mr-2">🔗</span>
                    </a>
                  ) : (
                    item[key]
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}

function getFilterData(data, metricName) {
  return {
    good: filterCWVHistoryData({
      data,
      metricName,
      filter: "good",
    }),
    poor: filterCWVHistoryData({ data, metricName, filter: "poor" }),
    needsImprovement: filterCWVHistoryData({
      data,
      metricName,
      filter: "needsImprovement",
    }),
  };
}

export default function AllDataTable({
  data,
  cruxType = "origin",
  formFactor = "PHONE",
}) {
  const [sortColumn, setSortColumn] = useState(metrics.CLS.cruxKey);
  const [sortDirection, setSortDirection] = useState("asc");
  const [filter, setFilter] = useState("all");
  const [summaryMetric, setSummaryMetric] = useState(metrics.CLS.cruxKey);
  const sanitizedData = data;

  if (!sanitizedData) return null;

  const filterData = useMemo(
    () => getFilterData(sanitizedData, summaryMetric),
    [sanitizedData, summaryMetric]
  );

  const filteredResult = filterData[filter] ?? sanitizedData;
  const selectedMetric = metricOptions.find(({ key }) => key === summaryMetric);

  const dataSorted = useMemo(
    () =>
      sortCWVHistoryData({
        data: filteredResult,
        metricName: sortColumn || metrics.CLS.cruxKey,
        sortDirection,
        sortColumn,
      }),
    [
      sortColumn,
      sortDirection,
      metrics.CLS.cruxKey,
      sortDirection,
      filteredResult,
    ]
  );

  if (!dataSorted) return null;

  let firstDateString = "";
  let lastDateString = "";
  let csvFilename = getCSVFilename({ formFactor });

  if (sanitizedData.length > 0) {
    const lastCollectionPeriod = sanitizedData?.[0]?.lastCollectionPeriod;
    const { firstDate, lastDate } = lastCollectionPeriod ?? {};
    firstDateString = getDateString(firstDate);
    lastDateString = getDateString(lastDate);
    csvFilename = getCSVFilename({
      collectionPeriod: lastCollectionPeriod,
      formFactor,
    });
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSummaryMetricChange = (event) => {
    const metricName = event.target.value;
    setSummaryMetric(metricName);
    setSortColumn(metricName);
    setSortDirection("asc");
  };

  return (
    <div className="flex flex-col ">
      <div className="-my-2 overflow-x-auto">
        <h2 className="text-lg mt-4 text-black-600 flex justify-between">
          <div>
            Core Web Vitals{" "}
            <span className="text-red-600">
              From {firstDateString} to {lastDateString}{" "}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label htmlFor="summary-metric" className="text-sm">
              Summarize by
            </label>
            <select
              id="summary-metric"
              value={summaryMetric}
              onChange={handleSummaryMetricChange}
              className="border rounded p-1 text-sm">
              {metricOptions.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <span className="text-green-600 px-3">
              Good: {filterData.good.length}{" "}
            </span>
            <span className="text-red-600 px-3">
              Poor: {filterData.poor.length}{" "}
            </span>
            <span className="text-orange-600 px-3">
              Need Improvement: {filterData.needsImprovement.length}{" "}
            </span>
          </div>
        </h2>
        <h2 className="text-lg mt-4 text-black-600"></h2>
        <div className="flex justify-between mt-4">
          <div>
            Filter by {selectedMetric?.label ?? "metric"}:
            <select
              value={filter}
              onChange={handleFilterChange}
              className="border rounded p-1">
              <option value="all">All</option>
              <option value="good">Good</option>
              <option value="needsImprovement">Needs Improvement</option>
              <option value="poor">Bad</option>
            </select>
          </div>
          <button
            className="text-blue-500 hover:text-blue-700   py-2 px-4 rounded"
            onClick={() => downloadCSV(dataSorted, csvFilename)}>
            Download CSV
          </button>
        </div>

        <div className="py-2 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <Header
                onSort={handleSort}
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
              />
              <Body
                dataSorted={dataSorted}
                cruxType={cruxType}
                formFactor={formFactor}
              />
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
