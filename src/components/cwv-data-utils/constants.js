const urlQualityOptions = [
  { value: "", label: "First 10 urls" },
  { value: "select-url", label: "Used Selected URLs" },
  { value: "best-url", label: "Best 5 URLs (By INP)" },
  { value: "worst-url", label: "Worst 5 URLs (By INP)" },
];

const datesOptions = [
  { value: "", label: "All time" },
  { value: "last-28-days", label: "Last 28 days" },
  { value: "last-month", label: "Last Month" },
  { value: "last-2-month", label: "Last 2 Months" },
  { value: "last-3-month", label: "Last 3 Months" },
];

const cwvDatesOptions = [
  { value: "", label: "Last 6 months" },
  { value: "8", label: "Last 8 collection periods" },
  { value: "16", label: "Last 16 collection periods" },
];

const metrics = {
  INP: {
    label: "INP - Interaction To Next Paint",
    unit: "ms",
    key: "INP",
    cruxKey: "interaction_to_next_paint",
  },
  LCP: {
    label: "LCP - Largest Content Paint",
    unit: "s",
    key: "LCP",
    cruxKey: "largest_contentful_paint",
  },
  CLS: {
    label: "CLS - Cumulative Layout Shift",
    key: "CLS",
    cruxKey: "cumulative_layout_shift",
  },
};
export const cruxMetricNames = [
  "cumulative_layout_shift",
  "interaction_to_next_paint",
  "largest_contentful_paint",
];

export const cruxTabOptions = [
  { key: "url", label: "All Page Urls" },
  { key: "cad", label: "CAD Urls" },
  { key: "origin", label: "Origin Data" },
  { key: "sample-origins", label: "Sample Site Data" },
];

export { urlQualityOptions, datesOptions, metrics, cwvDatesOptions };

export const columns = [
  { label: "URL", key: "URL" },
  {
    label: "LCP",
    key: metrics.LCP.cruxKey,
    threshold: { good: 2.5, poor: 4 },
  },
  {
    label: "INP",
    key: metrics.INP.cruxKey,
    threshold: { good: 200, poor: 500 },
  },
  {
    label: "CLS",
    key: metrics.CLS.cruxKey,
    threshold: { good: 0.1, poor: 0.25 },
  },
];
