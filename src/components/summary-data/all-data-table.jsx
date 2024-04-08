import { metrics } from "@components/cwv-data-utils/constants";
import { sortCWVData } from "@components/cwv-data-utils/stats";
import { useState } from "react";

const columns = ["URL", "LCP", "INP", "CLS"];

function Header({ onSort, currentSortColumn, currentSortDirection }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <th
            key={column}
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => onSort(column)}>
            {column}
            {currentSortColumn === column && (
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
            {columns.map((column) => (
              <td
                className="px-2 py-2 whitespace-nowrap text-sm text-gray-500"
                key={`${item.URL}-${column}`}>
                {item[column === "DATE" ? "analysisUTCTimestamp" : column]}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
}
export default function AllDataTable({ data }) {
  const [sortColumn, setSortColumn] = useState("INP");
  const [sortDirection, setSortDirection] = useState("asc");
  const dataSorted = sortCWVData(
    data,
    sortColumn || metrics.INP.key,
    sortDirection
  );
  const date = dataSorted[0].analysisUTCTimestamp;

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
          Core Web Vitals for <span className="text-red-600">{date}</span>
        </h2>
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <Header
                onSort={handleSort}
                currentSortColumn={sortColumn}
                currentSortDirection={sortDirection}
              />
              <Body dataSorted={dataSorted} />
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
