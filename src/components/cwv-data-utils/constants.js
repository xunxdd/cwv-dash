const urlQualityOptions = [
  { value: "", label: "First 10 urls" },
  { value: "select-url", label: "Used Selected URLs" },
  { value: "best-url", label: "Best 5 URLs" },
  { value: "worst-url", label: "Worst 5 URLs" },
];

const datesOptions = [
  { value: "", label: "All time" },
  { value: "last-28-days", label: "Last 28 days" },
  { value: "last-month", label: "Last Month" },
  { value: "last-2-month", label: "Last 2 Months" },
  { value: "last-3-month", label: "Last 3 Months" },
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

export { urlQualityOptions, datesOptions, metrics };
