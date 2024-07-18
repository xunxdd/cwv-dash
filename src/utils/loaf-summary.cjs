const fs = require("fs").promises;
const path = require("path");

const rawJsonFilePath = path.join(__dirname, "./data/loaf.json");
// const worstEntriesFilePath = path.join(__dirname, "./data/worst-entries.json");
const parsedDataFilePath = path.join(__dirname, "./data/loaf-parsed.json");
const invokerFile = path.join(__dirname, "./data/invoker.csv");

const loafTableData = require(rawJsonFilePath);
const parsedData = require(parsedDataFilePath);

function filterTopEntries(data) {
  console.log("total entries", data.length);
  console.log(
    "INP great than 500",
    data.filter((entry) => entry.cwvScore > 500).length
  );
  return data.filter(
    (entry) => entry.cwvScore > 500 && entry.cwvLoaf.length > 0
  );
}

async function saveJsonData(filename, jsonData) {
  try {
    const data = JSON.stringify(jsonData, null, 2);
    await fs.writeFile(filename, data);
    console.log("JSON data is saved.");
  } catch (err) {
    console.error(err);
  }
}
const worstEntries = filterTopEntries(loafTableData);
console.log(
  "INP great than 500 and cwvLoaf data is not empty",
  worstEntries.length
);

// Function to convert JSON to CSV
function jsonToCSV(jsonData) {
  if (jsonData.length === 0) {
    return "";
  }

  const headers = Object.keys(jsonData[0]).join(",");
  const rows = jsonData.map((obj) => Object.values(obj).join(","));
  const csv = [headers, ...rows].join("\n");

  return csv;
}

function getLoafDataSummary() {
  const allLoadStates = parsedData.map((entry) =>
    entry.entriesDetails.map((detail) => detail.loadState)
  );

  // Step 2: Flatten the array of arrays
  const flattenedLoadStates = allLoadStates.flat();

  // Step 3: Remove duplicates
  const uniqueLoadStates = [...new Set(flattenedLoadStates)];

  uniqueLoadStates.forEach((state) => {
    const entries = parsedData.filter(
      (entry) => entry.entriesDetails[0].loadState === state
    );
    console.log(state, entries.length);
  });

  const sortedData = parsedData.sort((a, b) => a.cwvScore - b.cwvScore);

  const invokers = sortedData.map((entry) =>
    entry.entriesDetails.map((detail) => ({
      info: detail.entryInfo,
      cwvScore: entry.cwvScore,
      loadState: detail.loadState,
    }))
  );

  const invokerData = [];

  invokers.forEach((entries) => {
    entries.forEach((entry) => {
      const { info, cwvScore, loadState } = entry;
      const { entries } = info;
      entries.forEach((invoke) => {
        const { invoker } = invoke;

        //console.log(invoke);
        let invokeFile = "";

        if (invoker && invoker.startsWith("https")) {
          if (invoker.includes("_templates")) {
            invokeFile = "_templates";
          } else if (invoker.includes("_next/static/chunks/main")) {
            invokeFile = "main.js";
          } else if (invoker.includes("_next/static/chunks/pages/_app")) {
            invokeFile = "app.js";
          } else if (invoker.includes("_next/static/chunks/framework")) {
            invokeFile = "framework.js";
          } else if (invoker.includes("_assets/fre/scopes/hdm/")) {
            invokeFile = "hdm miscellaneous";
          } else {
            invokeFile = "other";
          }
        } else if (invoker) {
          if (invoker.includes("BUTTON#onetrust")) {
            invokeFile = "onetrust";
          } else if (
            invoker.includes("#document") ||
            invoker.includes("BODY") ||
            invoker.includes("DOMWindo") ||
            invoker.includes("HTML")
          ) {
            invokeFile = "domcument-body-DOMWindow";
          } else if (invoker.includes("SCRIPT")) {
            invokeFile = "script";
          } else if (invoker.includes("VIDEO")) {
            invokeFile = "video";
          } else {
            invokeFile = "other";
          }
        }
        // if (invoker.includes("_templates")) {
        //   invokeFile = "_templates";

        // } else if (invoker)

        invokerData.push({
          cwvScore,
          loadState,
          invoker,
          invokeCategory: invokeFile,
        });
      });
    }); // This is where the missing parenthesis was added
  });
  const invokeCategories = invokerData.map((entry) => entry.invokeCategory);
  const uniqueInvokeCategories = [...new Set(invokeCategories)];

  uniqueInvokeCategories.forEach((category) => {
    const entries = invokerData.filter(
      (entry) => entry.invokeCategory === category
    );
    console.log(category, entries.length);
  });

  //console.log(invokerData);
  // Convert JSON to CSV
  const csvData = jsonToCSV(invokerData);

  // Write CSV to a file
  fs.writeFile(invokerFile, csvData, (err) => {
    if (err) throw err;
    console.log("CSV file has been saved.");
  });
}

getLoafDataSummary();
//saveJsonData(jsonFilePath, worstEntries);
//saveJsonData(worstEntriesFilePath, worstEntries);
