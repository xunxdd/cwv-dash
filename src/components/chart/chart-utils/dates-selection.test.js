// dates-selection.test.js
import { listDates } from './dates-selection';

test('generates a list of dates between two given dates', () => {
	const startDate = '02/07';

	const dates = listDates({
		startDate,
		jsonData: [
			{ url: 'x', analysisUTCTimestamp: '2024-02-07T00:00:00Z' },
			{ analysisUTCTimestamp: '2024-04-08T00:00:00Z' },
		],
	});

	expect(dates[0]).toEqual('02/07');
	expect(dates[dates.length - 1]).toEqual('04/08');
});
