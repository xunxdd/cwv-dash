const earliest = '02/7';

export function listDates({ startDate = earliest, endDate, jsonData }) {
	let selectedEndDate = endDate;
	let selectedStartDate = startDate;

	if (!selectedEndDate) {
		const latest = jsonData[jsonData.length - 1];
		const lastDate = latest.analysisUTCTimestamp;
		if (lastDate) {
			selectedEndDate = lastDate.slice(5, 7) + '/' + lastDate.slice(8, 10);
		}
	}

	const start = selectedStartDate.split('/').map(Number);
	const end = selectedEndDate.split('/').map(Number);

	const start_date = new Date(2024, start[0] - 1, start[1]); // assuming year 2022
	const end_date = new Date(2024, end[0] - 1, end[1]); // assuming year 2022
	const dates = [];
	for (let d = start_date; d <= end_date; d.setDate(d.getDate() + 1)) {
		dates.push(
			(d.getMonth() + 1).toString().padStart(2, '0') +
				'/' +
				d.getDate().toString().padStart(2, '0'),
		);
	}
	return dates;
}
