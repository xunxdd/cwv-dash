import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  getDataCollectionByUrls,
  chartData,
} from "./chart-utils/chart-data.js";
import { useEffect, useState } from "react";
import { listDates } from "./chart-utils/dates-selection";
import { urls as allUrls } from "./chart-utils/urls.js";
import { ChartControls } from "./selection-controls";

import React, { useReducer } from "react";

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

function getOptions(title: string): any {
  return {
    responsive: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        align: "start" as const,
        padding: 2,
        labels: {
          textAlign: "left" as const,
          font: {
            size: 10,
            lineHeight: 1,
          },
        },
      },

      title: {
        display: true,
        text: title,
        font: { weight: "bolder", size: 14 },
      },
    },
  };
}

function CwvTrendLineChart({ dates, metricName, cwvData }) {
  const dataSet = chartData({ dates, metricName, cwvData });
  const title = metricName;
  return (
    <div className="m-5">
      <Line
        data={dataSet}
        options={getOptions(title)}
        height={600}
        width={1200}
      />
    </div>
  );
}

export const CwvLine = ({ data }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

  console.log(state.dateType, state.urlType, state.urls);
  let selectedDates = listDates({ startDate: "02/07", jsonData: data });
  const pageUrls = allUrls.slice(0, 10);
  if (state.dateType) {
    selectedDates = listDates({
      startDate: state.dateType,
      jsonData: data,
      dateType: state.dateType,
    });
  }
  const cwvData = getDataCollectionByUrls({
    dates: selectedDates,
    pageUrls: allUrls.slice(0, 10),
    allData: data,
  });

  useEffect(() => {
    ChartJS.register(
      LineElement,
      PointElement,
      LinearScale,
      Title,
      CategoryScale,
      Tooltip,
      Legend
    );
    setIsRegistered(true);
  }, []);

  if (!isRegistered) return <></>;

  return (
    <>
      <ChartControls state={state} dispatch={dispatch} />

      <div>test</div>
      {/* <CwvTrendLineChart
        dates={selectedDates}
        metricName="CLS-score"
        cwvData={cwvData}
      />
      <CwvTrendLineChart
        dates={selectedDates}
        metricName="INP-percentile"
        cwvData={cwvData}
      />
      <CwvTrendLineChart
        dates={selectedDates}
        metricName="LCP-percentile"
        cwvData={cwvData}
      />
    </> */}
    </>
  );
};
