import * as chartDataUtils from "./chart-data.js";
import { data } from "./mock-data.js";
import { urls } from "./urls.js";

describe("chart-data", () => {
  it("chartData", async () => {
    const pageUrls = urls.slice(0, 1);
    const chartData = await chartDataUtils.getDataCollectionByUrls({
      pageUrls,
      allData: data,
    });
    expect(Object.keys(chartData)[0]).toBe(pageUrls[0]);
  });
});
