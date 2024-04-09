import AllDataTable from "@components/summary-data/all-data-table";
import { useState } from "react";

export default function Summary({ pageData, siteData }) {
  const [selectedTab, setSelectedTab] = useState("page");
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
        {selectedTab == "page" && <AllDataTable data={pageData} />}
        {selectedTab === "site" && <AllDataTable data={siteData} />}
      </div>
    </>
  );
}
