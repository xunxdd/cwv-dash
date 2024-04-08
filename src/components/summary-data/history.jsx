import CruxHistory from "@components/crux/data-table/crux-history";
import { useState } from "react";
import { Tabs } from "@components/tabs/index";
import { cruxTabOptions } from "@components/cwv-data-utils/constants";

export default function Summary({ pageData, siteData, otherSiteData }) {
  const [selectedTab, setSelectedTab] = useState("page");

  return (
    <>
      <Tabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabs={cruxTabOptions}
      />
      <div>
        {selectedTab == "page" && (
          <CruxHistory data={pageData} cruxType="url" />
        )}
        {selectedTab === "site" && <CruxHistory data={siteData} />}
        {selectedTab === "sample-sites" && <CruxHistory data={otherSiteData} />}
      </div>
    </>
  );
}
