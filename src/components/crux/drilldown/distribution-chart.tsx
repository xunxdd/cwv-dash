import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { getMetricDistriutionData } from "@components/cwv-data-utils/chart-utils/crux-chart-data.ts";
import { metrics } from "@components/cwv-data-utils/constants.js";

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
        min: 0,
        max: 100,
      },
    },
  };
}

function StackedBar({ metric, cwvData }) {
  const { label, cruxKey } = metric;
  const title = label;
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

export default function DistributionDensities({ cwvData }) {
  return cwvData ? (
    <div className="m-5 p-5">
      <h5 className="mb-2 p-5 mt-0 text-xl font-medium leading-tight text-primary">
        Core Web Vitals Histogram Timeseries
      </h5>
      <StackedBar metric={metrics.INP} cwvData={cwvData} />
      <StackedBar metric={metrics.CLS} cwvData={cwvData} />
      <StackedBar metric={metrics.LCP} cwvData={cwvData} />
    </div>
  ) : null;
}
