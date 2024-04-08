import { ChartControls } from "./crux-history-selecton-controls";
// import { getDataCollectionByUrls } from "./chart-utils/chart-data.js";
import { listDates } from "@components/cwv-data-utils/chart-utils/dates-selection";
import { urls as allUrls } from "@components/cwv-data-utils/chart-utils/urls.js";
import { sortCWVData } from "../cwv-data-utils/stats.js";

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

  if (urlType === "select-url") {
    return selectedUrls.length ? selectedUrls : allUrls.slice(0, 10);
  }

  const sortedData = sortCWVData(data);
  if (urlType === "best-url")
    return sortedData.slice(0, 5).map((d: any) => d.URL);

  if (urlType === "worst-url") {
    return sortedData.slice(-5).map((d: any) => d.URL);
  }
}

export const ChartContainer = ({ data }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  let selectedDates = listDates({ jsonData: data, dateType: state.dateType });

  const pageUrls = getPageUrls(data, state.urlType, state.urls);
  console.log("pageUrls", pageUrls);
  // if (state.dateType) {
  //   selectedDates = listDates({
  //     startDate: state.dateType,
  //     jsonData: data,
  //     dateType: state.dateType,
  //   });
  // }

  return (
    <>
      <ChartControls state={state} dispatch={dispatch} />
    </>
  );
};
