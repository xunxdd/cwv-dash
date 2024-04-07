import { getDataCollectionByUrls } from "./chart-utils/chart-data.js";
import { listDates } from "./chart-utils/dates-selection";
import { urls as allUrls } from "./chart-utils/urls.js";
import { ChartControls } from "./selection-controls";
import { sortCWVData } from "./chart-utils/stats.js";
import Charts from "./charts";
import { useReducer } from "react";

const initialState = {
  dateType: "",
  urlType: "",
  urls: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "setDates":
      return { ...state, dateType: action.payload };
    case "setUrlType":
      return { ...state, urlType: action.payload };
    case "setUrls":
      return { ...state, urls: action.payload };
    default:
      throw new Error();
  }
}

function getPageUrls(data, urlType, selectedUrls = []) {
  if (!urlType) return allUrls.slice(0, 10);
  if (urlType === "select-url" && selectedUrls?.length > 0) return selectedUrls;
  const sortedData = sortCWVData(data);

  if (urlType === "best-url") return sortedData.slice(0, 5);

  if (urlType === "worst-url") {
    return sortedData;
  }
}

export const ChartContainer = ({ data }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  console.log(state.dateType, state.urlType, state.urls);
  let selectedDates = listDates({ jsonData: data });

  const pageUrls = getPageUrls(data, state.urlType, state.urls);

  if (state.dateType) {
    selectedDates = listDates({
      startDate: state.dateType,
      jsonData: data,
      dateType: state.dateType,
    });
  }
  const cwvData = getDataCollectionByUrls({
    dates: selectedDates,
    pageUrls,
    allData: data,
  });
  return (
    <>
      <ChartControls state={state} dispatch={dispatch} />
      {<Charts cwvData={cwvData} selectedDates={selectedDates} />}
    </>
  );
};
