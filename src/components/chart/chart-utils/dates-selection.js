const earliest = "02/7/24";

function isBeforeOrSameDate(date1, date2) {
  return (
    date1.getUTCFullYear() < date2.getUTCFullYear() ||
    (date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() < date2.getUTCMonth()) ||
    (date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() <= date2.getUTCDate())
  );
}

function getPastDateByMonth(date, months) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() - months,
      date.getUTCDate()
    )
  );
}

function getPastDateByDays(date, days) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - days
    )
  );
}

export function toUTCDate(date) {
  const [month, day, year] = date.split("/");
  return new Date(Date.UTC(2000 + parseInt(year, 10), month - 1, day));
}

export function listDates({
  startDate = earliest,
  endDate = undefined,
  jsonData,
  dateType = "",
}) {
  let selectedEndDate = endDate;

  if (!selectedEndDate) {
    const latest = jsonData[jsonData.length - 1];
    selectedEndDate = latest.analysisUTCTimestamp;
  }

  let start_date = toUTCDate(startDate);
  const end_date = toUTCDate(selectedEndDate);
  console.log({ start_date, end_date, dateType });
  if (dateType === "last-28-days") {
    start_date = getPastDateByDays(end_date, 28);
  } else if (dateType.includes("last-") && dateType.includes("months")) {
    const months = parseInt(dateType.split("-")[1]);
    start_date = getPastDateByMonth(end_date, months);
    console.log({ start_date, end_date, months });
  }

  const dates = [];
  for (
    let d = start_date;
    isBeforeOrSameDate(d, end_date);
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const dateString = d.toISOString().split("T")[0];
    const [year, month, day] = dateString.split("-");
    const formattedDate = `${month}/${day}`;

    dates.push(formattedDate);
  }
  return dates;
}
