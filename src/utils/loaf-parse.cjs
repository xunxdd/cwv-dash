const fs = require("fs").promises;
const path = require("path");

const rawJsonFilePath = path.join(__dirname, "./data/loaf.json");

const loafTableData = require(rawJsonFilePath);

async function saveJsonData(filename, jsonData) {
  try {
    const data = JSON.stringify(jsonData, null, 2);
    await fs.writeFile(filename, data);
    console.log("JSON data is saved.");
  } catch (err) {
    console.error(err);
  }
}

// Usage
function splitStringIntoParts(str) {
  if (!str) return null;
  const firstUnderscoreIndex = str.indexOf("_");
  const secondUnderscoreIndex = str.indexOf("_", firstUnderscoreIndex + 1);

  const key = str.substring(0, firstUnderscoreIndex);
  const index = str.substring(firstUnderscoreIndex + 1, secondUnderscoreIndex);
  const value = str.substring(secondUnderscoreIndex + 1);

  const result = {};
  if (key) {
    result[key] = value;
  } else {
    result.duration = parseFloat(value);
  }

  if (index) {
    result.index = parseInt(index, 10);
  }

  return result;
}

function groupAndSortByIndex(data) {
  // Group by index
  const grouped = data.reduce((acc, item) => {
    acc[item.index] = acc[item.index] || [];
    acc[item.index].push(item);
    return acc;
  }, {});

  const groupedArray = Object.values(grouped);

  groupedArray.forEach((group) => {
    group.sort((a, b) => (a.start || 0) - (b.start || 0));
  });

  // Since the keys are string, convert them to numbers for sorting
  return groupedArray.sort((a, b) => Number(a[0].index) - Number(b[0].index));
}

function getEntryInfo(entryInfo) {
  const data = [];

  const invoke = [];
  entryInfo.forEach((str) => {
    const result = splitStringIntoParts(str);
    if (result) {
      invoke.push(result);
    }
  });

  const final = groupAndSortByIndex(invoke);

  const flattened = final.map((group) => {
    const flattened = { index: group[0].index }; // Initialize with index
    group.forEach((item) => {
      Object.assign(flattened, item); // Merge item properties into flattened object
    });
    return flattened;
  });

  return flattened;
}

function parseCsvLoaf(data) {
  if (!data) return [];
  const events = data.split("|");
  const entries = [];
  if (events.length === 0) return;
  let loadState = "";
  events.forEach((event, index) => {
    const eventData = event.split(",");
    let values = [];
    if (index === 0 && eventData[0].startsWith("load_state_")) {
      loadState = eventData[0].replace("load_state_", "");
      values = eventData.slice(1);
    }
    const entryInfo = getEntryInfo(values);
    const details = {};
    if (entryInfo?.length > 0) {
      const duration = entryInfo.find((item) => item.duration);
      if (duration) {
        details.duration = duration.duration;
        details.entries = entryInfo.filter((item) => !item.duration);
      } else {
        details.entries = entryInfo;
      }
    }

    if (Object.keys(details).length > 0) {
      entries.push({ loadState, entryInfo: details });
    }
  });

  return entries;
}

function parseLoafData(LoAFData = loafTableData) {
  const inpLoafData = [];

  if (!LoAFData) return inpLoafData;
  LoAFData.forEach((data) => {
    const {
      cwvLoaf,
      cwvScore,
      page_location: page,
      geo_country,
      device_category,
      hostname,
      event_timestamp,
    } = data;

    if (!page || !cwvLoaf) return;
    const inpEntries = parseCsvLoaf(cwvLoaf);
    // console.log({ inpEntries });
    inpLoafData.push({
      cwvScore,
      page,
      entries: inpEntries.length,
      entriesDetails: inpEntries,
      geo_country,
      device_category,
      hostname,
      event_timestamp,
    });
  });

  return inpLoafData;
}

const jsonFilePath = path.join(__dirname, "./data/loaf-parsed.json");
const jsonFilePath2 = path.join(__dirname, "../assets/sample-data/loaf.json");
const parsedData = parseLoafData();
//console.log(parsedData);
saveJsonData(jsonFilePath, parsedData);
saveJsonData(jsonFilePath2, parsedData);
