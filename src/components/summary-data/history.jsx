///import { selectedTab, setSelectedTab } from "./store";
import CruxHistory from "@components/summary-data/crux-history";
import { useState } from "react";

export default function Summary({ pageData, siteData }) {
  const [selectedTab, setSelectedTab] = useState("page");
  console.log({ pageData });
  return (
    <>
      <div>
        <button
          className={
            selectedTab == "page"
              ? "px-4 py-2 bg-blue-500 text-white"
              : "px-4 py-2 bg-gray-100 text-black"
          }
          onClick={() => {
            setSelectedTab("page");
          }}>
          View Page Data
        </button>
        <button
          className={
            selectedTab == "site"
              ? "px-4 py-2 bg-blue-500 text-white"
              : "px-4 py-2 bg-gray-100 text-black"
          }
          onClick={() => {
            setSelectedTab("site");
          }}>
          View Site Data
        </button>
      </div>
      <div>
        {selectedTab == "page" && (
          <CruxHistory data={pageData} cruxType="url" />
        )}
        {selectedTab === "site" && <CruxHistory data={siteData} />}
      </div>
    </>
  );
}
