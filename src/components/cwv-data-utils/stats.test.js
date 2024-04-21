import { test } from "vitest";
import cruxHistory from "./mock-data/crux-history-sites.json";
import cruxUrlHistory from "./mock-data/crux-history-urls.json";
import { sortCWVHistoryData, filterCWVHistoryData } from "./stats";
import { sanitizeCWVData } from "./data-clean";

test("sortCWVHistoryData default", () => {
  const sanitizeData = sanitizeCWVData({ data: cruxHistory });
  const result = sortCWVHistoryData({ data: sanitizeData });
  expect(result.length).toBe(37);
  expect(result[0].URL).toBe("https://www.popularmechanics.com");
  expect(result[0].interaction_to_next_paint).toBe(259);
  expect(result[36].interaction_to_next_paint).toBe(757);
});

test("sortCWVHistoryData by url", () => {
  const sanitizeData = sanitizeCWVData({ data: cruxHistory });
  const result = sortCWVHistoryData({ data: sanitizeData, metricName: "URL" });
  expect(result.length).toBe(37);
  expect(result[0].URL).toBe("https://www.25ans.jp");
});

test("sortCWVHistoryData URLS by url", () => {
  const pageHistoryData = cruxHistory.filter((page) => page?.record?.metrics);
  const sanitizeData = sanitizeCWVData({ data: pageHistoryData });
  const result = sortCWVHistoryData({
    data: sanitizeData,
    metricName: "URL",
    sortDirection: "asc",
    cruxType: "url",
  });
  expect(result.length).toBe(37);
});

test("sortCWVHistoryData URLS by INP", () => {
  const pageHistoryData = cruxUrlHistory.filter(
    (page) => page?.record?.metrics
  );
  const sanitizeData = sanitizeCWVData({ data: pageHistoryData });

  const result = sortCWVHistoryData({
    data: sanitizeData,
    metricName: "interaction_to_next_paint",
    sortDirection: "asc",
    cruxType: "url",
    excludeNA: true,
  });
  expect(result.length).toBe(19);
});

test.only("filterCWVHistoryData", () => {
  const sanitizeData = sanitizeCWVData({ data: cruxHistory });
  const result = filterCWVHistoryData({ data: sanitizeData, filter: "good" });
  const resultPoor = filterCWVHistoryData({
    data: sanitizeData,
    filter: "poor",
  });
  const resultOk = filterCWVHistoryData({
    data: sanitizeData,
    filter: "needs improvement",
  });
  expect(resultPoor.length).toBe(8);
  expect(resultOk.length).toBe(29);
});
