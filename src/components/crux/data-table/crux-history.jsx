import { metrics, columns } from "@components/cwv-data-utils/constants";
import {
  sortCWVHistoryData,
  filterCWVHistoryData,
  getDateString,
  sanitizeCWVData,
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

function downloadCSV(data) {
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
    saveAs(blob, "data.csv");
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
function Body({ dataSorted }) {
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
                      href={`/crux-visualizer?url=${item[key]}`}
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

function getFilterData(data) {
  return {
    good: filterCWVHistoryData({
      data,
      filter: "good",
    }),
    poor: filterCWVHistoryData({ data, filter: "poor" }),
    needsImprovement: filterCWVHistoryData({
      data,
      filter: "needsImprovement",
    }),
  };
}
export default function AllDataTable({ data, cruxType = "origin" }) {
  const [sortColumn, setSortColumn] = useState("interaction_to_next_paint");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filter, setFilter] = useState("all");
  const sanitizedData = useMemo(
    () => sanitizeCWVData({ data, cruxType }),
    [data]
  );

  if (!sanitizedData) return null;

  const filterData = useMemo(
    () => getFilterData(sanitizedData),
    [sanitizedData]
  );

  const filteredResult = filterData[filter] ?? sanitizedData;

  const dataSorted = useMemo(
    () =>
      sortCWVHistoryData({
        data: filteredResult,
        metricName: sortColumn || metrics.INP.cruxKey,
        sortDirection,
        sortColumn,
      }),
    [
      sortColumn,
      sortDirection,
      metrics.INP.cruxKey,
      sortDirection,
      filteredResult,
    ]
  );

  if (!dataSorted) return null;

  let firstDateString = "";
  let lastDateString = "";

  if (sanitizedData.length > 0) {
    const lastCollectionPeriod = sanitizedData?.[0]?.lastCollectionPeriod;
    const { firstDate, lastDate } = lastCollectionPeriod ?? {};
    firstDateString = getDateString(firstDate);
    lastDateString = getDateString(lastDate);
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
          <div>
            INP
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
            Filter by:
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
            onClick={() => downloadCSV(dataSorted)}>
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
              <Body dataSorted={dataSorted} cruxType={cruxType} />
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
