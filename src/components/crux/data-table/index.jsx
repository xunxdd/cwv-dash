import CruxHistory from "./crux-history";
import { useState } from "react";
import { cruxTabOptions } from "@components/cwv-data-utils/constants";
import { Tabs } from "@components/tabs/index";

export default function Summary({ pageData, siteData, otherSiteData }) {
  const [selectedTab, setSelectedTab] = useState("url");
  return (
    <>
      <Tabs
        options={cruxTabOptions}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <div>
        {selectedTab == "url" && <CruxHistory data={pageData} cruxType="url" />}
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
