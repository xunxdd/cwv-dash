// dates-selection.test.js
import { listDates, toUTCDate } from "./dates-selection";

test("generates a list of dates between two given dates", () => {
  const startDate = "02/07/24";

  const dates = listDates({
    startDate,
    jsonData: [
      { url: "x", analysisUTCTimestamp: "02/07/24" },
      { analysisUTCTimestamp: "04/08/24" },
    ],
  });

  expect(dates[0]).toEqual("02/07/24");
  expect(dates[dates.length - 1]).toEqual("04/08/24");
});

test("generates a list of dates between two given dates last 28 days", () => {
  const startDate = "02/07/24";

  const dates = listDates({
    startDate,
    jsonData: [
      { url: "x", analysisUTCTimestamp: "02/07/24" },
      { analysisUTCTimestamp: "04/08/24" },
    ],
    dateType: "last-28-days",
  });

  expect(dates[0]).toEqual("03/11/24");
  expect(dates[dates.length - 1]).toEqual("04/08/24");
});

test("generates a list of dates between two given dates", () => {
  const startDate = "02/07/24";

  const dates = listDates({
    startDate,
    jsonData: [
      { url: "x", analysisUTCTimestamp: "02/07/24" },
      { analysisUTCTimestamp: "04/08/24" },
    ],
    dateType: "last-2-months",
  });

  expect(dates[0]).toEqual("02/08/24");
  expect(dates[dates.length - 1]).toEqual("04/08/24");
});
