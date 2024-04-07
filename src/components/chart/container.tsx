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
import { useRef, useEffect, useState } from "react";
import { listDates } from "./chart-utils/dates-selection";
import { urls as allUrls } from "./chart-utils/urls.js";

function getOptions(title: string) {
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
const fakeData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Dataset 1",
      data: [-508, -22, 423, -366, 492, 870, -44],
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: [597, 689, 795, -521, -366, 928, -143],
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

function CwvTrendLineChart({ dates, metricName, cwvData }) {
  const dataSet = chartData({ dates, metricName, cwvData });
  const title = `Trend of ${metricName}`;
  console.log(dataSet);
  return (
    <>
      <Line
        data={dataSet}
        options={getOptions(title)}
        height={600}
        width={1200}
      />
    </>
  );
}

export const CwvLine = ({ data }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const selectedDates = listDates({ startDate: "02/07", jsonData: data });
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
    <CwvTrendLineChart
      dates={selectedDates}
      metricName="CLS-score"
      cwvData={cwvData}
    />
  );
};
