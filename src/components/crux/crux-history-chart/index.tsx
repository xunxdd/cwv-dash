import { useState } from "react";
import { cruxTabOptions } from "@components/cwv-data-utils/constants";
import { Tabs } from "@components/tabs/index";
import { ChartContainer } from "./chart";

export default function CruxChart({
  data,
  siteData,
  otherSiteData,
  cadHistoryData,
}) {
  const [selectedTab, setSelectedTab] = useState(
    typeof window === "undefined" || window.envs?.environment === "production"
      ? "sample-origins"
      : "url"
  );
  return (
    <>
      <Tabs
        options={cruxTabOptions}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      {selectedTab == "url" && <ChartContainer data={data} cruxType="url" />}
      {selectedTab == "cad" && (
        <ChartContainer data={cadHistoryData} cruxType="url" />
      )}
      {selectedTab == "origin" && (
        <ChartContainer data={siteData} cruxType="origin" />
      )}
      {selectedTab == "sample-origins" && (
        <ChartContainer data={otherSiteData} cruxType="origin" />
      )}
    </>
  );
}
