import CruxHistory from "./crux-history";
import { useState } from "react";
import { cruxTabOptions } from "@components/cwv-data-utils/constants";
import { Tabs } from "@components/tabs/index";

export default function Summary({
  pageData,
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
      <div>
        {selectedTab == "url" && <CruxHistory data={pageData} cruxType="url" />}
        {selectedTab == "cad" && (
          <CruxHistory data={cadHistoryData} cruxType="url" />
        )}
        {selectedTab === "origin" && (
          <CruxHistory data={siteData} cruxType="origin" />
        )}
        {selectedTab === "sample-origins" && (
          <CruxHistory data={otherSiteData} cruxType="origin" />
        )}
      </div>
    </>
  );
}
