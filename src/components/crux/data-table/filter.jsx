const [filter, setFilter] = useState("all");

export default function TableFilter({ dataSorted }) {
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    // Add your filtering logic here
  };

  return (
    <div className="flex flex-col ">
      <div className="-my-2 overflow-x-auto">
        <h2 className="text-lg mt-4 text-black-600">
          <div>
            Core Web Vitals{" "}
            <span className="text-red-600">
              From {firstDateString} to {lastDateString}{" "}
            </span>
          </div>
        </h2>
        <div className="flex justify-between mt-4">
          <div>
            <select
              value={filter}
              onChange={handleFilterChange}
              className="border rounded p-1">
              <option value="all">All</option>
              <option value="good">Good</option>
              <option value="needs improvement">Needs Improvement</option>
              <option value="bad">Bad</option>
            </select>
          </div>
          <button
            className="text-blue-500 hover:text-blue-700 text-white  py-2 px-4 rounded"
            onClick={() => downloadCSV(dataSorted)}>
            Download CSV
          </button>
        </div>

        <div className="py-2 align-middle inline-block min-w-full">
          {/* ... */}
        </div>
      </div>
    </div>
  );
}
