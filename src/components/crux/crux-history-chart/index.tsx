import { useEffect, useState } from "react";
import {
  cruxTabOptions,
  formFactorOptions,
} from "@components/cwv-data-utils/constants";
import { Tabs } from "@components/tabs/index";
import { DomainSelector } from "./domain-selector";
import { ChartContainer } from "./chart";

export default function CruxChart({
  data,
  siteData,
  otherSiteData,
  availableDomains,
  dataByFormFactor,
}) {
  const [selectedTab, setSelectedTab] = useState("url");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [typeSelected, setTypeSelected] = useState("all");
  const [selectedFormFactor, setSelectedFormFactor] = useState("PHONE");
  const selectedFormFactorLabel =
    formFactorOptions.find(({ value }) => value === selectedFormFactor)?.label ??
    selectedFormFactor;
  const currentData = dataByFormFactor?.[selectedFormFactor] ?? {
    pageData: data,
    siteData,
    otherSiteData,
    availableDomains,
  };

  useEffect(() => {
    setSelectedDomain("all");
    setTypeSelected("all");
  }, [selectedFormFactor]);

  const regex = typeSelected === "listicle/gallery" ? /g\d+/ : /a\d+/;
  const pageData = currentData.pageData ?? [];
  const currentAvailableDomains = currentData.availableDomains ?? [];

  const filteredCwvUrlData =
    selectedDomain === "all" && typeSelected === "all"
      ? pageData
      : pageData.filter((d) => {
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
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="crux-chart-form-factor" className="text-sm">
          Device
        </label>
        <select
          id="crux-chart-form-factor"
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
      <Tabs
        options={cruxTabOptions}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      {selectedTab == "url" && (
        <DomainSelector
          domains={currentAvailableDomains}
          domainSelected={selectedDomain}
          setDomainSelected={setSelectedDomain}
          typeSelected={typeSelected}
          setTypeSelected={setTypeSelected}
        />
      )}
      {selectedTab == "url" && (
        <ChartContainer
          data={filteredCwvUrlData}
          cruxType="url"
          formFactorLabel={selectedFormFactorLabel}
        />
      )}
      {selectedTab == "origin" && (
        <ChartContainer
          data={currentData.siteData}
          cruxType="origin"
          formFactorLabel={selectedFormFactorLabel}
        />
      )}
      {selectedTab == "sample-origins" && (
        <ChartContainer
          data={currentData.otherSiteData}
          cruxType="origin"
          formFactorLabel={selectedFormFactorLabel}
        />
      )}
    </>
  );
}
