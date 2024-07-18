const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const csvFilePath = path.join(__dirname, "./data/loaf.csv");
const jsonFilePath = path.join(__dirname, "./data/loaf.json");
const results = [];

console.log(path.join(__dirname, "loaf.json"));
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    fs.writeFile(jsonFilePath, JSON.stringify(results, null, 4), (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
      } else {
        console.log("JSON file has been saved.");
      }
    });
  });
