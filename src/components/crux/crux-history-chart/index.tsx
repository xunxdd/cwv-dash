import { useState } from "react";
import { cruxTabOptions } from "@components/cwv-data-utils/constants";
import { Tabs } from "@components/tabs/index";
import { DomainSelector } from "./domain-selector";
import { ChartContainer } from "./chart";

export default function CruxChart({
  data,
  siteData,
  otherSiteData,
  cadHistoryData,
  availableDomains,
}) {
  const [selectedTab, setSelectedTab] = useState(
    typeof window === "undefined" || window.envs?.environment === "production"
      ? "sample-origins"
      : "url"
  );
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [typeSelected, setTypeSelected] = useState("all");

  const regex = typeSelected === "listicle/gallery" ? /g\d+/ : /a\d+/;

  const filteredCwvUrlData =
    selectedDomain === "all" && typeSelected === "all"
      ? data
      : data.filter((d) => {
          let match = true;
          if (
            ["listicle/gallery", "standard/long-form"].includes(typeSelected)
          ) {
            match = d.URL?.match(regex);
          }

          return match && d.URL?.includes(selectedDomain);
        });

  return (
    <>
      <Tabs
        options={cruxTabOptions}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      {selectedTab == "url" && (
        <DomainSelector
          domains={availableDomains}
          domainSelected={selectedDomain}
          setDomainSelected={setSelectedDomain}
          typeSelected={typeSelected}
          setTypeSelected={setTypeSelected}
        />
      )}
      {selectedTab == "url" && (
        <ChartContainer data={filteredCwvUrlData} cruxType="url" />
      )}
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
