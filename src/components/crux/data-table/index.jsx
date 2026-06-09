import CruxHistory from "./crux-history";
import ExecutiveSummary from "./executive-summary";
import { useState } from "react";
import {
  cruxTabOptions,
  formFactorOptions,
} from "@components/cwv-data-utils/constants";
import { Tabs } from "@components/tabs/index";

export default function Summary({
  pageData,
  siteData,
  otherSiteData,
  dataByFormFactor,
  executiveSummary,
}) {
  const [selectedTab, setSelectedTab] = useState("origin");
  const [selectedFormFactor, setSelectedFormFactor] = useState("PHONE");
  const currentData = dataByFormFactor?.[selectedFormFactor] ?? {
    pageData,
    siteData,
    otherSiteData,
  };

  //  console.log(siteData);
  return (
    <>
      <ExecutiveSummary summary={executiveSummary} />
      <Tabs
        options={cruxTabOptions}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}>
        <div className="flex items-center gap-2">
          <label htmlFor="crux-summary-form-factor" className="text-sm">
            Device
          </label>
          <select
            id="crux-summary-form-factor"
            value={selectedFormFactor}
            onChange={(event) => setSelectedFormFactor(event.target.value)}
            className="border rounded p-1 text-sm">
            {formFactorOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <a
          href="/crux-issue-timing"
          className="text-sm font-medium text-blue-600 hover:text-blue-800">
          Timing report
        </a>
      </Tabs>
      <div>
        {selectedTab == "url" && (
          <CruxHistory
            key={`${selectedFormFactor}-url`}
            data={currentData.pageData}
            cruxType="url"
            formFactor={selectedFormFactor}
          />
        )}
        {selectedTab === "origin" && (
          <CruxHistory
            key={`${selectedFormFactor}-origin`}
            data={currentData.siteData}
            cruxType="origin"
            formFactor={selectedFormFactor}
          />
        )}
        {selectedTab === "sample-origins" && (
          <CruxHistory
            key={`${selectedFormFactor}-sample-origins`}
            data={currentData.otherSiteData}
            cruxType="origin"
            formFactor={selectedFormFactor}
          />
        )}
      </div>
    </>
  );
}
