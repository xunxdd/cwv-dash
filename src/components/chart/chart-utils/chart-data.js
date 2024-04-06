import colorLib from '@kurkle/color';
import { colors } from './colors.js';

export async function getDataCollectionByUrls({ dates, pageUrls, allData }) {
	const jsonData = allData;

	const dataCollection = {};
	pageUrls.forEach((url) => {
		const cvwData = jsonData.filter((cvwData) => {
			return cvwData.URL === url;
		});
		dataCollection[url] = cvwData;
	});
	const cwvDataByUrl = {};

	Object.keys(dataCollection).forEach((url) => {
		const rows = dataCollection[url];
		const data = {};
		rows.forEach((row) => {
			let dateString = row.analysisUTCTimestamp;
			if (dateString) {
				dateString = dateString.slice(5, 7) + '/' + dateString.slice(8, 10);
				if (dates.includes(dateString)) {
					data[dateString] = row;
				}
			}
		});
		cwvDataByUrl[url] = data;
	});

	return cwvDataByUrl;
}

/**
 *
 * @param {*} metricName
 * @param {*} allData
 * @returns chart of a specific metric by name given by the data for specific urls
 */
export function chartData({ dates, metricName, allData = {} }) {
	const datasets = [];
	Object.keys(allData).forEach((url, index) => {
		const data = allData[url];
		const dataPoints = [];
		const color = colors[index];
		dates.forEach((date) => {
			const row = data[date];
			if (row) {
				dataPoints.push(
					typeof row[metricName] === 'string'
						? parseFloat(row[metricName])
						: undefined,
				);
			} else {
				dataPoints.push(undefined);
			}
		});

		datasets.push({
			label: `${url}`,
			data: dataPoints,
			lineTension: 0,
			fill: false,
			backgroundColor: colorLib(color).alpha(0.5).rgbString(),
			borderColor: color,
		});
	});

	return {
		labels: dates,
		datasets,
	};
}
