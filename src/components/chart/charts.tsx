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
import { chartData } from "./chart-utils/chart-data.js";
import { useEffect, useState } from "react";
import { metrics } from "./chart-utils/constants.js";

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

function CwvTrendLineChart({ dates, metric, cwvData }) {
  const { key, label } = metric;
  const dataSet = chartData({ dates, metricName: key, cwvData });
  const title = label;
  console.log({ dataSet, cwvData });
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

export default function Charts({ cwvData, selectedDates }) {
  const [isRegistered, setIsRegistered] = useState(false);

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
      <CwvTrendLineChart
        dates={selectedDates}
        metric={metrics.INP}
        cwvData={cwvData}
      />
      <CwvTrendLineChart
        dates={selectedDates}
        metric={metrics.CLS}
        cwvData={cwvData}
      />
      <CwvTrendLineChart
        dates={selectedDates}
        metric={metrics.LCP}
        cwvData={cwvData}
      />
    </>
  );
}
