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
  getChartDataSet,
  getOptions,
} from "@components/cwv-data-utils/chart-utils/crux-chart-data.ts";
import { metrics } from "../../cwv-data-utils/constants.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

function CwvTrendLineChart({ metric, cwvData }) {
  const { label, cruxKey } = metric;
  const title = label;
  const dataSet = getChartDataSet({ metricName: cruxKey, cwvData });

  return (
    <div className="m-5">
      <Line
        data={dataSet}
        options={getOptions(title)}
        height={500}
        width={1000}
      />
    </div>
  );
}

export default function Charts({ cwvData }) {
  return (
    <>
      <CwvTrendLineChart metric={metrics.INP} cwvData={cwvData} />
      <CwvTrendLineChart metric={metrics.CLS} cwvData={cwvData} />
      <CwvTrendLineChart metric={metrics.LCP} cwvData={cwvData} />
    </>
  );
}
