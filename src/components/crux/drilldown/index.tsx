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

ChartJS.register(
  BarController,
  BarElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

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

  return (
    <Bar
      data={chartData}
      options={getOptions(title)}
      height={500}
      width={1000}
    />
  );
}

export default function DistributionDensities({
  siteData,
  pageHistoryData,
  otherSiteData,
  cruxType,
}) {
  const params = new URLSearchParams(window.location.search);
  const url = params.get("url");
  const type = "site"; // params.get("type");
  let data = pageHistoryData;

  if (type === "site") {
    cruxType = "origin";
    data = siteData;
  } else if (type === "other") {
    cruxType = "origin";
    data = otherSiteData;
  }

  const cruxData = data.find((d) => {
    return d.record.key[cruxType] === url;
  });

  return (
    <div className="m-5">
      <StackedBar metric={metrics.INP} cwvData={cruxData} />
      <StackedBar metric={metrics.CLS} cwvData={cruxData} />
      <StackedBar metric={metrics.LCP} cwvData={cruxData} />
    </div>
  );
}
