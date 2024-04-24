import { ChartControls } from "./crux-history-selecton-controls.js";
import { sortCWVHistoryData } from "../../cwv-data-utils/stats.js";
import { cruxMetricNames } from "@components/cwv-data-utils/constants.js";
import { useReducer } from "react";
import { getAvailableUrls } from "../../cwv-data-utils/stats.js";
import HistoryCharts from "./crux-history-chart.js";
const metricNames = [
  "cumulative_layout_shift",
  "interaction_to_next_paint",
  "largest_contentful_paint",
];
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

function getPageUrls({
  data,
  urlType,
  selectedUrls = [],
  allUrls,
  cruxType = "url",
}) {
  if (!urlType) return allUrls.slice(0, 10);

  if (urlType === "select-url") {
    return selectedUrls.length ? selectedUrls : allUrls.slice(0, 10);
  }
  const sortedData = sortCWVHistoryData({ data, cruxType, excludeNA: true });

  if (urlType === "best-url")
    return sortedData.slice(0, 5).map((d: any) => d.URL);

  if (urlType === "worst-url") {
    return sortedData.slice(-5).map((d: any) => d.URL);
  }
}

function getCruxData({ pageUrls, data, dateType }) {
  const cruxData: any = [];

  for (let i = 0; i < data.length; i++) {
    const { URL: url, collectionPeriods, metrics } = data[i];

    if (pageUrls.includes(url)) {
      const result = {};
      for (const name of cruxMetricNames) {
        try {
          const values = metrics[name].percentilesTimeseries.p75s;
          result[name] = dateType ? values.slice(-dateType) : values;
        } catch (e) {
          result[name] = [];
        }
      }
      cruxData.push({
        URL: url,
        collectionPeriods: dateType
          ? collectionPeriods.slice(-dateType)
          : collectionPeriods,
        ...result,
      });
    }
  }
  return cruxData;
}

export const ChartContainer = ({ data, cruxType = "url" }) => {
  const allUrls = getAvailableUrls({ data, cruxType });
  const [state, dispatch] = useReducer(reducer, initialState);

  const pageUrls = getPageUrls({
    data,
    urlType: state.urlType,
    selectedUrls: state.urls,
    allUrls,
    cruxType,
  });
  const cwvData = getCruxData({
    pageUrls,
    data,
    dateType: state.dateType,
    cruxType,
  });

  return (
    <>
      <ChartControls state={state} dispatch={dispatch} urls={allUrls} />
      {<HistoryCharts cwvData={cwvData} />}
    </>
  );
};
