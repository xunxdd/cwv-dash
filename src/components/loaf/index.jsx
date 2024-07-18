import { useEffect, useState } from "react";

export default function LoAFTable({ data, columns }) {
  const [loafdata, setLoafPageData] = useState(data);
  const [params, setParams] = useState({ page: 1 });
  useEffect(() => {
    // Function to fetch paged data
    const fetchPagedData = async () => {
      const response = await fetch(`/api/loaf-data?page=${params.page}`);
      if (!response.ok) {
        console.error("Failed to fetch paged data");
        return;
      }
      const data = await response.json();
      setLoafPageData(data.data); // Assuming the API returns an object with a 'data' field
    };
    fetchPagedData();
  }, [params.page]); // Refetch when page changes

  return (
    <div>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr>
              {columns.map((column) => (
                <td>
                  {column.key === "event_timestamp" && row[column.key]
                    ? row[column.key]
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
