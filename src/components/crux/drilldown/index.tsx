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

function DrillDownChart({ url, cruxType, chartType = "distribution" }) {
  const [cwvData, setcwvData] = useState(null);
  const [error, setError] = useState("");
  let trendCwvData = null;

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchCruxData(url, cruxType);
        if (data) {
          setcwvData(data);
        }
      } catch (e) {
        setError("Error fetching data");
      }
    }
    fetchData();
  }, [url]);

  if (cwvData) {
    trendCwvData = getCruxTrendDataDrillDown({
      pageUrls: [url],
      data: [cwvData],
      cruxType: cruxType || "url",
      dateType: "",
    });
  }

  return (
    <div>
      <b>{url}</b>-<b> {cruxType}</b>-<b> {chartType}</b>
      {error && <Error text={error} />}
      {cwvData && (
        <div
          style={{
            display: chartType === "distribution" ? "block" : "none",
          }}>
          <DistributionChart cwvData={cwvData} />
        </div>
      )}
      {trendCwvData && (
        <div
          style={{
            display: chartType === "75percentile" ? "block" : "none",
          }}>
          <TrendChart cwvData={trendCwvData} />
        </div>
      )}
    </div>
  );
}

export default function Drilldown() {
  const searchParams = new URLSearchParams(window?.location?.search);
  const url = searchParams.get("url");
  let urlVal = "";
  const [error, setError] = useState("");

  if (url && (origin.startsWith("http://") || origin.startsWith("https://"))) {
    try {
      const urlObj = new URL(url);
      const { origin, pathname, protocol, hostname } = urlObj;
      if (!urlObj.hostname.startsWith("www.")) {
        urlVal = `${protocol}//www.${hostname}${urlObj.pathname}`;
      } else {
        urlVal = `${origin}${pathname}`;
      }
    } catch {
      setError("Invalid URL. Please make sure to enter a valid URL");
    }
  }
  const cruxType = searchParams.get("cruxType");
  const chartType = searchParams.get("type") || "distribution";

  return (
    <>
      <ChartControl />
      {error && <Error text={error} />}
      {url && (
        <DrillDownChart
          url={urlVal}
          cruxType={cruxType}
          chartType={chartType}
        />
      )}
    </>
  );
}
