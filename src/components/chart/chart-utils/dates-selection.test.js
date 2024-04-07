// dates-selection.test.js
import { listDates } from "./dates-selection";

test("generates a list of dates between two given dates", () => {
  const startDate = "02/07";

  const dates = listDates({
    startDate,
    jsonData: [
      { url: "x", analysisUTCTimestamp: "02/07" },
      { analysisUTCTimestamp: "04/08" },
    ],
  });

  expect(dates[0]).toEqual("02/07");
  expect(dates[dates.length - 1]).toEqual("04/08");
});
