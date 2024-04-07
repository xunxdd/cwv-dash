const earliest = "02/7";

export function listDates({
  startDate = earliest,
  endDate = undefined,
  jsonData,
}) {
  let selectedEndDate = endDate;
  let selectedStartDate = startDate;

  if (!selectedEndDate) {
    const latest = jsonData[jsonData.length - 1];
    selectedEndDate = latest.analysisUTCTimestamp;
  }

  const start = selectedStartDate.split("/").map(Number);
  const end = selectedEndDate.split("/").map(Number);

  const start_date = new Date(2024, start[0] - 1, start[1]); // assuming year 2022
  const end_date = new Date(2024, end[0] - 1, end[1]); // assuming year 2022
  const dates = [];
  for (let d = start_date; d <= end_date; d.setDate(d.getDate() + 1)) {
    dates.push(
      (d.getMonth() + 1).toString().padStart(2, "0") +
        "/" +
        d.getDate().toString().padStart(2, "0")
    );
  }
  return dates;
}
