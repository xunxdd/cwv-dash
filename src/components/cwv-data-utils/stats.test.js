import cruxHistory from "./mock-data/crux-history-sites.json";
import cruxUrlHistory from "./mock-data/crux-history-urls.json";
import { sortCWVHistoryData } from "./stats";

test("sortCWVHistoryData default", () => {
  const result = sortCWVHistoryData({ data: cruxHistory });
  expect(result.length).toBe(37);
  expect(result[0].URL).toBe("https://www.townandcountrymag.com");
  expect(result[0].interaction_to_next_paint).toBe(330);
  expect(result[36].interaction_to_next_paint).toBe(363);
});

test("sortCWVHistoryData by url", () => {
  const result = sortCWVHistoryData({ data: cruxHistory, metricName: "URL" });
  expect(result.length).toBe(37);
  expect(result[0].URL).toBe("https://www.25ans.jp");
  console.log(result[0]);
});

test("sortCWVHistoryData URLS by url", () => {
  const pageHistoryData = cruxUrlHistory.filter(
    (page) => page?.record?.metrics
  );
  const result = sortCWVHistoryData({
    data: pageHistoryData,
    metricName: "URL",
    sortDirection: "asc",
    cruxType: "url",
  });
  expect(result.length).toBe(23);
  expect(result[0].URL).toBe(
    "https://www.bestproducts.com/lifestyle/a45410261/how-to-check-vanilla-gift-card-balance/"
  );
});