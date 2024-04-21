import siteData from "./mock-data/other-sites.json";
import inpData from "./mock-data/worst-inp-urls.json";
import inpData1 from "./mock-data/worst-inp-urls1.json";
import inpData2 from "./mock-data/worst-inp-urls2.json";
import cruxHistory from "./mock-data/crux-history-sites.json";
import { getValidCruxData, sanitizeCWVData } from "./data-clean";

test("ble to sort by origin and deduplicate", () => {
  const result = getValidCruxData({ data: siteData, cruxType: "origin" });
  expect(result.length).toBe(23);
});

test("able to sort by url and deduplicate", () => {
  const data = inpData.concat(inpData1, inpData2);
  const result = getValidCruxData({ data, cruxType: "url" });
  expect(result.length).toBe(415);
});

test("sanitizeCWVData", () => {
  const result = sanitizeCWVData({ data: cruxHistory, cruxType: "url" });
  expect(result.length).toBe(37);
});
