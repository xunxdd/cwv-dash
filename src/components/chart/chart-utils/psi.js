import { chartData, getDataCollectionByUrls } from './chart-data.js';
import { htmlLegendPlugin } from './plugin.js';
import { listDates } from './dates-selection.js';
import { urls as allUrls } from './urls.js';
import { getCwvJsonDataset } from './csv-to-json.js';

import Chart from 'chart.js/auto';

export async function chart({ metricName, dates }) {
	const ctx = document.getElementById(metricName);
	const cwvData = chartData({ dates, metricName, allData: window.cwvDataSet });

	return new Chart(ctx, {
		type: 'line',
		data: cwvData,
		options: {
			plugins: {
				htmlLegend: {
					// ID of the container to put the legend in
					containerID: `${metricName}-container`,
				},
				legend: {
					display: false,
				},
			},
		},
		plugins: [htmlLegendPlugin],
	});
}

async function psiChart() {
	const dates = listDates({ startDate: '02/07', jsonData: window.cwvDataSet });

	try {
		console.log('psiChart');
		const data = await getDataCollectionByUrls({
			dates,
			pageUrls: allUrls.slice(0, 1),
		});
		if (data === undefined) return;
		chart({ metricName: 'CLS-score', data, dates });
		chart({ metricName: 'INP-percentile', data, dates });
		chart({ metricName: 'LCP-percentile', data, dates });
	} catch (error) {
		console.error(error);
	}
}

psiChart();
