import { metrics } from "@components/cwv-data-utils/constants";
import {
  sortCWVHistoryData,
  getDateString,
} from "@components/cwv-data-utils/stats";
import { useState } from "react";

const columns = [
  { label: "URL", key: "URL" },
  {
    label: "LCP",
    key: metrics.LCP.cruxKey,
  },
  { label: "INP", key: metrics.INP.cruxKey },
  { label: "CLS", key: metrics.CLS.cruxKey },
];

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
            <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
              {index + 1}
            </td>
            {columns.map(({ key }) => (
              <td
                className="px-2 py-2 whitespace-nowrap text-sm text-gray-500"
                key={`${item.URL}-${key}`}>
                {key === "URL" ? (
                  <a href={`/crux-visualizer?url=${item[key]}`}>{item[key]}</a>
                ) : (
                  item[key]
                )}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
}

export default function AllDataTable({ data, cruxType = "origin" }) {
  const [sortColumn, setSortColumn] = useState("interaction_to_next_paint");
  const [sortDirection, setSortDirection] = useState("asc");

  const dataSorted = sortCWVHistoryData({
    data,
    metricName: sortColumn || metrics.INP.cruxKey,
    sortDirection,
    cruxType,
  });
  const lastCollectionPeriod = dataSorted[0].lastCollectionPeriod;
  const { firstDate, lastDate } = lastCollectionPeriod ?? {};
  const firstDateString = getDateString(firstDate);
  const lastDateString = getDateString(lastDate);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <h2 className="text-lg mt-4 text-black-600 px-6">
          Core Web Vitals{" "}
          <span className="text-red-600">
            From {firstDateString} to {lastDateString}{" "}
          </span>
        </h2>
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
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
