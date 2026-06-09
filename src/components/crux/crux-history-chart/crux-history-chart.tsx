import { useMemo } from "react";
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
import { columns, metrics } from "../../cwv-data-utils/constants.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

const normalizedBandPlugin = {
  id: "normalized-cwv-bands",
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const yScale = scales.y;
    if (!chartArea || !yScale) return;

    const bands = [
      { from: 0, to: 1, color: "rgba(22, 163, 74, 0.08)" },
      { from: 1, to: 2, color: "rgba(217, 119, 6, 0.1)" },
      { from: 2, to: 3, color: "rgba(220, 38, 38, 0.08)" },
    ];

    ctx.save();
    bands.forEach(({ from, to, color }) => {
      const fromPixel = yScale.getPixelForValue(from);
      const toPixel = yScale.getPixelForValue(to);
      const yTop = Math.min(fromPixel, toPixel);
      const yBottom = Math.max(fromPixel, toPixel);
      ctx.fillStyle = color;
      ctx.fillRect(
        chartArea.left,
        yTop,
        chartArea.right - chartArea.left,
        yBottom - yTop
      );
    });
    ctx.restore();
  },
};

const trendSeriesColors = [
  "#2f7eea",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
  "#38bdf8",
  "#f472b6",
  "#60a5fa",
  "#c084fc",
  "#22d3ee",
];

function getMetricThreshold(metricName: string) {
  return columns.find(({ key }) => key === metricName)?.threshold;
}

function formatRawValue(metricName: string, value) {
  if (value == null || Number.isNaN(Number(value))) return "n/a";
  const numericValue = Number(value);
  if (metricName === metrics.CLS.cruxKey) return numericValue.toFixed(2);
  return `${numericValue.toLocaleString()} ms`;
}

function normalizeMetricValue(value, threshold) {
  if (value == null) return null;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;

  if (numericValue <= threshold.good) {
    return numericValue / threshold.good;
  }

  if (numericValue <= threshold.poor) {
    return 1 + (numericValue - threshold.good) / (threshold.poor - threshold.good);
  }

  const poorRange = threshold.poor - threshold.good;
  return Math.min(3, 2 + (numericValue - threshold.poor) / poorRange);
}

function getDisplayLabel(url: string) {
  try {
    const { hostname, pathname } = new URL(url);
    const compactPath = pathname === "/" ? "" : pathname.replace(/\/$/, "");
    const label = `${hostname}${compactPath}`;
    return label.length > 72 ? `${label.slice(0, 69)}...` : label;
  } catch {
    return url?.length > 72 ? `${url.slice(0, 69)}...` : url;
  }
}

function compactDataSetLabels(dataSet) {
  return {
    ...dataSet,
    datasets: dataSet.datasets.map((dataset, index) => {
      const color = trendSeriesColors[index % trendSeriesColors.length];

      return {
        ...dataset,
        fullLabel: dataset.label,
        label: getDisplayLabel(dataset.label),
        backgroundColor: color,
        borderColor: color,
        pointBackgroundColor: color,
        pointBorderColor: color,
      };
    }),
  };
}

function getNormalizedChartDataSet({ metricName, cwvData }) {
  const rawDataSet = compactDataSetLabels(
    getChartDataSet({ metricName, cwvData })
  );
  const threshold = getMetricThreshold(metricName);

  if (!threshold) return rawDataSet;

  return {
    ...rawDataSet,
    datasets: rawDataSet.datasets.map((dataset) => ({
      ...dataset,
      data: dataset.data.map((value) => normalizeMetricValue(value, threshold)),
      rawData: dataset.data,
      spanGaps: true,
    })),
  };
}

function getNormalizedOptions(title: string, metricName: string): any {
  const baseOptions = getOptions(title);

  return {
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    scales: {
      y: {
        min: 0,
        max: 3,
        ticks: {
          stepSize: 0.5,
          callback(value) {
            if (value === 0.5) return "Good";
            if (value === 1.5) return "Needs improvement";
            if (value === 2.5) return "Poor";
            return "";
          },
        },
        grid: {
          color(context) {
            return [1, 2].includes(context.tick.value)
              ? "rgba(15, 23, 42, 0.45)"
              : "rgba(148, 163, 184, 0.25)";
          },
          lineWidth(context) {
            return [1, 2].includes(context.tick.value) ? 1.5 : 1;
          },
        },
        title: {
          display: true,
          text: "CrUX threshold band",
        },
      },
    },
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        callbacks: {
          label(context) {
            const rawValue = context.dataset.rawData?.[context.dataIndex];
            return `${context.dataset.fullLabel ?? context.dataset.label}: ${formatRawValue(
              metricName,
              rawValue
            )}`;
          },
          afterLabel(context) {
            const normalizedValue = context.parsed.y;
            if (normalizedValue == null) return "";
            if (normalizedValue <= 1) return "Status: Good";
            if (normalizedValue <= 2) return "Status: Needs Improvement";
            return "Status: Poor";
          },
        },
      },
    },
  };
}

function CwvTrendLineChart({ metric, cwvData, formFactorLabel }) {
  const { label, cruxKey } = metric;
  const title = `${label} - ${formFactorLabel} p75`;
  const dataSet = useMemo(
    () => getNormalizedChartDataSet({ metricName: cruxKey, cwvData }),
    [cruxKey, cwvData]
  );
  const options = getNormalizedOptions(title, cruxKey);

  return (
    <div className="rounded border border-slate-200 bg-white p-3">
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 bg-green-500" />
          Good
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 bg-amber-500" />
          Needs improvement
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 bg-red-500" />
          Poor
        </span>
      </div>
      <div className="h-[360px]">
        <Line data={dataSet} options={options} plugins={[normalizedBandPlugin]} />
      </div>
    </div>
  );
}

export default function Charts({ cwvData, formFactorLabel = "Mobile" }) {
  return (
    <div className="mt-4 space-y-4">
      <p className="max-w-3xl text-sm text-slate-600">
        Each chart is normalized against the metric's CrUX thresholds: Good is
        the lower green band, needs improvement is the middle band, and poor is
        the upper red band. Tooltips show the original p75 value.
      </p>
      <CwvTrendLineChart
        metric={metrics.CLS}
        cwvData={cwvData}
        formFactorLabel={formFactorLabel}
      />
      <CwvTrendLineChart
        metric={metrics.INP}
        cwvData={cwvData}
        formFactorLabel={formFactorLabel}
      />
      <CwvTrendLineChart
        metric={metrics.LCP}
        cwvData={cwvData}
        formFactorLabel={formFactorLabel}
      />
    </div>
  );
}
