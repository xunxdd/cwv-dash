export function csvJSON(csv) {
  var lines = csv.split("\n");
  var result = [];

  var headers = lines[0].split(",");

  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    if (lines[i].length === 0) continue;
    var currentline = lines[i].split(",");

    if (currentline.length > 0) {
      for (var j = 0; j < headers.length; j++) {
        if (headers[j].trim()) {
          obj[headers[j]] = currentline[j];
        }
      }
    }

    result.push(obj);
  }
  return result; //JSON
}

export async function fetchData() {
  const response = await fetch("http://localhost:5000/api/data");
  const data = await response.text();
  return data;
}

export async function getCwvJsonDataset() {
  const csv = await fetchData();
  const data = csvJSON(csv);
  if (typeof window !== "undefined") {
    window.cwvDataSet = data;
  }
  return data;
}

getCwvJsonDataset();
