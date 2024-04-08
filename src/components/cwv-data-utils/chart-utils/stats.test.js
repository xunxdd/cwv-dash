import { sortCWVData } from "../stats"; // adjust the path to your stats.js file
import testData from "./test-data.json";

describe("sortCWVData", () => {
  it("should sort data by INP value", () => {
    const data = testData;
    const sortedData = sortCWVData(data);
    expect(sortedData[0].INP).toBe("222.0 ms");
    expect(sortedData[sortedData.length - 1].INP).toBe("1489.0 ms");
  });

  it("should only sort data from the last day by CLS", () => {
    const sortedData = sortCWVData(testData, "CLS");
    expect(sortedData.length).toBe(25);
    expect(sortedData[0].CLS).toBe("0");
    expect(sortedData[sortedData.length - 1].CLS).toBe("0.59");
  });

  it("should only sort data from the last day by CLS", () => {
    const sortedData = sortCWVData(testData, "LCP");
    expect(sortedData.length).toBe(25);
    expect(sortedData[0].LCP).toBe("1.257 s");
    expect(sortedData[sortedData.length - 1].LCP).toBe("3.028 s");
  });
});
