import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarController,
  BarElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { getMetricDistriutionData } from "@components/cwv-data-utils/chart-utils/crux-chart-data.ts";
import { metrics } from "@components/cwv-data-utils/constants.js";
import { fetchCruxData } from "./fetch-crux";
import { useEffect, useState } from "react";

ChartJS.register(
  BarController,
  BarElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

function Error({ text }) {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert">
      <strong className="font-bold">Error: {text}</strong>
    </div>
  );
}

function getOptions(title: string): any {
  return {
    plugins: {
      title: {
        display: true,
        text: title,
        font: { weight: "bolder", size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let value = context.parsed.y;
            let percentage = value;
            return `${percentage.toFixed(2)}%`;
          },
        },
      },
    },

    responsive: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
}

function StackedBar({ metric, cwvData }) {
  const { label, cruxKey } = metric;
  const title = label;
  console.log({ label, cruxKey });
  const chartData = getMetricDistriutionData({ metricName: cruxKey, cwvData });
  if (!chartData) return <div>Loading...</div>;
  return (
    <Bar
      data={chartData}
      options={getOptions(title)}
      height={500}
      width={1000}
    />
  );
}

export default function DistributionDensities({}) {
  const [cwvData, setcwvData] = useState(null);
  const searchParams = new URLSearchParams(window?.location?.search);
  const key = document.getElementById("env-context").dataset.key;
  const url = searchParams.get("url");

  if (!url) return <Error text="No URL" />;

  useEffect(() => {
    async function fetchData() {
      const data = await fetchCruxData(url);
      setcwvData(data);
    }
    fetchData();
  }, []);

  return cwvData ? (
    <div className="m-5 p-5">
      <h5 className="mb-2 p-5 mt-0 text-xl font-medium leading-tight text-primary">
        Core Web Vitals Histogram Timeseries for <a href={url}>{url}</a>
      </h5>
      <StackedBar metric={metrics.INP} cwvData={cwvData} />
      <StackedBar metric={metrics.CLS} cwvData={cwvData} />
      <StackedBar metric={metrics.LCP} cwvData={cwvData} />
    </div>
  ) : (
    <div>Loading...</div>
  );
}
