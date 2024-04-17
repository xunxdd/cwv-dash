import { metrics } from "@components/cwv-data-utils/constants";
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
