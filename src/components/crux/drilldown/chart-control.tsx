import { useState } from "react";

const ratioOptions = [
  { value: "distribution", label: "Distribution" },
  { value: "75percentile", label: "75 Percentile" },
];

export default function UrlInput() {
  const searchParams = new URLSearchParams(window?.location?.search);
  const url = searchParams.get("url");
  const chartType = searchParams.get("type");
  const cruxType = searchParams.get("cruxType");
  const [textUrl, setTextUrl] = useState(url || "");
  const type = chartType || "distribution";

  const onRatioSelect = (selected: string) => {
    window.location.href = `/crux-visualizer?url=${textUrl}&type=${selected}&cruxType=${cruxType}`;
  };

  const handleInputChange = (event) => {
    setTextUrl(event.target.value);
  };

  const onHandleClick = () => {
    window.location.href = `/crux-visualizer?url=${textUrl}&type=${type}&cruxType=${cruxType}`;
  };

  return (
    <>
      <div className="m-5">
        <label
          htmlFor="url-input"
          className="block text-sm font-medium text-gray-700">
          Please Input URL Below:
        </label>
        <input
          id="url-input"
          type="text"
          onChange={handleInputChange}
          value={textUrl}
          className="block px-5 py-3 w-full rounded-md border-2 border-blue-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <button
          onClick={onHandleClick}
          className="mt-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Submit
        </button>
      </div>
      <div className="flex flex-row space-x-4 mt-5">
        {ratioOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="chartType"
              value={option.value}
              checked={type === option.value}
              onChange={() => onRatioSelect(option.value)}
              className="form-radio text-indigo-600 h-5 w-5"
            />
            <span className="ml-2 text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </>
  );
}
