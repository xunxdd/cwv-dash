import DistributionChart from "./distribution-chart";
import ChartControl from "./chart-control";
import TrendChart from "@components/crux/crux-history-chart/crux-history-chart";
import { fetchCruxData } from "./fetch-crux";
import { useEffect, useState } from "react";
import { getCruxTrendDataDrillDown } from "@components/cwv-data-utils/chart-utils/crux-chart-data";

function Error({ text }) {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert">
      <strong className="font-bold">Error: {text}</strong>
    </div>
  );
}

export default function Drilldown() {
  const searchParams = new URLSearchParams(window?.location?.search);
  const url = searchParams.get("url");
  const [cwvData, setcwvData] = useState(null);
  let trendCwvData = null;
  const [showError, setShowError] = useState(false);
  const chartType = searchParams.get("type") || "distribution";

  useEffect(() => {
    async function fetchData() {
      const data = await fetchCruxData(url);
      setShowError(!data);
      if (data) {
        setcwvData(data);
      }
    }
    fetchData();
  }, [url]);

  if (cwvData) {
    trendCwvData = getCruxTrendDataDrillDown({
      pageUrls: [url],
      data: [cwvData],
      cruxType: "url",
      dateType: "",
    });
  }

  return (
    <>
      <ChartControl />
      {showError && <Error text="No data found for the given URL" />}
      {cwvData && (
        <>
          <div
            style={{
              display: chartType === "distribution" ? "block" : "none",
            }}>
            <DistributionChart cwvData={cwvData} />
          </div>
          <div
            style={{
              display: chartType === "75percentile" ? "block" : "none",
            }}>
            <TrendChart cwvData={trendCwvData} />
          </div>
        </>
      )}
    </>
  );
}
